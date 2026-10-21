"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Bold, Italic, Underline, List, ListOrdered } from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Saisissez votre texte...",
  rows = 4,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
  })

  useEffect(() => {
    if (editorRef.current && !isInitialized && value) {
      editorRef.current.innerHTML = value
      setIsInitialized(true)
    }
  }, [])

  // Injecter les styles CSS pour les listes
  useEffect(() => {
    const styleId = 'rich-text-editor-list-styles'
    if (document.getElementById(styleId)) return // Styles déjà injectés

    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      [contenteditable="true"] ul,
      [contenteditable="true"] ol {
        margin: 0.5rem 0 !important;
        padding-left: 2rem !important;
        list-style-position: outside !important;
      }
      [contenteditable="true"] ul {
        list-style-type: disc !important;
      }
      [contenteditable="true"] ol {
        list-style-type: decimal !important;
      }
      [contenteditable="true"] li {
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

  const updateActiveFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
    })
  }

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
      editorRef.current.focus()
    }
    updateActiveFormats()
  }

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
    updateActiveFormats()
  }

  const insertBulletList = () => {
    if (!editorRef.current) return
    
    editorRef.current.focus()
    
    const selection = window.getSelection()
    if (!selection) return
    
    // Créer une sélection si nécessaire
    let range: Range
    if (selection.rangeCount === 0) {
      range = document.createRange()
      range.selectNodeContents(editorRef.current)
      range.collapse(false)
      selection.removeAllRanges()
      selection.addRange(range)
    } else {
      range = selection.getRangeAt(0)
    }
    
    // Vérifier si on est déjà dans une liste UL
    let currentNode: Node | null = selection.anchorNode
    while (currentNode && currentNode !== editorRef.current) {
      if (currentNode.nodeType === Node.ELEMENT_NODE) {
        const element = currentNode as HTMLElement
        if (element.tagName === 'UL') {
          // On est déjà dans une liste à puces, on sort
          document.execCommand("outdent", false)
          if (editorRef.current) {
            onChange(editorRef.current.innerHTML)
            editorRef.current.focus()
          }
          return
        }
        if (element.tagName === 'OL') {
          // On est dans une liste numérotée, on la remplace par une liste à puces
          const ul = document.createElement('ul')
          while (element.firstChild) {
            ul.appendChild(element.firstChild)
          }
          element.replaceWith(ul)
          if (editorRef.current) {
            onChange(editorRef.current.innerHTML)
            editorRef.current.focus()
          }
          return
        }
        if (element.tagName === 'LI') {
          // On est dans un élément de liste, vérifier le parent
          const parent = element.parentElement
          if (parent && parent.tagName === 'UL') {
            // Déjà dans une liste à puces, on sort
            document.execCommand("outdent", false)
            if (editorRef.current) {
              onChange(editorRef.current.innerHTML)
              editorRef.current.focus()
            }
            return
          }
        }
      }
      currentNode = currentNode.parentNode
    }
    
    // Créer la liste manuellement
    try {
      const listItem = document.createElement("li")
      listItem.innerHTML = "<br>" // Pour que la liste soit visible et éditable
      const ul = document.createElement("ul")
      ul.appendChild(listItem)
      
      // Insérer la liste à la position de la sélection
      range.deleteContents()
      range.insertNode(ul)
      
      // Placer le curseur dans l'élément li
      const newRange = document.createRange()
      newRange.setStart(listItem, 0)
      newRange.setEnd(listItem, 0)
      selection.removeAllRanges()
      selection.addRange(newRange)
    } catch (e) {
      console.error("Erreur lors de l'insertion de la liste à puces:", e)
    }
    
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
      editorRef.current.focus()
    }
    updateActiveFormats()
  }

  const insertNumberedList = () => {
    if (!editorRef.current) return
    
    editorRef.current.focus()
    
    const selection = window.getSelection()
    if (!selection) return
    
    // Créer une sélection si nécessaire
    let range: Range
    if (selection.rangeCount === 0) {
      range = document.createRange()
      range.selectNodeContents(editorRef.current)
      range.collapse(false)
      selection.removeAllRanges()
      selection.addRange(range)
    } else {
      range = selection.getRangeAt(0)
    }
    
    // Vérifier si on est déjà dans une liste OL
    let currentNode: Node | null = selection.anchorNode
    while (currentNode && currentNode !== editorRef.current) {
      if (currentNode.nodeType === Node.ELEMENT_NODE) {
        const element = currentNode as HTMLElement
        if (element.tagName === 'OL') {
          // On est déjà dans une liste numérotée, on sort
          document.execCommand("outdent", false)
          if (editorRef.current) {
            onChange(editorRef.current.innerHTML)
            editorRef.current.focus()
          }
          return
        }
        if (element.tagName === 'UL') {
          // On est dans une liste à puces, on la remplace par une liste numérotée
          const ol = document.createElement('ol')
          while (element.firstChild) {
            ol.appendChild(element.firstChild)
          }
          element.replaceWith(ol)
          if (editorRef.current) {
            onChange(editorRef.current.innerHTML)
            editorRef.current.focus()
          }
          return
        }
        if (element.tagName === 'LI') {
          // On est dans un élément de liste, vérifier le parent
          const parent = element.parentElement
          if (parent && parent.tagName === 'OL') {
            // Déjà dans une liste numérotée, on sort
            document.execCommand("outdent", false)
            if (editorRef.current) {
              onChange(editorRef.current.innerHTML)
              editorRef.current.focus()
            }
            return
          }
        }
      }
      currentNode = currentNode.parentNode
    }
    
    // Créer la liste manuellement
    try {
      const listItem = document.createElement("li")
      listItem.innerHTML = "<br>" // Pour que la liste soit visible et éditable
      const ol = document.createElement("ol")
      ol.appendChild(listItem)
      
      // Insérer la liste à la position de la sélection
      range.deleteContents()
      range.insertNode(ol)
      
      // Placer le curseur dans l'élément li
      const newRange = document.createRange()
      newRange.setStart(listItem, 0)
      newRange.setEnd(listItem, 0)
      selection.removeAllRanges()
      selection.addRange(newRange)
    } catch (e) {
      console.error("Erreur lors de l'insertion de la liste numérotée:", e)
    }
    
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
      editorRef.current.focus()
    }
    updateActiveFormats()
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-100 p-2 flex flex-wrap gap-1 border-b">
        <Button
          size="sm"
          variant={activeFormats.bold ? "default" : "outline"}
          onClick={() => applyFormat("bold")}
          title="Gras (Ctrl+B)"
          className="h-8 w-8 p-0"
          type="button"
        >
          <Bold size={16} />
        </Button>
        <Button
          size="sm"
          variant={activeFormats.italic ? "default" : "outline"}
          onClick={() => applyFormat("italic")}
          title="Italique (Ctrl+I)"
          className="h-8 w-8 p-0"
          type="button"
        >
          <Italic size={16} />
        </Button>
        <Button
          size="sm"
          variant={activeFormats.underline ? "default" : "outline"}
          onClick={() => applyFormat("underline")}
          title="Souligné (Ctrl+U)"
          className="h-8 w-8 p-0"
          type="button"
        >
          <Underline size={16} />
        </Button>
        <div className="border-l border-gray-300 mx-1" />
        <Button
          size="sm"
          variant="outline"
          onClick={insertBulletList}
          title="Puces"
          className="h-8 w-8 p-0 bg-transparent"
          type="button"
        >
          <List size={16} />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={insertNumberedList}
          title="Liste numérotée"
          className="h-8 w-8 p-0 bg-transparent"
          type="button"
        >
          <ListOrdered size={16} />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={() => {
          setIsEditing(true)
          updateActiveFormats()
        }}
        onBlur={() => setIsEditing(false)}
        className={`min-h-32 p-3 focus:outline-hidden whitespace-pre-wrap break-words ${
          isEditing ? "bg-white" : "bg-gray-50"
        }`}
        style={{ minHeight: `${rows * 1.5}rem` }}
      />
    </div>
  )
}
