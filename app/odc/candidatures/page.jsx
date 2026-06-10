"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { checkUniqueCandidatureField, submitOdcCandidature } from "@/lib/public-api"
import { FORM_FEEDBACK_MESSAGES, formatSubmissionErrorMessage } from "@/lib/form-feedback"
import { PublicFormSuccessState } from "@/components/ui/form-feedback"
import { countryCodes, formations, regions, getNationalitiesByLetter } from "./constants"
import { getMonthsForFormation, validateField, validateIdNumber } from "./validation"
import { buildNextFormData, clearFieldError, resetPhoneForCountryChange, sanitizeFieldValue } from "./input-helpers"
import OdcCandidatureFormShell from "./components/odc-candidature-form-shell"
import OdcIdentitySection from "./components/sections/odc-identity-section"
import OdcAvailabilitySection from "./components/sections/odc-availability-section"
import OdcValidationSection from "./components/sections/odc-validation-section"
import useCountrySelector from "./hooks/use-country-selector"

export default function CandidaturePage() {
  // Références pour le défilement vers les champs avec erreurs
  const formRef = useRef(null)
  const fieldRefs = useRef({})

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    birthPlace: "",
    gender: "",
    idNumber: "",
    nationality: "",
    region: "",
    currentStructure: "",
    education: "",
    speciality: "",
    computer_skills: undefined,
    isWorking: undefined,
    contractType: "",
    isAvailable: undefined,
    formation: "",
    acceptTerms: false,
  })

  const [idType, setIdType] = useState("") // "cni" ou "passport"
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [emailExists, setEmailExists] = useState(false)
  const [idNumberExists, setIdNumberExists] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [checkingIdNumber, setCheckingIdNumber] = useState(false)
  const [touchedFields, setTouchedFields] = useState({})

  // Récupérer les nationalités organisées par lettre
  const nationalitiesByLetter = getNationalitiesByLetter()

  // Marquer un champ comme touché et valider
  const markFieldAsTouched = (name) => {
    setTouchedFields((prev) => ({
      ...prev,
      [name]: true,
    }))

    // Valider le champ
    const error = validateField(name, formData[name], { idType, selectedCountry })
    if (error) {
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }))
    } else {
      // Supprimer l'erreur si le champ est valide
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Effet pour valider les champs requis en fonction de la formation sélectionnée
  useEffect(() => {
    if (formData.formation) {
      const newErrors = { ...errors }

      // Vérifier si la formation nécessite la disponibilité de 10 mois
      const requires10MonthsAvailability = ["dev-web-mobile", "referent-digital", "dev-data"].includes(
        formData.formation,
      )

      // Si le champ a été touché et que la formation nécessite la disponibilité
      if (touchedFields.isAvailable && requires10MonthsAvailability && formData.isAvailable === undefined) {
        newErrors.isAvailable = "Ce champ est obligatoire"
      } else {
        delete newErrors.isAvailable
      }
      setErrors(newErrors)
    }
  }, [formData.formation, formData.isAvailable, touchedFields.isAvailable])

  // Effet pour valider le numéro d'identité en fonction du type sélectionné
  useEffect(() => {
    if (touchedFields.idNumber && formData.idNumber) {
      const error = validateIdNumber(formData.idNumber, idType)
      if (error) {
        setErrors((prev) => ({
          ...prev,
          idNumber: error,
        }))
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.idNumber
          return newErrors
        })
      }
    }
  }, [idType, formData.idNumber, touchedFields.idNumber])

  // Réinitialiser les erreurs d'email et d'idNumber lorsque les valeurs changent
  useEffect(() => {
    if (formData.email && !checkingEmail) {
      // Si l'email a changé, réinitialiser l'état emailExists
      setEmailExists(false)
      // Supprimer l'erreur d'email si elle était liée à l'existence
      if (errors.email === FORM_FEEDBACK_MESSAGES.duplicateEmail) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.email
          return newErrors
        })
      }
    }
  }, [formData.email])

  useEffect(() => {
    if (formData.idNumber && !checkingIdNumber) {
      // Si le numéro d'identité a changé, réinitialiser l'état idNumberExists
      setIdNumberExists(false)

      // Supprimer l'erreur d'idNumber si elle était liée à l'existence
      if (errors.idNumber === FORM_FEEDBACK_MESSAGES.duplicateIdNumber) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.idNumber
          return newErrors
        })
      }
    }
  }, [formData.idNumber])

  // Réinitialiser l'erreur quand le type de pièce change
  useEffect(() => {
    if (idType) {
      setIdNumberExists(false)
      // Réinitialiser le numéro d'identité si le type change
      setFormData((prev) => ({
        ...prev,
        idNumber: "",
      }))

      // Supprimer l'erreur d'idNumber
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.idNumber
        return newErrors
      })
    }
  }, [idType])

  const onCountrySelect = useCallback(() => {
    setFormData((prev) => resetPhoneForCountryChange(prev))
    setErrors((prev) => clearFieldError(prev, "phone"))
  }, [])

  const {
    selectedCountry,
    showCountryDropdown,
    searchQuery,
    filteredCountries,
    setShowCountryDropdown,
    setSearchQuery,
    handleCountrySelect,
  } = useCountrySelector(countryCodes, { onCountrySelect })

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target
    let fieldValueForValidation = type === "checkbox" ? checked : value

    // Mise à jour des données du formulaire
    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      })
    } else {
      // Validation en temps réel pour les champs texte
      const newValue = sanitizeFieldValue({ name, value, selectedCountry, idType })
      setFormData((prev) => buildNextFormData(prev, name, newValue))

      // Vérification en temps réel pour email et CNI/passeport
      if (name === "email" && newValue.length >= 3 && !checkingEmail) {
        await checkUniqueFields("email", newValue)
      } else if (name === "idNumber" && newValue.length >= 3 && !checkingIdNumber) {
        await checkUniqueFields("idNumber", newValue)
      }
    }

    // Valider le champ si déjà touché
    if (touchedFields[name]) {
      const error = validateField(name, fieldValueForValidation, { idType, selectedCountry })
      if (error) {
        setErrors((prev) => ({
          ...prev,
          [name]: error,
        }))
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[name]
          return newErrors
        })
      }
    }
  }

  const handleBlur = (e) => {
    const { name } = e.target
    markFieldAsTouched(name)
  }

  const checkUniqueFields = async (field, value) => {
    if (!value || value.length < 3) return // Ne pas vérifier pour les valeurs trop courtes

    try {
      if (field === "email") setCheckingEmail(true)
      if (field === "idNumber") setCheckingIdNumber(true)


      const apiField = field === "idNumber" ? "cni_or_passport_number" : field
      const data = await checkUniqueCandidatureField(apiField, value)

      if (field === "email") {
        setEmailExists(data.exists)
        if (data.exists) {
          setErrors((prev) => ({ ...prev, email: FORM_FEEDBACK_MESSAGES.duplicateEmail }))
        } else {
          // Supprimer l'erreur si l'email n'existe pas
          setErrors((prev) => {
            const newErrors = { ...prev }
            if (newErrors.email === FORM_FEEDBACK_MESSAGES.duplicateEmail) {
              delete newErrors.email
            }
            return newErrors
          })
        }
      } else if (field === "idNumber") {
        setIdNumberExists(data.exists)
        if (data.exists) {
          setErrors((prev) => ({ ...prev, idNumber: FORM_FEEDBACK_MESSAGES.duplicateIdNumber }))
        } else {
          // Supprimer l'erreur si le numéro n'existe pas
          setErrors((prev) => {
            const newErrors = { ...prev }
            if (newErrors.idNumber === FORM_FEEDBACK_MESSAGES.duplicateIdNumber) {
              delete newErrors.idNumber
            }
            return newErrors
          })
        }
      }
    } catch (error) {
      console.error("Erreur de vérification:", error)
    } finally {
      if (field === "email") setCheckingEmail(false)
      if (field === "idNumber") setCheckingIdNumber(false)
    }
  }

  // Fonction pour faire défiler vers le premier champ avec erreur
  const scrollToFirstError = (errorFields) => {
    if (Object.keys(errorFields).length > 0) {
      const firstErrorField = Object.keys(errorFields)[0]
      const element = fieldRefs.current[firstErrorField]

      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
        element.focus()
      }
    }
  }

  const validateForm = () => {
    // Marquer tous les champs comme touchés
    const allFields = Object.keys(formData).concat("idType")
    const allTouched = allFields.reduce((acc, field) => {
      acc[field] = true
      return acc
    }, {})
    setTouchedFields(allTouched)

    const newErrors = {}

    // Valider tous les champs
    for (const field in formData) {
      const error = validateField(field, formData[field], { idType, selectedCountry })
      if (error) newErrors[field] = error
    }

    // Validation spécifique pour les champs radio
    if (formData.computer_skills === undefined) newErrors.computer_skills = "Ce champ est obligatoire"

    // Validation de la disponibilité en fonction de la formation
    const requires10MonthsAvailability = ["dev-web-mobile", "referent-digital", "dev-data"].includes(formData.formation)
    const isHackeusesOrAws = ["hackeuses", "aws-cloud"].includes(formData.formation)

    if (requires10MonthsAvailability && formData.isAvailable === undefined && !isHackeusesOrAws) {
      newErrors.isAvailable = "Ce champ est obligatoire"
    }

    // Validation du type de pièce d'identité
    if (!idType) {
      newErrors.idType = "Le type de pièce est requis"
    }

    // Validation des conditions d'utilisation
    if (!formData.acceptTerms) newErrors.acceptTerms = "Vous devez accepter les conditions"

    // Vérification des doublons
    if (emailExists) {
      newErrors.email = FORM_FEEDBACK_MESSAGES.duplicateEmail
    }
    if (idNumberExists) {
      newErrors.idNumber = FORM_FEEDBACK_MESSAGES.duplicateIdNumber
    }

    // Le champ est toujours obligatoire, quelle que soit la formation
    if (formData.isAvailable === undefined) {
      newErrors.isAvailable = "Ce champ est obligatoire"
    }

    // Validation pour le champ "Travaillez-vous actuellement ?"
    if (formData.isWorking === undefined) {
      newErrors.isWorking = "Veuillez répondre par Oui ou Non"
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError("")

    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      // Faire défiler vers le premier champ avec erreur
      setTimeout(() => {
        scrollToFirstError(newErrors)
      }, 100)
      return
    }

    setIsSubmitting(true)

    // Préparation des données pour l'envoi
    try {
      const candidatureData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: `${selectedCountry.code} ${formData.phone}`, // Indicatif et numéro clairement séparés
        date_of_birth: formData.birthDate,
        place_of_birth: formData.birthPlace,
        gender: formData.gender,
        id_type: idType,
        cni_or_passport_number: formData.idNumber,
        nationality: formData.nationality,
        region_of_residence: formData.region,
        current_structure: formData.currentStructure,
        education_level: formData.education,
        computer_skills: formData.computer_skills,
        available_for_10_months: ["dev-web-mobile", "referent-digital", "dev-data"].includes(formData.formation)
          ? formData.isAvailable
          : true, // Pour les formations de 4 mois, on considère que la disponibilité est toujours vraie
        desired_training: formData.formation,
        accept_conditions: formData.acceptTerms,
        speciality: formData.speciality,
        is_working: formData.isWorking,
        contract_type: formData.contractType,
      }

      //console.log("Tentative de connexion à:", "/api/candidatures/apply")

      await submitOdcCandidature(candidatureData)

      setIsSubmitted(true)

      // Réinitialiser le formulaire
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        birthDate: "",
        birthPlace: "",
        gender: "",
        idNumber: "",
        nationality: "",
        region: "",
        currentStructure: "",
        education: "",
        speciality: "",
        computer_skills: undefined,
        isWorking: undefined,
        contractType: "",
        isAvailable: undefined,
        formation: "",
        acceptTerms: false,
      })
    } catch (error) {
      console.error("Erreur:", error)
      setSubmitError(formatSubmissionErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <PublicFormSuccessState
          className=""
          descriptions={[
            "Merci pour votre candidature. Nous l'examinerons dans les plus brefs délais et vous contacterons pour la suite du processus.",
          ]}
          actionHref="/competences"
          actionLabel="Retour à la page des compétences"
        />
      </div>
    )
  }

  return (
    <OdcCandidatureFormShell formRef={formRef} onSubmit={handleSubmit}>
      <OdcIdentitySection
        formData={formData}
        errors={errors}
        fieldRefs={fieldRefs}
        touchedFields={touchedFields}
        checkingEmail={checkingEmail}
        checkingIdNumber={checkingIdNumber}
        emailExists={emailExists}
        idNumberExists={idNumberExists}
        showCountryDropdown={showCountryDropdown}
        searchQuery={searchQuery}
        filteredCountries={filteredCountries}
        selectedCountry={selectedCountry}
        idType={idType}
        nationalitiesByLetter={nationalitiesByLetter}
        formations={formations}
        regions={regions}
        setShowCountryDropdown={setShowCountryDropdown}
        setSearchQuery={setSearchQuery}
        handleCountrySelect={handleCountrySelect}
        handleChange={handleChange}
        handleBlur={handleBlur}
        setIdType={setIdType}
        setTouchedFields={setTouchedFields}
        setErrors={setErrors}
        validateIdNumber={validateIdNumber}
      />

      <OdcAvailabilitySection
        formData={formData}
        errors={errors}
        touchedFields={touchedFields}
        fieldRefs={fieldRefs}
        setFormData={setFormData}
        setErrors={setErrors}
        setTouchedFields={setTouchedFields}
        handleChange={handleChange}
        markFieldAsTouched={markFieldAsTouched}
      />

      <OdcValidationSection
        errors={errors}
        fieldRefs={fieldRefs}
        formData={formData}
        touchedFields={touchedFields}
        submitError={submitError}
        isSubmitting={isSubmitting}
        handleChange={handleChange}
        setTouchedFields={setTouchedFields}
      />
    </OdcCandidatureFormShell>
  )
}
