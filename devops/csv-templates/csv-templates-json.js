export const csvTemplateJSON = (sections) => {
  return `
{
  "sections": {
    ${
      sections.map((section, index) => {
        return `
    "${section.section_filename}_${index}": {
      "type": "${section.section_filename}",
      "settings": {
      }
    }
        `.trim()
      }).join(',\n    ')
    }
  },
  "order": [
    ${
      sections.map((section, index) => {
        return `
      "${section.section_filename}_${index}"
        `.trim()
      }).join(',\n    ')
    }
  ]
}
  `.trim()
}
