"use client"

import { useRef, useState } from "react"
import { useTrainingCatalog } from "@/components/trainings/training-catalog-provider"
import { useCandidatureStatus } from "@/components/candidatures/candidature-status-provider"
import { submitOdcCandidature } from "@/lib/public-api"
import { FORM_FEEDBACK_MESSAGES, formatSubmissionErrorMessage } from "@/lib/form-feedback"
import { eligibleTrainings, RESIDENCE_LOCATIONS } from "@/lib/training-eligibility"
import { validateField } from "../validation"
import { candidatureErrors, candidaturePayload, changeCandidature, initialCandidature, phoneCountry } from "../form-model"
import { CANDIDATURE_STEPS, candidatureStepErrors, firstInvalidStep } from "../form-steps"
import useCandidatureUniqueness from "./use-candidature-uniqueness"
import useCandidatureSteps from "./use-candidature-steps"

export default function useOdcCandidature() {
  const catalog = useTrainingCatalog()
  const availability = useCandidatureStatus()
  const [values, setValues] = useState(initialCandidature)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [receipt, setReceipt] = useState(null)
  const fieldRefs = useRef({})
  const formRef = useRef(null)
  const navigation = useCandidatureSteps(formRef, errors, !submitting && catalog.phase === "ready" && availability.canApply)
  const sending = useRef(false)
  const uniqueness = useCandidatureUniqueness()
  const residenceLocations = catalog.regionalRules?.residenceRegions || RESIDENCE_LOCATIONS
  const duplicateFlags = { email: uniqueness.state.email?.exists, idNumber: uniqueness.state.idNumber?.exists }
  const visibleErrors = { ...errors,
    ...(duplicateFlags.email ? { email: FORM_FEEDBACK_MESSAGES.duplicateEmail } : {}),
    ...(duplicateFlags.idNumber ? { idNumber: FORM_FEEDBACK_MESSAGES.duplicateIdNumber } : {}),
  }

  function change(name, value) {
    if (name === "email" || name === "idNumber") uniqueness.reset(name)
    if (name === "idType") uniqueness.reset("idNumber")
    setValues((previous) => changeCandidature(previous, name, value, catalog.items, residenceLocations))
    setErrors((previous) => {
      const next = { ...previous }
      const dependent = { region: ["formation", "education", "currentStructure"], gender: ["formation"],
        formation: ["education", "currentStructure"], idType: ["idNumber"], phoneCountry: ["phone"] }
      for (const field of [name, ...(dependent[name] || [])]) delete next[field]
      return next
    })
    setSubmitError("")
  }

  function blur(event) {
    const name = event.target.name
    if (!["email", "idNumber"].includes(name)) return
    const error = validateField(name, values[name], { idType: values.idType, selectedCountry: phoneCountry(values) })
    if (!error && values[name]?.trim()) {
      void uniqueness.check(name, values[name])
    }
  }

  function showErrors(next) {
    setErrors(next)
    const index = firstInvalidStep(next)
    if (index >= 0) navigation.goTo(index, CANDIDATURE_STEPS[index].fields.find((field) => next[field]))
  }

  function advance() {
    const nextErrors = candidatureStepErrors(candidatureErrors(values, catalog.items, duplicateFlags, residenceLocations), navigation.step, true)
    if (Object.keys(nextErrors).length) { showErrors(nextErrors); return }
    setErrors({})
    navigation.goTo(navigation.step + 1)
  }

  async function submit(event) {
    event.preventDefault()
    if (sending.current || !availability.canApply) return
    if (catalog.phase !== "ready") { setSubmitError("Veuillez attendre le chargement des formations."); return }
    if (navigation.step < CANDIDATURE_STEPS.length - 1) { advance(); return }
    const nextErrors = candidatureErrors(values, catalog.items, duplicateFlags, residenceLocations)
    if (Object.keys(nextErrors).length) { showErrors(nextErrors); return }
    sending.current = true
    setSubmitting(true)
    setSubmitError("")
    try {
      const [campaign, currentItems] = await Promise.all([availability.refresh(), catalog.refresh()])
      if (campaign?.isOpen !== true) return
      if (!currentItems.length) throw new Error("Impossible de vérifier les formations. Vos informations sont conservées, veuillez réessayer.")
      const refreshedErrors = candidatureErrors(values, currentItems, duplicateFlags, residenceLocations)
      if (Object.keys(refreshedErrors).length) { showErrors(refreshedErrors); return }
      await submitOdcCandidature(candidaturePayload(values))
      setReceipt({ formation: currentItems.find((item) => item.code === values.formation)?.title || values.formation })
      setValues(initialCandidature())
      window.scrollTo({ top: 0, behavior: "auto" })
    } catch (error) { setSubmitError(formatSubmissionErrorMessage(error)) }
    finally { sending.current = false; setSubmitting(false) }
  }

  return { values, errors: visibleErrors, catalog, receipt, submitting, submitError, fieldRefs, formRef,
    step: navigation.step, stepErrors: candidatureStepErrors(errors, navigation.step),
    previous: () => { if (!sending.current) navigation.goTo(navigation.step - 1) },
    returnTo: (index) => { if (!sending.current && index < navigation.step) navigation.goTo(index) },
    checking: uniqueness.state, selectedCountry: phoneCountry(values),
    formations: eligibleTrainings(catalog.items, values.region, values.gender, residenceLocations),
    selectedTraining: catalog.items.find((item) => item.code === values.formation),
    change, blur, submit,
    handleChange: (event) => change(event.target.name, event.target.type === "checkbox" ? event.target.checked : event.target.value),
  }
}
