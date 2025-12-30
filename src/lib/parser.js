import { marked } from "marked"

/**
 * Parses markdown into a list of high-level UI component definitions
 * based on specific structural patterns.
 */
export function parseMarkdownToComponents(markdown) {
  const tokens = marked.lexer(markdown)
  const components = []

  let i = 0
  while (i < tokens.length) {
    const token = tokens[i]

    // HERO: H1 followed by text/link/image
    if (token.type === "heading" && token.depth === 1) {
      const hero = { type: "hero", title: token.text, content: "", links: [], image: null }
      i++
      while (i < tokens.length && tokens[i].type !== "heading") {
        const next = tokens[i]
        if (next.type === "paragraph") {
          // Check for image in paragraph
          const imgMatch = next.text.match(/!\[(.*?)\]$$(.*?)$$/)
          if (imgMatch) {
            hero.image = imgMatch[2]
          } else {
            hero.content += next.text + " "
          }
        }
        if (next.type === "list") {
          next.items.forEach((item) => {
            const linkMatch = item.text.match(/\[(.*?)\]$$(.*?)$$/)
            if (linkMatch) hero.links.push({ label: linkMatch[1], href: linkMatch[2] })
          })
        }
        i++
      }
      components.push(hero)
      continue
    }

    // LOGOS: List containing only images
    if (token.type === "list") {
      const allImages = token.items.every((item) => item.text.match(/!\[(.*?)\]$$(.*?)$$/))
      if (allImages) {
        const logos = token.items.map((item) => {
          const match = item.text.match(/!\[(.*?)\]$$(.*?)$$/)
          return { alt: match[1], src: match[2] }
        })
        components.push({ type: "logos", items: logos })
        i++
        continue
      }
    }

    // CARDS: H2 followed by a list of items with images/text
    if (token.type === "heading" && token.depth === 2) {
      const sectionTitle = token.text
      i++
      if (i < tokens.length && tokens[i].type === "list") {
        const cards = tokens[i].items.map((item) => {
          const imgMatch = item.text.match(/!\[(.*?)\]$$(.*?)$$/)
          const titleMatch = item.text.match(/\*\*(.*?)\*\*/)
          const linkMatch = item.text.match(/\[(.*?)\]$$(.*?)$$/)

          return {
            image: imgMatch ? imgMatch[2] : null,
            title: titleMatch ? titleMatch[1] : "Feature",
            text: item.text
              .replace(/!\[.*?\]$$.*?$$/, "")
              .replace(/\*\*.*?\*\*/, "")
              .replace(/\[.*?\]$$.*?$$/, "")
              .trim(),
            link: linkMatch ? { label: linkMatch[1], href: linkMatch[2] } : null,
          }
        })
        components.push({ type: "cards", title: sectionTitle, items: cards })
        i++
        continue
      }
    }

    // CTA: H3 followed by text and link
    if (token.type === "heading" && token.depth === 3) {
      const cta = { type: "cta", title: token.text, content: "", link: null }
      i++
      while (i < tokens.length && tokens[i].type !== "heading") {
        const next = tokens[i]
        if (next.type === "paragraph") {
          const linkMatch = next.text.match(/\[(.*?)\]$$(.*?)$$/)
          if (linkMatch) {
            cta.link = { label: linkMatch[1], href: linkMatch[2] }
          } else {
            cta.content += next.text + " "
          }
        }
        i++
      }
      components.push(cta)
      continue
    }

    // Default: Just wrap in a generic section if unhandled
    if (token.type === "paragraph") {
      components.push({ type: "text", content: token.text })
    }

    i++
  }

  return components
}
