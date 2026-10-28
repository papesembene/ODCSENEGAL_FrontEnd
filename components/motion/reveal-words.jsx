import { Children, Fragment, cloneElement, isValidElement } from "react"

export default function RevealWords({ children, maskClassName }) {
  let index = 0

  function wrap(nodes) {
    return Children.map(nodes, (node) => {
      if (typeof node === "string" || typeof node === "number") {
        return String(node).split(/(\s+)/).map((word, key) => {
          if (!word.trim()) return word
          const position = index++
          return (
            <span key={key} className={maskClassName}>
              <span data-reveal-word="" style={{ "--word-delay": `${Math.min(position * 55, 275)}ms` }}>{word}</span>
            </span>
          )
        })
      }
      if (isValidElement(node) && (node.type === Fragment || typeof node.type === "string") && node.props.children) {
        return cloneElement(node, undefined, wrap(node.props.children))
      }
      return node
    })
  }

  return <>{wrap(children)}</>
}
