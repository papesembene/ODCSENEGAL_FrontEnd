"use client"

import { useEffect } from "react"

interface RichTextDisplayProps {
  content: string
  className?: string
}

export function RichTextDisplay({ content, className = "" }: RichTextDisplayProps) {
  // Injecter les styles CSS pour les listes
  useEffect(() => {
    const styleId = 'rich-text-display-list-styles'
    if (document.getElementById(styleId)) return // Styles déjà injectés

    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      .rich-text-display ul,
      .rich-text-display ol {
        margin: 0.5rem 0 !important;
        padding-left: 2rem !important;
        list-style-position: outside !important;
      }
      .rich-text-display ul {
        list-style-type: disc !important;
      }
      .rich-text-display ol {
        list-style-type: decimal !important;
      }
      .rich-text-display li {
        margin: 0.25rem 0 !important;
        display: list-item !important;
      }
    `
    document.head.appendChild(style)

    return () => {
      const existingStyle = document.getElementById(styleId)
      if (existingStyle) {
        existingStyle.remove()
      }
    }
  }, [])

  return (
    <div
      className={`rich-text-display whitespace-pre-wrap break-words ${className}`}
      dangerouslySetInnerHTML={{ __html: content || "" }}
      style={{
        lineHeight: "1.6",
      }}
    />
  )
}
