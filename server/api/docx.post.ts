import {
  readFileSync,
  unlink,
  writeFileSync,
} from 'node:fs'
import { join } from 'node:path'
import Docxtemplater from 'docxtemplater'
import htmlToDocx from 'html-to-docx'
import PizZip from 'pizzip'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const fileBuffer = await htmlToDocx(body.html)

  const filePath = join('temp', `draft.docx`)
  writeFileSync(filePath, fileBuffer)
  const templateBuffer = readFileSync(filePath)
  const zip = new PizZip(templateBuffer)
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  })

  doc.render(body.docxObj)

  const out = doc.getZip().generate({
    type: 'blob',
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })

  unlink(filePath, (err) => {
    if (err)
      throw err
  })

  return out
})
