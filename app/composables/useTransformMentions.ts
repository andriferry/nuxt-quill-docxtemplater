export function useTransformMentions(): any {
  const transformMentions = (htmlString: string): string => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlString, 'text/html')

    const mentionElements = doc.querySelectorAll('.mention')

    mentionElements.forEach((el) => {
      const rawValue = el.getAttribute('data-value')

      if (rawValue) {
        const clean = rawValue.replace(/[{}]/g, '')

        const parts = clean.split('.') // split group.field

        // CASE 1: root level → proposalNumber
        if (parts.length === 1) {
          const field = parts[0]
          el.innerHTML = `{${field}}`
        }

        // CASE 2: nested group → person.firstName
        if (parts.length === 2) {
          const group = parts[0]
          const field = parts[1]

          // Docxtemplater compatible format
          const newValue = `{#${group}}{${field}}{/${group}}`

          el.innerHTML = newValue
        }
      }
    })

    return doc.body.innerHTML
  }

  return { transformMentions }
}
