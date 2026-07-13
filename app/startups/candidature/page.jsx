"use client"

import { useState, useEffect, useCallback } from "react"
import {
  checkStartupEmailExists,
  checkStartupPhoneExists,
  submitStartupApplication,
} from "@/lib/public-api"
import { formatSubmissionErrorMessage } from "@/lib/form-feedback"
import {
  buildApplicationFormData,
  handlePhoneInput,
  mergeErrors,
  omitError,
  processInputValue,
  updateFormDataValue,
} from "./input-helpers"
import {
  getRequiredBlurFields,
  validateFieldRealtime as runRealtimeFieldValidation,
  validateFile,
  validateStep1,
  validateStep2,
  validateStep3,
} from "./validation"
import StartupCandidatureFormShell from "./components/startup-candidature-form-shell"
import StartupCandidatureStepOne from "./components/steps/startup-candidature-step-one"
import StartupCandidatureStepTwo from "./components/steps/startup-candidature-step-two"
import StartupCandidatureStepThree from "./components/steps/startup-candidature-step-three"

export default function StartupCandidaturePage() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [emailExists, setEmailExists] = useState(false)
  const [phoneExists, setPhoneExists] = useState(false)
  const [emailCheckLoading, setEmailCheckLoading] = useState(false)
  const [phoneCheckLoading, setPhoneCheckLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [realtimeErrors, setRealtimeErrors] = useState({})
  const [isRegulationOpen, setIsRegulationOpen] = useState(false)
  const [dragOverCV, setDragOverCV] = useState(false)
  const [dragOverPitchDeck, setDragOverPitchDeck] = useState(false)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    role: "",
    otherRole: "",
    email: "",
    emailAlternate: "",
    phone: "",
    phoneCountry: "+221",
    region: "",
    department: "",
    diploma: "",
    otherDiploma: "",
    institution: "",
    cv: null,
    companyName: "",
    website: "",
    ninea: "",
    capital: "",
    capitalCurrency: "F CFA",
    legalForm: "",
    otherLegalForm: "",
    employees: "",
    revenue: "",
    revenueCurrency: "F CFA",
    raisedFunds: "",
    raisedAmount: "",
    raisedCurrency: "F CFA",
    pitchDeck: null,
    sector: "",
    otherSector: "",
    businessModel: "",
    creationDate: "",
    address: "",
    clients: "",
    productName: "",
    productDescription: "",
    activityDescription: "",
    hasWorkingProduct: "",
    acceptTerms: false,
  })

  const validateFieldRealtime = useCallback(
    (name, value) => {
      return runRealtimeFieldValidation(name, value, formData)
    },
    [formData.email, formData.role, formData.diploma, formData.sector, formData.legalForm, formData.raisedFunds],
  )

  const [validationTimeouts, setValidationTimeouts] = useState({})
  const allErrors = mergeErrors(realtimeErrors, validationErrors)

  const setFieldValue = useCallback((name, value) => {
    setFormData((prev) => updateFormDataValue(prev, name, value))
  }, [])

  const clearValidationError = useCallback((name) => {
    setValidationErrors((prev) => omitError(prev, name))
  }, [])

  const clearRealtimeError = useCallback((name) => {
    setRealtimeErrors((prev) => omitError(prev, name))
  }, [])

  const debouncedValidation = useCallback(
    (name, value) => {
      const timeoutId = setTimeout(() => {
        const fieldErrors = validateFieldRealtime(name, value)
        setRealtimeErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[name]
          if (fieldErrors[name]) {
            newErrors[name] = fieldErrors[name]
          }
          return newErrors
        })
      }, 400)
      return timeoutId
    },
    [validateFieldRealtime],
  )

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const processedValue = processInputValue({ name, value, type, checked })

    setFieldValue(name, processedValue)

    // Reset validation errors
    if (name === "email") setEmailExists(false)
    if (name === "phone") setPhoneExists(false)

    clearValidationError(name)
    clearRealtimeError(name)

    // Validation en temps réel avec debounce
    if (type !== "checkbox" && type !== "file") {
      if (validationTimeouts[name]) {
        clearTimeout(validationTimeouts[name])
      }
      const timeoutId = debouncedValidation(name, type === "checkbox" ? checked : processedValue)
      setValidationTimeouts((prev) => ({
        ...prev,
        [name]: timeoutId,
      }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    const requiredFields = getRequiredBlurFields(formData)

    if (requiredFields.includes(name) && !value.trim()) {
      const fieldErrors = validateFieldRealtime(name, value)
      if (fieldErrors[name]) {
        setRealtimeErrors((prev) => ({
          ...prev,
          [name]: fieldErrors[name],
        }))
      }
    }
  }

  // Vérification d'email avec l'API
  useEffect(() => {
    const checkEmailExists = async () => {
      if (!formData.email || formData.email.length < 5) return

      setEmailCheckLoading(true)
      try {
        const data = await checkStartupEmailExists(formData.email)
        setEmailExists(data.exists)
      } catch (error) {
        console.error("Error checking email:", error)
      } finally {
        setEmailCheckLoading(false)
      }
    }

    const debounceTimer = setTimeout(() => {
      if (formData.email) {
        checkEmailExists()
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [formData.email])

  // Vérification de téléphone avec l'API
  useEffect(() => {
    const checkPhoneExists = async () => {
      if (!formData.phone || formData.phone.length < 8) return

      setPhoneCheckLoading(true)
      try {
        const fullPhone = formData.phoneCountry + formData.phone
        const data = await checkStartupPhoneExists(fullPhone)
        setPhoneExists(data.exists)
      } catch (error) {
        console.error("Error checking phone:", error)
      } finally {
        setPhoneCheckLoading(false)
      }
    }

    const debounceTimer = setTimeout(() => {
      if (formData.phone) {
        checkPhoneExists()
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [formData.phone, formData.phoneCountry])

  const processFile = useCallback(
    (name, file) => {
      const fileError = validateFile(file)

      if (fileError) {
        setValidationErrors((prev) => ({
          ...prev,
          [name]: fileError,
        }))
        return
      }

      setFieldValue(name, file)
      clearValidationError(name)
    },
    [clearValidationError, setFieldValue],
  )

  const handleFileChange = (e) => {
    const { name, files } = e.target
    if (files && files[0]) {
      processFile(name, files[0])
    }
  }

  const clearCv = useCallback(() => {
    setFieldValue("cv", null)
    clearValidationError("cv")
    clearRealtimeError("cv")
  }, [clearRealtimeError, clearValidationError, setFieldValue])

  const clearPitchDeck = useCallback(() => {
    setFieldValue("pitchDeck", null)
    clearValidationError("pitchDeck")
    clearRealtimeError("pitchDeck")
  }, [clearRealtimeError, clearValidationError, setFieldValue])

  const handleDragOver = useCallback((e, name) => {
    e.preventDefault()
    e.stopPropagation()
    if (name === "cv") setDragOverCV(true)
    if (name === "pitchDeck") setDragOverPitchDeck(true)
  }, [])

  const handleDragLeave = useCallback((e, name) => {
    e.preventDefault()
    e.stopPropagation()
    if (name === "cv") setDragOverCV(false)
    if (name === "pitchDeck") setDragOverPitchDeck(false)
  }, [])

  const handleDrop = useCallback(
    (e, name) => {
      e.preventDefault()
      e.stopPropagation()
      if (name === "cv") setDragOverCV(false)
      if (name === "pitchDeck") setDragOverPitchDeck(false)

      const files = e.dataTransfer.files
      if (files && files[0]) {
        processFile(name, files[0])
      }
    },
    [processFile],
  )

  const handleSelectChange = (name, value) => {
    setFieldValue(name, value)
    clearValidationError(name)
    clearRealtimeError(name)
  }

  const handleRadioChange = (name, value) => {
    setFieldValue(name, value)
    clearValidationError(name)
  }

  // Fonction pour combiner les erreurs
  const getAllErrors = () => {
    return allErrors
  }

  // Validation des étapes
  const runStep1Validation = () => {
    const { errors, isValid } = validateStep1({
      formData,
      emailExists,
      phoneExists,
      emailCheckLoading,
      phoneCheckLoading,
    })
    setValidationErrors(errors)
    return isValid
  }

  const runStep2Validation = () => {
    const { errors, isValid } = validateStep2(formData)
    setValidationErrors(errors)
    return isValid
  }

  const runStep3Validation = () => {
    const { errors, isValid } = validateStep3(formData)
    setValidationErrors(errors)
    return isValid
  }

  const getStepValidation = (step) => {
    switch (step) {
      case 1:
        return runStep1Validation()
      case 2:
        return runStep2Validation()
      case 3:
        return runStep3Validation()
      default:
        return false
    }
  }

  const scrollToFirstError = () => {
    setTimeout(() => {
      const errorElements = document.querySelectorAll(".border-red-500")
      if (errorElements.length > 0) {
        let topElement = errorElements[0]
        let topPosition = topElement.getBoundingClientRect().top

        errorElements.forEach((element) => {
          const position = element.getBoundingClientRect().top
          if (position < topPosition) {
            topPosition = position
            topElement = element
          }
        })

        topElement.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }, 100)
  }

  const nextStep = () => {
    if (getStepValidation(step)) {
      setStep(step + 1)
      window.scrollTo(0, 0)
    } else {
      scrollToFirstError()
    }
  }

  const prevStep = () => {
    setStep(step - 1)
    setValidationErrors({})
    setRealtimeErrors({})
    window.scrollTo(0, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError("")

    if (!runStep3Validation()) {
      scrollToFirstError()
      return
    }

    setIsSubmitting(true)

    try {
      const form = buildApplicationFormData(formData)
      await submitStartupApplication(form)

      setIsSubmitted(true)
    } catch (error) {
      console.error("Erreur lors de la soumission :", error)
      setSubmitError(formatSubmissionErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Nettoyer les timeouts au démontage du composant
  useEffect(() => {
    return () => {
      Object.values(validationTimeouts).forEach(clearTimeout)
    }
  }, [validationTimeouts])

  return (
    <StartupCandidatureFormShell isSubmitted={isSubmitted} submitError={submitError} step={step} onSubmit={handleSubmit}>
                    {step === 1 && (
                      <StartupCandidatureStepOne
                        formData={formData}
                        errors={getAllErrors()}
                        emailExists={emailExists}
                        emailCheckLoading={emailCheckLoading}
                        phoneExists={phoneExists}
                        phoneCheckLoading={phoneCheckLoading}
                        dragOverCV={dragOverCV}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        handleSelectChange={handleSelectChange}
                        handlePhoneInput={handlePhoneInput}
                        handleFileChange={handleFileChange}
                        handleDragOver={handleDragOver}
                        handleDragLeave={handleDragLeave}
                        handleDrop={handleDrop}
                        clearCv={clearCv}
                        onNext={nextStep}
                      />
                    )}

                    {step === 2 && (
                      <StartupCandidatureStepTwo
                        formData={formData}
                        errors={getAllErrors()}
                        dragOverPitchDeck={dragOverPitchDeck}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        handleSelectChange={handleSelectChange}
                        handleRadioChange={handleRadioChange}
                        handleFileChange={handleFileChange}
                        handleDragOver={handleDragOver}
                        handleDragLeave={handleDragLeave}
                        handleDrop={handleDrop}
                        clearPitchDeck={clearPitchDeck}
                        onPrevious={prevStep}
                        onNext={nextStep}
                      />
                    )}

                    {step === 3 && (
                      <StartupCandidatureStepThree
                        formData={formData}
                        errors={getAllErrors()}
                        isSubmitting={isSubmitting}
                        isRegulationOpen={isRegulationOpen}
                        setIsRegulationOpen={setIsRegulationOpen}
                        setFieldValue={setFieldValue}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        handleRadioChange={handleRadioChange}
                        onPrevious={prevStep}
                      />
                    )}
    </StartupCandidatureFormShell>
  )
}
