"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, AlertCircle, Lightbulb } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  checkOrangeFabEmailExists,
  checkOrangeFabPhoneExists,
  submitOrangeFabApplication,
} from "@/lib/public-api"
import { formatSubmissionErrorMessage } from "@/lib/form-feedback"
import {
  ALLOWED_EXTENSIONS_ACCEPT,
  MAX_FILE_SIZE_MB,
  countryCodes,
  diplomas,
  legalForms,
  regionsData,
  roles,
  sectors,
} from "./constants"
import {
  buildApplicationFormData,
  buildInputFormData,
  buildSelectFormData,
  clearFieldError,
  handlePhoneInput,
  sanitizeOrangeFabFieldValue,
} from "./input-helpers"
import {
  validateFieldRealtime as validateOrangeFabFieldRealtime,
  validateFile,
  validateRequiredFieldOnBlur as validateOrangeFabRequiredFieldOnBlur,
  validateStep1 as validateOrangeFabStep1,
  validateStep2 as validateOrangeFabStep2,
  validateStep3 as validateOrangeFabStep3,
} from "./validation"
import OrangeFabStepOne from "./components/steps/orange-fab-step-one"
import OrangeFabStepTwo from "./components/steps/orange-fab-step-two"
import OrangeFabStepThree from "./components/steps/orange-fab-step-three"
import OrangeFabFormShell from "./components/orange-fab-form-shell"

export default function OrangeFabCandidaturePage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [step, setStep] = useState(1)
  const [emailExists, setEmailExists] = useState(false)
  const [emailCheckLoading, setEmailCheckLoading] = useState(false)
  const [phoneExists, setPhoneExists] = useState(false)
  const [phoneCheckLoading, setPhoneCheckLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [realtimeErrors, setRealtimeErrors] = useState({}) // Nouvelles erreurs en temps réel
  const [isRegulationOpen, setIsRegulationOpen] = useState(false)
  const [hasReadRegulation, setHasReadRegulation] = useState(false)

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
    otherLegalForm: "",
  })
  // Debounce pour la validation en temps réel
  const debouncedValidation = useCallback(
    (name, value) => {
      const timeoutId = setTimeout(() => {
        const fieldErrors = validateOrangeFabFieldRealtime(name, value, formData)

        setRealtimeErrors((prev) => {
          const newErrors = { ...prev }

          // Supprimer l'erreur existante pour ce champ
          delete newErrors[name]

          // Ajouter la nouvelle erreur si elle existe
          if (fieldErrors[name]) {
            newErrors[name] = fieldErrors[name]
          }

          return newErrors
        })
      }, 400) // Délai de 400ms

      return timeoutId
    },
    [formData],
  )

  // Stocker les timeouts pour pouvoir les annuler
  const [validationTimeouts, setValidationTimeouts] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const processedValue = sanitizeOrangeFabFieldValue(name, value)

    setFormData((prev) => buildInputFormData(prev, { name, type, checked, value: processedValue }))

    // Reset validation errors when user changes input
    if (name === "email") setEmailExists(false)
    if (name === "phone") setPhoneExists(false)

    // Clear validation errors for this field (validation au clic)
    if (validationErrors[name]) {
      setValidationErrors((prev) => clearFieldError(prev, name))
    }

    // Clear realtime errors for this field immediately
    if (realtimeErrors[name]) {
      setRealtimeErrors((prev) => clearFieldError(prev, name))
    }

    // Annuler le timeout précédent pour ce champ
    if (validationTimeouts[name]) {
      clearTimeout(validationTimeouts[name])
    }

    // Démarrer la validation en temps réel avec debounce (seulement pour les champs texte)
    if (type !== "checkbox" && type !== "file") {
      const timeoutId = debouncedValidation(name, type === "checkbox" ? checked : processedValue)
      setValidationTimeouts((prev) => ({
        ...prev,
        [name]: timeoutId,
      }))
    }
  }

  // Fonction pour gérer le blur (perte de focus)
  const handleBlur = (e) => {
    const { name, value } = e.target
    const fieldErrors = validateOrangeFabRequiredFieldOnBlur(name, value, formData)
    if (fieldErrors[name]) {
      setRealtimeErrors((prev) => ({
        ...prev,
        [name]: fieldErrors[name],
      }))
    }
  }

  // Vérification d'email avec l'API
  useEffect(() => {
    const checkEmailExists = async () => {
      if (!formData.email || formData.email.length < 5) return

      setEmailCheckLoading(true)
      try {
        const data = await checkOrangeFabEmailExists(formData.email)
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

  // Vérification de téléphone avec l'API (avec indicatif pays)
  useEffect(() => {
    const checkPhoneExists = async () => {
      if (!formData.phone || formData.phone.length < 8) return

      setPhoneCheckLoading(true)
      try {
        const fullPhone = formData.phoneCountry + formData.phone
        const data = await checkOrangeFabPhoneExists(fullPhone)
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

  const handleFileChange = (e) => {
    const { name, files } = e.target
    if (files && files[0]) {
      const file = files[0]
      const fileError = validateFile(file)

      if (fileError) {
        setValidationErrors((prev) => ({
          ...prev,
          [name]: fileError,
        }))
        setFormData((prev) => ({
          ...prev,
          [name]: null,
        }))
        e.target.value = ""
        return
      }

      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }))

      if (validationErrors[name]) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[name]
          return newErrors
        })
      }
      if (realtimeErrors[name]) {
        setRealtimeErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[name]
          return newErrors
        })
      }
    }
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => buildSelectFormData(prev, name, value))

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => clearFieldError(prev, name))
    }

    // Clear realtime error for this field
    if (realtimeErrors[name]) {
      setRealtimeErrors((prev) => clearFieldError(prev, name))
    }

    // Validation en temps réel pour les selects
    setTimeout(() => {
      const fieldErrors = validateOrangeFabFieldRealtime(name, value, formData)
      if (fieldErrors[name]) {
        setRealtimeErrors((prev) => ({
          ...prev,
          [name]: fieldErrors[name],
        }))
      }
    }, 100)
  }

  const handleRadioChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => clearFieldError(prev, name))
    }

    // Clear realtime error for this field
    if (realtimeErrors[name]) {
      setRealtimeErrors((prev) => clearFieldError(prev, name))
    }
  }

  // Fonction pour combiner les erreurs (temps réel + validation au clic)
  const getAllErrors = () => {
    return { ...realtimeErrors, ...validationErrors }
  }

  // Validation des étapes - se déclenche uniquement au clic sur "Suivant" (CONSERVÉE)
  const validateStep1 = () => {
    const errors = validateOrangeFabStep1(formData, { emailExists, phoneExists })
    setValidationErrors(errors)
    return Object.keys(errors).length === 0 && !emailCheckLoading && !phoneCheckLoading
  }

  const validateStep2 = () => {
    const errors = validateOrangeFabStep2(formData)
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep3 = () => {
    const errors = validateOrangeFabStep3(formData, { hasReadRegulation })
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const getStepValidation = (step) => {
    switch (step) {
      case 1:
        return validateStep1()
      case 2:
        return validateStep2()
      case 3:
        return validateStep3()
      default:
        return false
    }
  }

  // Ajouter une fonction pour faire défiler jusqu'au premier champ en erreur
  const scrollToFirstError = () => {
    // Attendre que le DOM soit mis à jour avec les erreurs
    setTimeout(() => {
      const errorElements = document.querySelectorAll(".border-red-500")
      if (errorElements.length > 0) {
        // Trouver l'élément le plus haut dans la page
        let topElement = errorElements[0]
        let topPosition = topElement.getBoundingClientRect().top

        errorElements.forEach((element) => {
          const position = element.getBoundingClientRect().top
          if (position < topPosition) {
            topPosition = position
            topElement = element
          }
        })

        // Faire défiler jusqu'à l'élément avec un petit décalage pour la visibilité
        topElement.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }, 100)
  }

  // Modifier la fonction nextStep pour implémenter le défilement automatique (CONSERVÉE)
  const nextStep = () => {
    if (getStepValidation(step)) {
      setStep(step + 1)
      window.scrollTo(0, 0)
    } else {
      // Faire défiler jusqu'au premier champ en erreur
      scrollToFirstError()
    }
  }

  const prevStep = () => {
    setStep(step - 1)
    setValidationErrors({}) // Clear errors when going back
    setRealtimeErrors({}) // Clear realtime errors when going back
    window.scrollTo(0, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError("")

    // Validation finale avec affichage des erreurs (CONSERVÉE)
    if (!validateStep3()) {
      // Faire défiler jusqu'au premier champ en erreur
      scrollToFirstError()
      return
    }

    setIsSubmitting(true)

    try {
      const form = buildApplicationFormData(formData)
      await submitOrangeFabApplication(form)

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
    <OrangeFabFormShell isSubmitted={isSubmitted} submitError={submitError} step={step} onSubmit={handleSubmit}>
      {step === 1 && (
        <OrangeFabStepOne
          formData={formData}
          errors={getAllErrors()}
          roles={roles}
          countryCodes={countryCodes}
          regionsData={regionsData}
          diplomas={diplomas}
          emailExists={emailExists}
          emailCheckLoading={emailCheckLoading}
          phoneExists={phoneExists}
          phoneCheckLoading={phoneCheckLoading}
          handleChange={handleChange}
          handleBlur={handleBlur}
          handleSelectChange={handleSelectChange}
          handlePhoneInput={handlePhoneInput}
          handleFileChange={handleFileChange}
          clearCv={() => setFormData((prev) => ({ ...prev, cv: null }))}
          onNext={nextStep}
          allowedExtensionsAccept={ALLOWED_EXTENSIONS_ACCEPT}
          maxFileSizeMb={MAX_FILE_SIZE_MB}
        />
      )}

      {step === 2 && (
        <OrangeFabStepTwo
          formData={formData}
          errors={getAllErrors()}
          sectors={sectors}
          legalForms={legalForms}
          handleChange={handleChange}
          handleBlur={handleBlur}
          handleSelectChange={handleSelectChange}
          handleRadioChange={handleRadioChange}
          handleFileChange={handleFileChange}
          clearPitchDeck={() => setFormData((prev) => ({ ...prev, pitchDeck: null }))}
          onPrevious={prevStep}
          onNext={nextStep}
          allowedExtensionsAccept={ALLOWED_EXTENSIONS_ACCEPT}
          maxFileSizeMb={MAX_FILE_SIZE_MB}
        />
      )}

      {step === 3 && (
        <OrangeFabStepThree
          formData={formData}
          errors={getAllErrors()}
          isSubmitting={isSubmitting}
          hasReadRegulation={hasReadRegulation}
          isRegulationOpen={isRegulationOpen}
          onRegulationOpenChange={setIsRegulationOpen}
          onRegulationAccept={() => {
            setHasReadRegulation(true)
            setIsRegulationOpen(false)
          }}
          setAcceptTerms={(checked) => setFormData((prev) => ({ ...prev, acceptTerms: checked }))}
          handleChange={handleChange}
          handleBlur={handleBlur}
          handleRadioChange={handleRadioChange}
          onPrevious={prevStep}
        />
      )}
    </OrangeFabFormShell>
  )
}
