#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const [iconsetDir, outFile] = process.argv.slice(2)

if (!iconsetDir || !outFile) {
  console.error('Usage: make-icns.mjs ICONSET_DIR OUT_FILE')
  process.exit(1)
}

const entries = [
  ['icp4', 'icon_16x16.png'],
  ['icp5', 'icon_32x32.png'],
  ['icp6', 'icon_32x32@2x.png'],
  ['ic07', 'icon_128x128.png'],
  ['ic08', 'icon_256x256.png'],
  ['ic09', 'icon_512x512.png'],
  ['ic10', 'icon_512x512@2x.png']
]

const chunkFor = (type, filename) => {
  const file = path.join(iconsetDir, filename)
  const data = fs.readFileSync(file)
  const header = Buffer.alloc(8)
  header.write(type, 0, 4, 'ascii')
  header.writeUInt32BE(data.length + 8, 4)
  return Buffer.concat([header, data])
}

const chunks = entries.map(([type, filename]) => chunkFor(type, filename))
const totalLength = 8 + chunks.reduce((sum, chunk) => sum + chunk.length, 0)
const header = Buffer.alloc(8)
header.write('icns', 0, 4, 'ascii')
header.writeUInt32BE(totalLength, 4)

fs.writeFileSync(outFile, Buffer.concat([header, ...chunks], totalLength))
console.log(`Wrote ${outFile}`)
