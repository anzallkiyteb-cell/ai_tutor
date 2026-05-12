import path from 'path'
import fs from 'fs'

export interface ParsedDocument {
  text: string
  sections: Section[]
}

export interface Section {
  title: string
  content: string
  index: number
}

export async function parseDocx(filePath: string): Promise<ParsedDocument> {
  const mammoth = await import('mammoth')
  const result = await mammoth.extractRawText({ path: filePath })
  const text = result.value
  return { text, sections: splitIntoSections(text) }
}

export async function parsePdf(filePath: string): Promise<ParsedDocument> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfParse: any = (await import('pdf-parse'))
  const buffer = fs.readFileSync(filePath)
  const parse = pdfParse.default ?? pdfParse
  const data = await parse(buffer)
  const text = data.text
  return { text, sections: splitIntoSections(text) }
}

function splitIntoSections(text: string): Section[] {
  const lines = text.split('\n').filter((l) => l.trim())
  const sections: Section[] = []
  let current: Section | null = null
  let index = 0

  for (const line of lines) {
    const isHeading =
      /^(chapitre|partie|section|i{1,3}v?|vi{0,3}|[1-9][\.\)]|exercice|devoir)/i.test(
        line.trim()
      ) && line.trim().length < 120

    if (isHeading) {
      if (current) sections.push(current)
      current = { title: line.trim(), content: '', index: index++ }
    } else if (current) {
      current.content += line + '\n'
    } else {
      current = { title: 'Introduction', content: line + '\n', index: index++ }
    }
  }

  if (current) sections.push(current)
  return sections
}

export function getDocumentPath(filename: string): string {
  return path.join(process.cwd(), 'public', 'data', filename)
}
