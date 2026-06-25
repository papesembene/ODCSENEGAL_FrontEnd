"use client"

import { useEffect, useState } from "react"
import { sanitizeRichTextHtml } from "./rich-text-sanitizer"

interface RichTextDisplayProps {
  content: string
  className?: string
}

export function RichTextDisplay({ content, className = "" }: RichTextDisplayProps) {
  const [sanitizedContent, setSanitizedContent] = useState("")

  useEffect(() => {
    setSanitizedContent(sanitizeRichTextHtml(content))
  }, [content])

  return (
    <div
      className={`rich-text-display whitespace-pre-wrap break-words [&_a]:text-orange-500 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-orange-200 [&_blockquote]:pl-4 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-8 [&_p]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-muted [&_pre]:p-3 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-8 ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      style={{
        lineHeight: "1.6",
      }}
    />
  )
}
