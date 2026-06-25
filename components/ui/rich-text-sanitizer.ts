const ALLOWED_TAGS = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "div",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "i",
  "li",
  "ol",
  "p",
  "pre",
  "span",
  "strong",
  "u",
  "ul",
])

const DROP_CONTENT_TAGS = new Set([
  "button",
  "embed",
  "form",
  "iframe",
  "input",
  "link",
  "meta",
  "noscript",
  "object",
  "script",
  "select",
  "style",
  "textarea",
])

type SanitizedNode = HTMLElement | Text | DocumentFragment

function isSafeHref(value: string) {
  const href = value.trim()

  if (!href) return false

  if (href.startsWith("#") || href.startsWith("/") || href.startsWith("./") || href.startsWith("../")) {
    return true
  }

  try {
    const url = new URL(href, "https://example.com")
    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol)
  } catch {
    return false
  }
}

function sanitizeNode(
  node: ChildNode,
  targetDocument: Document,
): SanitizedNode | null {
  if (node.nodeType === Node.TEXT_NODE) {
    return targetDocument.createTextNode(node.textContent || "")
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null
  }

  const element = node as HTMLElement
  const tagName = element.tagName.toLowerCase()

  if (DROP_CONTENT_TAGS.has(tagName)) {
    return null
  }

  const sanitizedChildren = Array.from(element.childNodes)
    .map((child) => sanitizeNode(child, targetDocument))
    .filter((child): child is SanitizedNode => child !== null)

  if (!ALLOWED_TAGS.has(tagName)) {
    const fragment = targetDocument.createDocumentFragment()
    sanitizedChildren.forEach((child) => fragment.appendChild(child))
    return fragment
  }

  const cleanElement = targetDocument.createElement(tagName)

  if (tagName === "a") {
    const href = element.getAttribute("href")
    if (href && isSafeHref(href)) {
      cleanElement.setAttribute("href", href)
    }

    const target = element.getAttribute("target")
    if (target === "_blank") {
      cleanElement.setAttribute("target", "_blank")
      cleanElement.setAttribute("rel", "noopener noreferrer")
    } else if (cleanElement.getAttribute("href")) {
      cleanElement.setAttribute("rel", "nofollow")
    }
  }

  sanitizedChildren.forEach((child) => cleanElement.appendChild(child))

  return cleanElement
}

export function sanitizeRichTextHtml(content: string) {
  if (!content) {
    return ""
  }

  const parser = new DOMParser()
  const sourceDocument = parser.parseFromString(content, "text/html")
  const targetDocument = document.implementation.createHTMLDocument("")
  const fragment = targetDocument.createDocumentFragment()

  Array.from(sourceDocument.body.childNodes).forEach((child) => {
    const sanitizedChild = sanitizeNode(child, targetDocument)
    if (sanitizedChild) {
      fragment.appendChild(sanitizedChild)
    }
  })

  const container = targetDocument.createElement("div")
  container.appendChild(fragment)
  return container.innerHTML
}
