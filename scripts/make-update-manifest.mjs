#!/usr/bin/env node
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const semverPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/

const assertPlainYamlValue = (name, value) => {
  if (typeof value !== 'string' || !value || /[\r\n:#]/.test(value)) {
    throw new Error(`${name} must be a non-empty plain YAML value`)
  }
}

export const createMacUpdateManifest = ({ version, fileName, size, sha512, releaseDate }) => {
  if (!semverPattern.test(version)) {
    throw new Error(`version must be a semantic version: ${version}`)
  }
  assertPlainYamlValue('fileName', fileName)
  assertPlainYamlValue('sha512', sha512)
  if (!Number.isSafeInteger(size) || size <= 0) {
    throw new Error(`size must be a positive integer: ${size}`)
  }
  if (Number.isNaN(Date.parse(releaseDate))) {
    throw new Error(`releaseDate must be an ISO date: ${releaseDate}`)
  }

  return [
    `version: ${version}`,
    'files:',
    `  - url: ${fileName}`,
    `    sha512: ${sha512}`,
    `    size: ${size}`,
    `path: ${fileName}`,
    `sha512: ${sha512}`,
    `releaseDate: ${releaseDate}`,
    ''
  ].join('\n')
}

export const sha512Base64 = (filePath) => {
  const hash = crypto.createHash('sha512')
  hash.update(fs.readFileSync(filePath))
  return hash.digest('base64')
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMain) {
  const [version, zipPath, outputPath, releaseDate = new Date().toISOString()] = process.argv.slice(2)
  if (!version || !zipPath || !outputPath) {
    throw new Error('Usage: make-update-manifest.mjs <version> <zip> <output> [release-date]')
  }
  const manifest = createMacUpdateManifest({
    version,
    fileName: path.basename(zipPath),
    size: fs.statSync(zipPath).size,
    sha512: sha512Base64(zipPath),
    releaseDate
  })
  fs.writeFileSync(outputPath, manifest)
  console.log(`Created ${outputPath}`)
}
