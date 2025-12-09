import {
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { join } from 'node:path'
import Docxtemplater from 'docxtemplater'
import htmlToDocx from 'html-to-docx'
import PizZip from 'pizzip'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const fileBuffer = await htmlToDocx(body.html, {
    margin: {
      top: 720,
      right: 720,
      bottom: 720,
      left: 720,
    },
  })

  const filePath = join('temp', `draft.docx`)
  writeFileSync(filePath, fileBuffer)
  const templateBuffer = readFileSync(filePath)
  const zip = new PizZip(templateBuffer)
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  })

  doc.render({
    companyName: 'Apple',
    firstName: 'john',
    secondName: 'doe',
  })

  const out = doc.getZip().generate({
    type: 'blob',
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })

  return out
})
