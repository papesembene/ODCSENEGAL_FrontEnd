"use client"

import { useEffect, useRef, useState } from "react"
import { CANDIDATURE_STEPS } from "../form-steps"

export default function useCandidatureSteps(formRef, errors, enabled) {
  const [step, setStep] = useState(0)
  const pendingFocus = useRef("initial")

  useEffect(() => {
    if (!pendingFocus.current || !enabled) return
    const field = pendingFocus.current
    const controls = [...(formRef.current?.elements || [])].filter((element) =>
      CANDIDATURE_STEPS[step].fields.includes(element.name) && !element.matches(":disabled"))
    // Prefer the checked radio when revisiting a choice, without changing it on focus.
    const target = field === "first" || field === "initial" ? controls.find((element) => element.checked) || controls[0]
      : controls.find((element) => element.name === field) || controls[0]
    if (!target) return
    pendingFocus.current = null
    target?.focus({ preventScroll: true })
    if (field === "initial") return
    const anchor = field === "first" ? formRef.current : target
    anchor?.scrollIntoView({ block: field === "first" ? "start" : "center", behavior: "auto" })
  }, [step, errors, formRef, enabled])

  function goTo(index, field = "first") {
    if (index < 0 || index >= CANDIDATURE_STEPS.length) return
    pendingFocus.current = field
    setStep(index)
  }

  return { step, goTo }
}
