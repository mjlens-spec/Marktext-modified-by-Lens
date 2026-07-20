import AppKit
import Foundation

enum ReversionMarkdownRenderer {
    static let paperColor = NSColor(calibratedRed: 0.965, green: 0.972, blue: 0.978, alpha: 1)
    static let textColor = NSColor(calibratedRed: 0.11, green: 0.14, blue: 0.17, alpha: 1)
    static let mutedColor = NSColor(calibratedRed: 0.39, green: 0.44, blue: 0.49, alpha: 1)
    static let accentColor = NSColor(calibratedRed: 0.04, green: 0.39, blue: 0.48, alpha: 1)
    private static let codeColor = NSColor(calibratedRed: 0.34, green: 0.17, blue: 0.25, alpha: 1)
    private static let codeBackground = NSColor(calibratedRed: 0.91, green: 0.93, blue: 0.95, alpha: 1)
    private static let quoteBackground = NSColor(calibratedRed: 0.93, green: 0.95, blue: 0.96, alpha: 1)

    static func render(_ markdown: String, fileName: String) -> NSAttributedString {
        let output = NSMutableAttributedString()
        appendDocumentLabel(fileName, to: output)

        let normalized = markdown.replacingOccurrences(of: "\r\n", with: "\n")
            .replacingOccurrences(of: "\r", with: "\n")
        let lines = normalized.components(separatedBy: "\n")
        var paragraph: [String] = []
        var codeLines: [String] = []
        var inFence = false
        var fenceMarker = ""
        var codeLanguage = ""

        func flushParagraph() {
            guard !paragraph.isEmpty else { return }
            appendInline(paragraph.joined(separator: " "), style: .body, to: output)
            paragraph.removeAll(keepingCapacity: true)
        }

        func flushCode() {
            appendCode(codeLines.joined(separator: "\n"), language: codeLanguage, to: output)
            codeLines.removeAll(keepingCapacity: true)
            codeLanguage = ""
        }

        for line in lines {
            let trimmed = line.trimmingCharacters(in: .whitespaces)

            if inFence {
                if trimmed.hasPrefix(fenceMarker) {
                    inFence = false
                    flushCode()
                } else {
                    codeLines.append(line)
                }
                continue
            }

            if let fence = fenceStart(in: trimmed) {
                flushParagraph()
                inFence = true
                fenceMarker = fence.marker
                codeLanguage = fence.language
                continue
            }

            if trimmed.isEmpty {
                flushParagraph()
                continue
            }

            if let heading = heading(in: trimmed) {
                flushParagraph()
                appendInline(heading.text, style: .heading(heading.level), to: output)
            } else if let item = listItem(in: line) {
                flushParagraph()
                appendListItem(item, to: output)
            } else if trimmed.hasPrefix(">") {
                flushParagraph()
                let quote = trimmed.dropFirst().trimmingCharacters(in: .whitespaces)
                appendInline(String(quote), style: .quote, to: output)
            } else if isHorizontalRule(trimmed) {
                flushParagraph()
                appendRule(to: output)
            } else if looksLikeTable(line) {
                flushParagraph()
                appendInline(line, style: .table, to: output)
            } else {
                paragraph.append(trimmed)
            }
        }

        flushParagraph()
        if inFence || !codeLines.isEmpty {
            flushCode()
        }
        return output
    }

    private enum BlockStyle {
        case body
        case heading(Int)
        case quote
        case table
    }

    private struct ListItem {
        let prefix: String
        let text: String
        let level: Int
        let checked: Bool?
    }

    private static func appendDocumentLabel(_ fileName: String, to output: NSMutableAttributedString) {
        let style = paragraphStyle(spacingAfter: 26, lineHeight: 18)
        output.append(NSAttributedString(string: "反文  ·  \(fileName)\n", attributes: [
            .font: NSFont.systemFont(ofSize: 12, weight: .semibold),
            .foregroundColor: accentColor,
            .paragraphStyle: style,
            .kern: 0.4
        ]))
    }

    private static func appendInline(_ source: String, style: BlockStyle, to output: NSMutableAttributedString) {
        let configuration = AttributedString.MarkdownParsingOptions(
            interpretedSyntax: .inlineOnlyPreservingWhitespace,
            failurePolicy: .returnPartiallyParsedIfPossible
        )
        let parsed = (try? AttributedString(markdown: source, options: configuration)) ?? AttributedString(source)
        let rendered = NSMutableAttributedString(attributedString: NSAttributedString(parsed))

        let baseFont: NSFont
        let paragraph: NSMutableParagraphStyle
        let color: NSColor
        switch style {
        case .body:
            baseFont = bodyFont(size: 16)
            paragraph = paragraphStyle(spacingAfter: 13, lineHeight: 27)
            color = textColor
        case .heading(let level):
            let sizes: [CGFloat] = [0, 31, 25, 21, 18, 16, 15]
            baseFont = headingFont(size: sizes[min(max(level, 1), 6)], weight: level <= 2 ? .bold : .semibold)
            paragraph = paragraphStyle(spacingBefore: level == 1 ? 22 : 16, spacingAfter: level == 1 ? 14 : 10, lineHeight: sizes[min(max(level, 1), 6)] * 1.3)
            color = level <= 4 ? textColor : mutedColor
        case .quote:
            baseFont = bodyFont(size: 15.5)
            paragraph = paragraphStyle(spacingAfter: 14, lineHeight: 25)
            paragraph.headIndent = 20
            paragraph.firstLineHeadIndent = 20
            paragraph.tailIndent = -20
            color = mutedColor
            rendered.addAttribute(.backgroundColor, value: quoteBackground, range: NSRange(location: 0, length: rendered.length))
        case .table:
            baseFont = NSFont.monospacedSystemFont(ofSize: 13, weight: .regular)
            paragraph = paragraphStyle(spacingAfter: 6, lineHeight: 21)
            color = mutedColor
        }

        rendered.addAttributes([
            .font: baseFont,
            .foregroundColor: color,
            .paragraphStyle: paragraph
        ], range: NSRange(location: 0, length: rendered.length))
        styleInlineIntents(in: rendered, baseFont: baseFont)
        rendered.append(NSAttributedString(string: "\n", attributes: [.paragraphStyle: paragraph]))
        output.append(rendered)
    }

    private static func styleInlineIntents(in text: NSMutableAttributedString, baseFont: NSFont) {
        let fullRange = NSRange(location: 0, length: text.length)
        let inlineIntentKey = NSAttributedString.Key("NSInlinePresentationIntent")
        text.enumerateAttribute(inlineIntentKey, in: fullRange) { value, range, _ in
            guard let raw = value as? NSNumber else { return }
            let intent = raw.intValue
            var font = baseFont
            if intent & 2 != 0 {
                font = NSFontManager.shared.convert(font, toHaveTrait: .boldFontMask)
            }
            if intent & 1 != 0 {
                font = NSFontManager.shared.convert(font, toHaveTrait: .italicFontMask)
            }
            if intent & 4 != 0 {
                font = NSFont.monospacedSystemFont(ofSize: max(12, baseFont.pointSize - 1), weight: .regular)
                text.addAttributes([
                    .backgroundColor: codeBackground,
                    .foregroundColor: codeColor
                ], range: range)
            }
            if intent & 8 != 0 {
                text.addAttribute(.strikethroughStyle, value: NSUnderlineStyle.single.rawValue, range: range)
            }
            text.addAttribute(.font, value: font, range: range)
        }
        text.enumerateAttribute(.link, in: fullRange) { value, range, _ in
            guard value != nil else { return }
            text.addAttributes([
                .foregroundColor: accentColor,
                .underlineStyle: NSUnderlineStyle.single.rawValue
            ], range: range)
        }
    }

    private static func appendListItem(_ item: ListItem, to output: NSMutableAttributedString) {
        let paragraph = paragraphStyle(spacingAfter: 5, lineHeight: 24)
        let indent = CGFloat(22 + item.level * 20)
        paragraph.firstLineHeadIndent = CGFloat(item.level * 20)
        paragraph.headIndent = indent
        paragraph.tabStops = [NSTextTab(textAlignment: .left, location: indent)]

        let marker: String
        if let checked = item.checked {
            marker = checked ? "☑" : "☐"
        } else {
            marker = item.prefix
        }
        let prefix = NSAttributedString(string: "\(marker)\t", attributes: [
            .font: NSFont.systemFont(ofSize: 15, weight: .medium),
            .foregroundColor: accentColor,
            .paragraphStyle: paragraph
        ])
        output.append(prefix)

        let configuration = AttributedString.MarkdownParsingOptions(
            interpretedSyntax: .inlineOnlyPreservingWhitespace,
            failurePolicy: .returnPartiallyParsedIfPossible
        )
        let parsed = (try? AttributedString(markdown: item.text, options: configuration)) ?? AttributedString(item.text)
        let content = NSMutableAttributedString(attributedString: NSAttributedString(parsed))
        let font = bodyFont(size: 15.5)
        content.addAttributes([
            .font: font,
            .foregroundColor: textColor,
            .paragraphStyle: paragraph
        ], range: NSRange(location: 0, length: content.length))
        styleInlineIntents(in: content, baseFont: font)
        content.append(NSAttributedString(string: "\n", attributes: [.paragraphStyle: paragraph]))
        output.append(content)
    }

    private static func appendCode(_ code: String, language: String, to output: NSMutableAttributedString) {
        let paragraph = paragraphStyle(spacingBefore: 8, spacingAfter: 16, lineHeight: 21)
        paragraph.firstLineHeadIndent = 14
        paragraph.headIndent = 14
        paragraph.tailIndent = -14
        if !language.isEmpty {
            output.append(NSAttributedString(string: language.uppercased() + "\n", attributes: [
                .font: NSFont.monospacedSystemFont(ofSize: 10.5, weight: .semibold),
                .foregroundColor: accentColor,
                .paragraphStyle: paragraph
            ]))
        }
        output.append(NSAttributedString(string: code + "\n", attributes: [
            .font: NSFont.monospacedSystemFont(ofSize: 13.5, weight: .regular),
            .foregroundColor: codeColor,
            .backgroundColor: codeBackground,
            .paragraphStyle: paragraph
        ]))
    }

    private static func appendRule(to output: NSMutableAttributedString) {
        let paragraph = paragraphStyle(spacingBefore: 10, spacingAfter: 18, lineHeight: 16)
        output.append(NSAttributedString(string: "────────────────────────────────────────\n", attributes: [
            .font: NSFont.systemFont(ofSize: 12),
            .foregroundColor: NSColor(calibratedWhite: 0.72, alpha: 1),
            .paragraphStyle: paragraph
        ]))
    }

    private static func heading(in line: String) -> (level: Int, text: String)? {
        var level = 0
        for character in line {
            guard character == "#", level < 6 else { break }
            level += 1
        }
        guard level > 0 else { return nil }
        let index = line.index(line.startIndex, offsetBy: level)
        guard index < line.endIndex, line[index].isWhitespace else { return nil }
        return (level, line[index...].trimmingCharacters(in: .whitespaces))
    }

    private static func fenceStart(in line: String) -> (marker: String, language: String)? {
        if line.hasPrefix("```") {
            return ("```", String(line.dropFirst(3)).trimmingCharacters(in: .whitespaces))
        }
        if line.hasPrefix("~~~") {
            return ("~~~", String(line.dropFirst(3)).trimmingCharacters(in: .whitespaces))
        }
        return nil
    }

    private static func listItem(in line: String) -> ListItem? {
        let leading = line.prefix { $0 == " " || $0 == "\t" }
        let level = leading.reduce(0) { $1 == "\t" ? $0 + 1 : $0 } + leading.filter { $0 == " " }.count / 2
        let content = String(line.dropFirst(leading.count))

        if content.hasPrefix("- [ ] ") || content.hasPrefix("* [ ] ") {
            return ListItem(prefix: "•", text: String(content.dropFirst(6)), level: level, checked: false)
        }
        if content.hasPrefix("- [x] ") || content.hasPrefix("- [X] ") || content.hasPrefix("* [x] ") || content.hasPrefix("* [X] ") {
            return ListItem(prefix: "•", text: String(content.dropFirst(6)), level: level, checked: true)
        }
        for marker in ["- ", "* ", "+ "] where content.hasPrefix(marker) {
            return ListItem(prefix: "•", text: String(content.dropFirst(2)), level: level, checked: nil)
        }

        let digits = content.prefix { $0.isNumber }
        if !digits.isEmpty {
            let rest = content.dropFirst(digits.count)
            if rest.hasPrefix(". ") || rest.hasPrefix(") ") {
                return ListItem(prefix: String(digits) + String(rest.prefix(1)), text: String(rest.dropFirst(2)), level: level, checked: nil)
            }
        }
        return nil
    }

    private static func isHorizontalRule(_ line: String) -> Bool {
        let compact = line.replacingOccurrences(of: " ", with: "")
        guard compact.count >= 3, let first = compact.first, ["-", "*", "_"].contains(String(first)) else {
            return false
        }
        return compact.allSatisfy { $0 == first }
    }

    private static func looksLikeTable(_ line: String) -> Bool {
        let trimmed = line.trimmingCharacters(in: .whitespaces)
        return trimmed.hasPrefix("|") && trimmed.hasSuffix("|") && trimmed.filter { $0 == "|" }.count >= 2
    }

    private static func paragraphStyle(
        spacingBefore: CGFloat = 0,
        spacingAfter: CGFloat,
        lineHeight: CGFloat
    ) -> NSMutableParagraphStyle {
        let style = NSMutableParagraphStyle()
        style.paragraphSpacingBefore = spacingBefore
        style.paragraphSpacing = spacingAfter
        style.minimumLineHeight = lineHeight
        style.maximumLineHeight = lineHeight
        style.lineBreakMode = .byWordWrapping
        return style
    }

    private static func bodyFont(size: CGFloat) -> NSFont {
        NSFont(name: "Noto Sans SC", size: size)
            ?? NSFont(name: "PingFang SC", size: size)
            ?? NSFont.systemFont(ofSize: size)
    }

    private static func headingFont(size: CGFloat, weight: NSFont.Weight) -> NSFont {
        NSFont(name: "LXGW WenKai", size: size)
            ?? NSFont(name: "Songti SC", size: size)
            ?? NSFont.systemFont(ofSize: size, weight: weight)
    }
}
