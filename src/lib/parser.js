import { marked } from "marked"

/**
 * Extracts HTML comment markers from markdown
 * Returns array of { type, start, end, isClosing } for each comment
 */
function extractCommentMarkers(markdown) {
  const markers = []
  // Match HTML comments like <!--cards--> or <!--/cards-->
  const commentRegex = /<!--\s*(\/?)(\w+)\s*-->/g
  let match
  
  while ((match = commentRegex.exec(markdown)) !== null) {
    const isClosing = match[1] === '/'
    const type = match[2].toLowerCase()
    markers.push({
      type,
      isClosing,
      position: match.index,
      length: match[0].length
    })
  }
  
  return markers
}

/**
 * Parses markdown sections based on HTML comment markers
 */
function parseWithCommentMarkers(markdown, markers) {
  const components = []
  const stack = [] // Track nested sections
  
  // Sort markers by position
  markers.sort((a, b) => a.position - b.position)
  
  let lastEnd = 0
  
  for (let i = 0; i < markers.length; i++) {
    const marker = markers[i]
    
    if (marker.isClosing) {
      // Find matching opening marker (search from end of stack)
      let openingIndex = -1
      for (let j = stack.length - 1; j >= 0; j--) {
        if (stack[j].type === marker.type && !stack[j].isClosing) {
          openingIndex = j
          break
        }
      }
      if (openingIndex === -1) continue // No matching opening found
      
      const opening = stack[openingIndex]
      stack.splice(openingIndex, 1) // Remove from stack
      
      // Extract content between markers (excluding the comments themselves)
      const contentStart = opening.position + opening.length
      const contentEnd = marker.position
      const sectionContent = markdown.substring(contentStart, contentEnd).trim()
      
      // Remove comment markers from content for parsing
      const cleanContent = sectionContent
        .replace(/<!--\s*\/?\w+\s*-->/g, '')
        .trim()
      
      // Parse the section content based on type
      const sectionComponent = parseSectionByType(marker.type, cleanContent)
      if (sectionComponent) {
        components.push(sectionComponent)
      }
      
      lastEnd = marker.position + marker.length
    } else {
      // Opening marker - add to stack
      stack.push(marker)
    }
  }
  
  // Handle any content before the first marker or after the last marker
  // This handles hero section and other non-commented sections
  if (markers.length > 0) {
    const firstMarkerPos = markers[0].position
    if (firstMarkerPos > 0) {
      const beforeContent = markdown.substring(0, firstMarkerPos).trim()
      if (beforeContent) {
        const beforeComponents = parsePatternBased(beforeContent)
        components.unshift(...beforeComponents)
      }
    }
    
    const lastMarker = markers[markers.length - 1]
    const lastMarkerEnd = lastMarker.position + lastMarker.length
    if (lastMarkerEnd < markdown.length) {
      const afterContent = markdown.substring(lastMarkerEnd).trim()
      if (afterContent) {
        const afterComponents = parsePatternBased(afterContent)
        components.push(...afterComponents)
      }
    }
  }
  
  return components
}

/**
 * Parses a section's content based on its type
 */
function parseSectionByType(type, content) {
  const tokens = marked.lexer(content)
  
  switch (type) {
    case 'hero':
      return parseHeroSection(tokens)
    case 'logos':
      return parseLogosSection(tokens)
    case 'cards':
      return parseCardsSection(tokens)
    case 'cta':
      return parseCTASection(tokens)
    default:
      // Unknown type, return as text
      return { type: 'text', content }
  }
}

/**
 * Parse hero section from tokens
 */
function parseHeroSection(tokens) {
  const hero = { type: "hero", title: "", content: "", links: [], image: null }
  
  for (const token of tokens) {
    if (token.type === "heading" && token.depth === 1) {
      hero.title = token.text
    } else if (token.type === "paragraph") {
      // Check for image tokens within paragraph first (structured parsing is most reliable)
      const imageToken = token.tokens?.find(t => t.type === "image")
      if (imageToken) {
        hero.image = imageToken.href
        // Extract text content excluding the image
        const textTokens = token.tokens?.filter(t => t.type === "text") || []
        const textContent = textTokens.map(t => t.text).join("").trim()
        if (textContent) hero.content += textContent + " "
      } else if (token.text) {
        // Fallback: Check for image in paragraph text using regex
        const imgMatch = token.text.match(/!\[(.*?)\]\((.*?)\)/)
        if (imgMatch) {
          hero.image = imgMatch[2]
          // Only add text content if there's text beyond the image
          const textWithoutImage = token.text.replace(/!\[.*?\]\(.*?\)/, "").trim()
          if (textWithoutImage) hero.content += textWithoutImage + " "
        } else {
          // Regular text paragraph (skip if empty)
          if (token.text.trim() !== "") {
            hero.content += token.text + " "
          }
        }
      }
    } else if (token.type === "list") {
      token.items.forEach((item) => {
        const linkToken = item.tokens?.find(t => t.type === "link")
        if (linkToken) {
          hero.links.push({ label: linkToken.text, href: linkToken.href })
        } else {
          const linkMatch = item.text.match(/\[(.*?)\]\((.*?)\)/)
          if (linkMatch) hero.links.push({ label: linkMatch[1], href: linkMatch[2] })
        }
      })
    } else if (token.type === "image") {
      // Standalone image token
      hero.image = token.href
    }
  }
  
  return hero.title || hero.content || hero.image ? hero : null
}

/**
 * Parse logos section from tokens
 */
function parseLogosSection(tokens) {
  const logos = []
  
  for (const token of tokens) {
    if (token.type === "list") {
      token.items.forEach((item) => {
        const match = item.text.match(/!\[(.*?)\]\((.*?)\)/)
        if (match) {
          logos.push({ alt: match[1], src: match[2] })
        } else {
          const imageToken = item.tokens?.find(t => t.type === "image")
          if (imageToken) {
            logos.push({ alt: imageToken.text || "", src: imageToken.href })
          }
        }
      })
    } else if (token.type === "paragraph") {
      const imgMatch = token.text?.match(/!\[(.*?)\]\((.*?)\)/)
      if (imgMatch) {
        logos.push({ alt: imgMatch[1], src: imgMatch[2] })
      }
    }
  }
  
  return logos.length > 0 ? { type: "logos", items: logos } : null
}

/**
 * Parse cards section from tokens
 */
function parseCardsSection(tokens) {
  let title = ""
  const cards = []
  
  for (const token of tokens) {
    if (token.type === "heading" && token.depth === 2) {
      title = token.text
    } else if (token.type === "list") {
      token.items.forEach((item) => {
        const imgMatch = item.text.match(/!\[(.*?)\]\((.*?)\)/)
        const titleMatch = item.text.match(/\*\*(.*?)\*\*/)
        const linkMatch = item.text.match(/\[(.*?)\]\((.*?)\)/)
        
        cards.push({
          image: imgMatch ? imgMatch[2] : null,
          title: titleMatch ? titleMatch[1] : "Feature",
          text: item.text
            .replace(/!\[.*?\]\(.*?\)/, "")
            .replace(/\*\*.*?\*\*/, "")
            .replace(/\[.*?\]\(.*?\)/, "")
            .trim(),
          link: linkMatch ? { label: linkMatch[1], href: linkMatch[2] } : null,
        })
      })
    }
  }
  
  return cards.length > 0 ? { type: "cards", title, items: cards } : null
}

/**
 * Parse CTA section from tokens
 */
function parseCTASection(tokens) {
  const cta = { type: "cta", title: "", content: "", link: null }
  
  for (const token of tokens) {
    if (token.type === "heading" && token.depth === 3) {
      cta.title = token.text
    } else if (token.type === "paragraph") {
      const linkToken = token.tokens?.find(t => t.type === "link")
      if (linkToken) {
        cta.link = { label: linkToken.text, href: linkToken.href }
        const textTokens = token.tokens.filter(t => t.type === "text") || []
        const textContent = textTokens.map(t => t.text).join("").trim()
        if (textContent) cta.content += textContent + " "
      } else {
        const linkMatch = token.text.match(/\[(.*?)\]\((.*?)\)/)
        if (linkMatch) {
          cta.link = { label: linkMatch[1], href: linkMatch[2] }
          cta.content += token.text.replace(/\[.*?\]\(.*?\)/, "").trim() + " "
        } else {
          cta.content += token.text + " "
        }
      }
    }
  }
  
  return cta.title || cta.content ? cta : null
}

/**
 * Parses markdown into a list of high-level UI component definitions
 * based on specific structural patterns.
 */
export function parseMarkdownToComponents(markdown) {
  // First, extract comment markers to identify section boundaries
  const commentMarkers = extractCommentMarkers(markdown)
  
  // If we have comment markers, use them to parse sections
  if (commentMarkers.length > 0) {
    return parseWithCommentMarkers(markdown, commentMarkers)
  }
  
  // Otherwise, fall back to the original pattern-based parsing
  return parsePatternBased(markdown)
}

function parsePatternBased(markdown) {
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
        // Stop at horizontal rule (separator)
        if (next.type === "hr") {
          i++ // Skip the hr token
          break
        }
        if (next.type === "image") {
          // Standalone image token (rare, but possible)
          hero.image = next.href
        } else if (next.type === "paragraph") {
          // Skip truly empty paragraphs (no text and no tokens with content)
          const hasText = next.text && next.text.trim() !== ""
          const hasImageToken = next.tokens?.some(t => t.type === "image")
          if (!hasText && !hasImageToken) {
            i++
            continue
          }
          // Check for image tokens within paragraph first (structured parsing is more reliable)
          const imageToken = next.tokens?.find(t => t.type === "image")
          if (imageToken) {
            hero.image = imageToken.href
            // Extract text content excluding the image
            const textTokens = next.tokens?.filter(t => t.type === "text") || []
            const textContent = textTokens.map(t => t.text).join("").trim()
            if (textContent) hero.content += textContent + " "
          } else {
            // Fallback: Check for image in paragraph text using regex
            const imgMatch = next.text?.match(/!\[(.*?)\]\((.*?)\)/)
            if (imgMatch) {
              hero.image = imgMatch[2]
              // Only add text content if there's text beyond the image
              const textWithoutImage = next.text.replace(/!\[.*?\]\(.*?\)/, "").trim()
              if (textWithoutImage) hero.content += textWithoutImage + " "
            } else if (next.text) {
              // Regular text paragraph
              hero.content += next.text + " "
            }
          }
        } else if (next.type === "list") {
          // Check if this is a logos list (all items are images)
          const isLogosList = next.items.every((item) => {
            return item.text.match(/!\[(.*?)\]\((.*?)\)/) || 
                   (item.tokens && item.tokens.some(t => t.type === "image"))
          })
          
          if (isLogosList) {
            // Stop consuming for hero, let logos parser handle this
            // Don't increment i, so the logos parser can process this token
            break
          }
          
          // Otherwise, treat as links list for hero
          next.items.forEach((item) => {
            // Check for link tokens in list items
            const linkToken = item.tokens?.find(t => t.type === "link")
            if (linkToken) {
              hero.links.push({ label: linkToken.text, href: linkToken.href })
            } else {
              // Fallback to regex
              const linkMatch = item.text.match(/\[(.*?)\]\((.*?)\)/)
              if (linkMatch) hero.links.push({ label: linkMatch[1], href: linkMatch[2] })
            }
          })
        }
        i++
      }
      components.push(hero)
      continue
    }

    // Skip horizontal rules (they're just separators)
    if (token.type === "hr") {
      i++
      continue
    }

    // LOGOS: List containing only images
    if (token.type === "list") {
      const allImages = token.items.every((item) => {
        // Check if item contains an image (either as text or as tokens)
        return item.text.match(/!\[(.*?)\]\((.*?)\)/) || 
               (item.tokens && item.tokens.some(t => t.type === "image"))
      })
      if (allImages) {
        const logos = token.items.map((item) => {
          // Check for image in text
          const match = item.text.match(/!\[(.*?)\]\((.*?)\)/)
          if (match) {
            return { alt: match[1], src: match[2] }
          }
          // Check for image token
          const imageToken = item.tokens?.find(t => t.type === "image")
          if (imageToken) {
            return { alt: imageToken.text || "", src: imageToken.href }
          }
          return null
        }).filter(Boolean)
        if (logos.length > 0) {
          components.push({ type: "logos", items: logos })
        }
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
          const imgMatch = item.text.match(/!\[(.*?)\]\((.*?)\)/)
          const titleMatch = item.text.match(/\*\*(.*?)\*\*/)
          const linkMatch = item.text.match(/\[(.*?)\]\((.*?)\)/)

          return {
            image: imgMatch ? imgMatch[2] : null,
            title: titleMatch ? titleMatch[1] : "Feature",
            text: item.text
              .replace(/!\[.*?\]\(.*?\)/, "")
              .replace(/\*\*.*?\*\*/, "")
              .replace(/\[.*?\]\(.*?\)/, "")
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
          // Check for link tokens within paragraph
          const linkToken = next.tokens?.find(t => t.type === "link")
          if (linkToken) {
            cta.link = { label: linkToken.text, href: linkToken.href }
            // Extract text content excluding the link
            const textTokens = next.tokens?.filter(t => t.type === "text") || []
            const textContent = textTokens.map(t => t.text).join("").trim()
            if (textContent) cta.content += textContent + " "
          } else {
            // Fallback to regex
            const linkMatch = next.text.match(/\[(.*?)\]\((.*?)\)/)
            if (linkMatch) {
              cta.link = { label: linkMatch[1], href: linkMatch[2] }
              cta.content += next.text.replace(/\[.*?\]\(.*?\)/, "").trim() + " "
            } else {
              cta.content += next.text + " "
            }
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
