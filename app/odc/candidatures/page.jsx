"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Send, CheckCircle, ChevronDown, Search, AlertCircle} from "lucide-react"
import Link from "next/link"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { checkUniqueCandidatureField, submitOdcCandidature } from "@/lib/public-api"
import { countryCodes, formations, regions, getNationalitiesByLetter } from "./constants"
import { getMonthsForFormation, validateField, validateIdNumber } from "./validation"
import { buildNextFormData, clearFieldError, resetPhoneForCountryChange, sanitizeFieldValue } from "./input-helpers"

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

  // État pour le sélecteur de pays
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]) // Sénégal par défaut
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredCountries, setFilteredCountries] = useState(countryCodes)

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

  // Filtrer les pays en fonction de la recherche
  useEffect(() => {
    if (searchQuery) {
      const filtered = countryCodes.filter(
        (country) =>
          country.country.toLowerCase().includes(searchQuery.toLowerCase()) || country.code.includes(searchQuery),
      )
      setFilteredCountries(filtered)
    } else {
      setFilteredCountries(countryCodes)
    }
  }, [searchQuery])

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCountryDropdown && !event.target.closest(".country-selector")) {
        setShowCountryDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showCountryDropdown])

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
      if (errors.email === "Cet email est déjà utilisé") {
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
      if (errors.idNumber === "Ce numéro CNI/passeport est déjà utilisé") {
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

  // Fonction pour sélectionner un pays
  const handleCountrySelect = (country) => {
    setSelectedCountry(country)
    setShowCountryDropdown(false)

    setFormData((prev) => resetPhoneForCountryChange(prev))
    setErrors((prev) => clearFieldError(prev, "phone"))
  }

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

      const data = await checkUniqueCandidatureField(field, value)

      if (field === "email") {
        setEmailExists(data.exists)
        if (data.exists) {
          setErrors((prev) => ({ ...prev, email: "Cet email est déjà utilisé" }))
        } else {
          // Supprimer l'erreur si l'email n'existe pas
          setErrors((prev) => {
            const newErrors = { ...prev }
            if (newErrors.email === "Cet email est déjà utilisé") {
              delete newErrors.email
            }
            return newErrors
          })
        }
      } else if (field === "idNumber") {
        setIdNumberExists(data.exists)
        if (data.exists) {
          setErrors((prev) => ({ ...prev, idNumber: "Ce numéro CNI/passeport est déjà utilisé" }))
        } else {
          // Supprimer l'erreur si le numéro n'existe pas
          setErrors((prev) => {
            const newErrors = { ...prev }
            if (newErrors.idNumber === "Ce numéro CNI/passeport est déjà utilisé") {
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
      newErrors.email = "Cet email est déjà utilisé"
    }
    if (idNumberExists) {
      newErrors.idNumber = "Ce numéro CNI/passeport est déjà utilisé"
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
      setSubmitError(error.message || "Une erreur est survenue lors de l'envoi de la candidature")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Candidature envoyée avec succès !</h1>
          <p className="text-gray-600 mb-8">
            Merci pour votre candidature. Nous l'examinerons dans les plus brefs délais et vous contacterons pour la
            suite du processus.
          </p>
          <Button asChild className="bg-[#ff7900] hover:bg-[#e66f00]">
            <Link href="/competences">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la page des compétences
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[linear-gradient(180deg,_#fff9f4_0%,_#ffffff_22%)]">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm md:p-8">
            <Link href="/competences" className="inline-flex items-center text-sm font-medium text-[#ff7900] hover:text-[#e66f00]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
            <div className="mt-5">
              <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">Déposer ma candidature</h1>
              <p className="mt-3 text-base text-gray-600">
                Complétez le formulaire ci-dessous pour postuler à une formation.
              </p>
            </div>
          </div>

          <Alert variant="destructive" className="border-red-300 bg-red-50 shadow-sm">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800 font-bold">
              Attention - une double inscription entraîne une exclusion immédiate.
            </AlertTitle>
            <AlertDescription className="text-red-700">
              Chaque candidat ne peut s’inscrire qu’une seule fois. Toute tentative de double candidature sera
              automatiquement détectée et éliminera votre dossier sans possibilité de recours. Vérifiez
              attentivement vos informations avant de valider votre inscription.
            </AlertDescription>
          </Alert>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-lg md:p-8">
            <form onSubmit={handleSubmit} ref={formRef} className="space-y-8">
              <section className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5 md:p-6">
                <div className="mb-5">
                  <h2 className="text-xl font-semibold text-gray-900">1. Identité et contact</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Renseignez vos informations personnelles et votre pièce d&apos;identité.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  ref={(el) => (fieldRefs.current.firstName = el)}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7900] ${
                    errors.firstName ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                {!errors.firstName && <p className="text-gray-500 text-xs mt-1"></p>}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  ref={(el) => (fieldRefs.current.lastName = el)}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7900] ${
                    errors.lastName ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                {!errors.lastName && <p className="text-gray-500 text-xs mt-1"></p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                  {checkingEmail && <span className="ml-2 text-xs text-gray-500">Vérification...</span>}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  ref={(el) => (fieldRefs.current.email = el)}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7900] ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                {emailExists && !errors.email && (
                  <p className="text-red-500 text-xs mt-1">Cet email est déjà utilisé</p>
                )}
                {!errors.email && !emailExists && (
                  <p className="text-gray-500 text-xs mt-1">Exemple: nom@domaine.com</p>
                )}
              </div>

              {/* Champ téléphone avec sélecteur de pays */}
              <div className="xl:col-span-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone <span className="text-red-500">*</span>
                </label>

                <div className="flex country-selector">
                  {/* Sélecteur de pays */}
                  <div className="relative w-1/4 md:w-1/5">
                    {/* Modifier l'affichage du sélecteur de pays (enlever l'indicatif à côté de l'abréviation) */}
                    <button
                      type="button"
                      className={`w-full flex items-center justify-between px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#ff7900] ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    >
                      <span className="flex items-center">
                        <span className="text-gray-700 font-medium">{selectedCountry.abbr}</span>
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </button>

                    {showCountryDropdown && (
                      <div className="absolute z-10 mt-1 w-64 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
                        <div className="p-2 border-b">
                          <div className="relative">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Rechercher..."
                              className="w-full pl-8 pr-2 py-1 border rounded-md text-sm"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </div>
                        </div>
                        <ul>
                          {filteredCountries.map((country, index) => (
                            // Modifier l'affichage des pays dans la liste déroulante pour mieux organiser l'information
                            <li
                              key={index}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                              onClick={() => handleCountrySelect(country)}
                            >
                              <div className="flex items-center">
                                <span className="font-medium mr-2">{country.abbr}</span>
                                <span>{country.country}</span>
                              </div>
                              <span className="text-gray-500 font-medium">{country.code}</span>
                            </li>
                          ))}
                          {filteredCountries.length === 0 && (
                            <li className="px-3 py-2 text-gray-500">Aucun résultat</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Champ de saisie du numéro avec indicatif visuel */}
                  <div className="relative flex-1">
                    <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 text-gray-500 pointer-events-none">
                      {selectedCountry.code}
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      ref={(el) => (fieldRefs.current.phone = el)}
                      className={`w-full pl-16 px-4 py-2 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-[#ff7900] ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder={selectedCountry.format}
                    />
                  </div>
                </div>

                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Date de naissance <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="birthDate"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  ref={(el) => (fieldRefs.current.birthDate = el)}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7900] ${
                    errors.birthDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
              </div>

              <div>
                <label htmlFor="birthPlace" className="block text-sm font-medium text-gray-700 mb-1">
                  Lieu de naissance <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="birthPlace"
                  name="birthPlace"
                  value={formData.birthPlace}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  ref={(el) => (fieldRefs.current.birthPlace = el)}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7900] ${
                    errors.birthPlace ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.birthPlace && <p className="text-red-500 text-xs mt-1">{errors.birthPlace}</p>}
                {!errors.birthPlace && <p className="text-gray-500 text-xs mt-1"></p>}
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Genre <span className="text-red-500">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  ref={(el) => (fieldRefs.current.gender = el)}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7900] ${
                    errors.gender ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Sélectionnez votre genre</option>
                  <option value="male">Masculin</option>
                  <option value="female">Feminin</option>
                </select>
                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
              </div>

              <div>
                <label htmlFor="idType" className="block text-sm font-medium text-gray-700 mb-1">
                  Type de pièce d'identité <span className="text-red-500">*</span>
                </label>
                <select
                  id="idType"
                  name="idType"
                  value={idType}
                  onChange={(e) => {
                    setIdType(e.target.value)
                    setTouchedFields((prev) => ({ ...prev, idType: true }))
                    if (touchedFields.idNumber) {
                      // Revalider le numéro d'identité si le type change
                      const error = validateIdNumber(formData.idNumber, idType)
                      if (error) {
                        setErrors((prev) => ({ ...prev, idNumber: error }))
                      } else {
                        setErrors((prev) => {
                          const newErrors = { ...prev }
                          delete newErrors.idType
                          return newErrors
                        })
                      }
                    }
                  }}
                  onBlur={() => setTouchedFields((prev) => ({ ...prev, idType: true }))}
                  ref={(el) => (fieldRefs.current.idType = el)}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7900] ${
                    errors.idType ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Sélectionnez un type</option>
                  <option value="cni">CNI Sénégalaise</option>
                  <option value="passport">Passeport</option>
                </select>
                {errors.idType && <p className="text-red-500 text-xs mt-1">{errors.idType}</p>}
              </div>

              <div>
                <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  {idType === "cni" ? "N° CNI" : idType === "passport" ? "N° Passeport" : "N° CNI/Passeport"}
                  <span className="text-red-500">*</span>
                  {checkingIdNumber && <span className="ml-2 text-xs text-gray-500">Vérification...</span>}
                </label>
                <input
                  type="text"
                  id="idNumber"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  ref={(el) => (fieldRefs.current.idNumber = el)}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7900] ${
                    errors.idNumber ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder={
                    idType === "cni"
                      ? "13 à 14 caractères alphanumériques"
                      : idType === "passport"
                        ? "8 ou 9 caractères"
                        : ""
                  }
                />
                {errors.idNumber && <p className="text-red-500 text-xs mt-1">{errors.idNumber}</p>}
                {idNumberExists && !errors.idNumber && (
                  <p className="text-red-500 text-xs mt-1">Ce numéro CNI/passeport est déjà utilisé</p>
                )}
              </div>

              <div className="relative">
                <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-1">
                  Nationalité <span className="text-red-500">*</span>
                </label>
                <select
                  id="nationality"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  ref={(el) => (fieldRefs.current.nationality = el)}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7900] ${
                    errors.nationality ? "border-red-500" : "border-gray-300"
                  }`}
                  style={{ direction: "ltr" }}
                >
                  <option value="">Sélectionnez votre nationalité</option>
                  {Object.keys(nationalitiesByLetter)
                    .sort()
                    .map((letter) => (
                      <optgroup key={letter} label={letter}>
                        {nationalitiesByLetter[letter].map((nationality) => (
                          <option key={nationality} value={nationality}>
                            {nationality}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                </select>
                {errors.nationality && <p className="text-red-500 text-xs mt-1">{errors.nationality}</p>}
              </div>

              <div>
                <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                  Région de résidence <span className="text-red-500">*</span>
                </label>
                <select
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  ref={(el) => (fieldRefs.current.region = el)}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7900] ${
                    errors.region ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Sélectionnez votre région</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
                {errors.region && <p className="text-red-500 text-xs mt-1">{errors.region}</p>}
              </div>

              <div>
                <label htmlFor="formation" className="block text-sm font-medium text-gray-700 mb-1">
                  Formation souhaitée <span className="text-red-500">*</span>
                </label>
                <select
                  id="formation"
                  name="formation"
                  value={formData.formation}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  ref={(el) => (fieldRefs.current.formation = el)}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7900] ${
                    errors.formation ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Sélectionnez une formation</option>
                  {formations
                    .filter((formation) => !(formation.femaleOnly && formData.gender === "male"))
                    .map((formation) => (
                      <option key={formation.id} value={formation.id}>
                        {formation.name}
                      </option>
                    ))}
                </select>
                {errors.formation && <p className="text-red-500 text-xs mt-1">{errors.formation}</p>}
              </div>

              <div>
                <label htmlFor="currentStructure" className="block text-sm font-medium text-gray-700 mb-1">
                  Structure actuelle
                </label>
                <select
                  id="currentStructure"
                  name="currentStructure"
                  value={formData.currentStructure}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  ref={(el) => (fieldRefs.current.currentStructure = el)}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7900] ${
                    errors.currentStructure ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Sélectionnez votre structure</option>
                  {formData.formation === "hackeuses" ? (
                    <>
                      <option value="ecole-formation">École de formation</option>
                      <option value="lycee">Lycée</option>
                      <option value="college">Collège</option>
                      <option value="primaire">Primaire</option>
                    </>
                  ) : formData.formation === "aws-cloud" ||
                    formData.formation === "cyber-security" ||
                    formData.formation === "intelligence-artificielle" ? (
                    <>
                      <option value="ecole-formation">École de formation</option>
                      <option value="universite">Université</option>
                    </>
                  ) : (
                    <>
                      <option value="universite">Université</option>
                      <option value="lycee">Lycée</option>
                      <option value="ecole-formation">École de formation</option>
                    </>
                  )}
                </select>
                {errors.currentStructure && <p className="text-red-500 text-xs mt-1">{errors.currentStructure}</p>}
              </div>

              <div>
                <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
                  Niveau d'études <span className="text-red-500">*</span>
                </label>
                <select
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  ref={(el) => (fieldRefs.current.education = el)}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7900] ${
                    errors.education ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Sélectionnez votre niveau</option>
                  {formData.formation === "hackeuses" ? (
                    <>
                      <option value="4ème">4ème</option>
                      <option value="3ème">3ème</option>
                      <option value="terminale">Terminal</option>
                      <option value="licence1">Licence 1</option>
                      <option value="licence2">Licence 2</option>
                      <option value="licence3">Licence 3</option>
                      <option value="master1">Master 1</option>
                      <option value="master2">Master 2</option>
                      <option value="cm2">CM2</option>
                    </>
                  ) : formData.formation === "aws-cloud" ||
                    formData.formation === "cyber-security" ||
                    formData.formation === "intelligence-artificielle" ? (
                    <>
                      <option value="licence3">Licence 3 ou équivalent</option>
                      <option value="master1">Master 1 ou équivalent</option>
                      <option value="master2">Master 2 ou équivalent</option>
                    </>
                  ) : (
                    // Options pour les autres formations
                    <>
                      <option value="terminale">Terminale</option>
                      <option value="bts">BTS</option>
                      <option value="licence1">Licence 1 ou équivalent</option>
                      <option value="licence2">Licence 2 ou équivalent</option>
                      <option value="licence3">Licence 3 ou équivalent</option>
                      <option value="master1">Master 1 ou équivalent</option>
                      <option value="master2">Master 2 ou équivalent</option>
                    </>
                  )}
                </select>
                {errors.education && <p className="text-red-500 text-xs mt-1">{errors.education}</p>}
              </div>

              <div>
                <label htmlFor="speciality" className="block text-sm font-medium text-gray-700 mb-1">
                  Spécialité
                </label>
                <input
                  type="text"
                  id="speciality"
                  name="speciality"
                  value={formData.speciality}
                  onChange={handleChange}
                  placeholder="Faculté, UFR, Série..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7900]"
                />
              </div>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
                <div className="mb-5">
                  <h2 className="text-xl font-semibold text-gray-900">2. Disponibilités</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Indiquez votre situation actuelle et votre disponibilité pour la formation.
                  </p>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                As-tu des notions en informatique ? <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap items-center gap-4">
                {/* Option "Oui" */}
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="computer_skills"
                    checked={formData.computer_skills === true}
                    onChange={() => {
                      setFormData({ ...formData, computer_skills: true })
                      setErrors((prev) => ({ ...prev, computer_skills: null })) // Supprime l'erreur
                    }}
                    className="text-[#ff7900] focus:ring-[#ff7900]"
                  />
                  <span className="ml-2">Oui</span>
                </label>
                {/* Option "Non" */}
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="computer_skills"
                    checked={formData.computer_skills === false}
                    onChange={() => {
                      setFormData({ ...formData, computer_skills: false })
                      setErrors((prev) => ({ ...prev, computer_skills: null })) // Supprime l'erreur
                    }}
                    className="text-[#ff7900] focus:ring-[#ff7900]"
                  />
                  <span className="ml-2">Non</span>
                </label>
              </div>
              {errors.computer_skills && (
                <p className="text-red-500 text-xs mt-1">Veuillez sélectionner une réponse.</p>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                ref={(el) => (fieldRefs.current.isWorking = el)}
              >
                Travaillez-vous dans une entreprise actuellement?<span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="isWorking"
                    checked={formData.isWorking === true}
                    onChange={() => {
                      setFormData({ ...formData, isWorking: true })
                      setErrors((prev) => ({ ...prev, isWorking: undefined })) // Efface l'erreur quand on sélectionne
                    }}
                    onBlur={() => markFieldAsTouched("isWorking")} // Marque comme touché
                    className="text-[#ff7900] focus:ring-[#ff7900]"
                  />
                  <span className="ml-2">Oui</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="isWorking"
                    checked={formData.isWorking === false}
                    onChange={() => {
                      setFormData({ ...formData, isWorking: false })
                      setErrors((prev) => ({ ...prev, isWorking: undefined })) // Efface l'erreur quand on sélectionne
                    }}
                    onBlur={() => markFieldAsTouched("isWorking")} // Marque comme touché
                    className="text-[#ff7900] focus:ring-[#ff7900]"
                  />
                  <span className="ml-2">Non</span>
                </label>
              </div>
              {/* Ajoutez ce message d'erreur */}
              {errors.isWorking && touchedFields.isWorking && (
                <p className="text-red-500 text-xs mt-1">{errors.isWorking}</p>
              )}

              {formData.isWorking && (
                <div className="mt-4">
                  <label htmlFor="contractType" className="block text-sm font-medium text-gray-700 mb-1">
                    Type de contrat
                  </label>
                  <select
                    id="contractType"
                    name="contractType"
                    value={formData.contractType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7900]"
                  >
                    <option value="">Sélectionnez votre type de contrat</option>
                    <option value="stage">Stage</option>
                    <option value="cdd">CDD</option>
                    <option value="cdi">CDI</option>
                    <option value="prestataire">Prestataire</option>
                    <option value="interim">Intérim</option>
                  </select>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 lg:col-span-2">
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                ref={(el) => (fieldRefs.current.isAvailable = el)}
              >
                Es-tu disponible pour te concentrer exclusivement à la formation pendant quelques mois ?{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap items-center gap-4">
                {/* Option "Oui" */}
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="isAvailable"
                    checked={formData.isAvailable === true}
                    onChange={() => {
                      setFormData({ ...formData, isAvailable: true })
                      setErrors((prev) => {
                        const newErrors = { ...prev }
                        delete newErrors.isAvailable
                        return newErrors
                      })
                      setTouchedFields((prev) => ({ ...prev, isAvailable: true }))
                    }}
                    className="text-[#ff7900] focus:ring-[#ff7900]"
                  />
                  <span className="ml-2">Oui</span>
                </label>
                {/* Option "Non" */}
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="isAvailable"
                    checked={formData.isAvailable === false}
                    onChange={() => {
                      setFormData({ ...formData, isAvailable: false })
                      setErrors((prev) => {
                        const newErrors = { ...prev }
                        delete newErrors.isAvailable
                        return newErrors
                      })
                      setTouchedFields((prev) => ({ ...prev, isAvailable: true }))
                    }}
                    className="text-[#ff7900] focus:ring-[#ff7900]"
                  />
                  <span className="ml-2">Non</span>
                </label>
              </div>
              {errors.isAvailable && <p className="text-red-500 text-xs mt-1">{errors.isAvailable}</p>}
            </div>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5 md:p-6">
                <div className="mb-5">
                  <h2 className="text-xl font-semibold text-gray-900">3. Validation</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Vérifiez les informations saisies avant d&apos;envoyer votre candidature.
                  </p>
                </div>

            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4">
              <label className="flex items-start" ref={(el) => (fieldRefs.current.acceptTerms = el)}>
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  onBlur={() => setTouchedFields((prev) => ({ ...prev, acceptTerms: true }))}
                  className={`mt-1 mr-2 ${errors.acceptTerms ? "border-red-500" : ""}`}
                />
                <span className="text-sm text-gray-700">
                  <span className="text-red-500">*</span>J'accepte que mes données personnelles soient traitées
                  conformément à la politique de confidentialité.
                </span>
              </label>
              {errors.acceptTerms && <p className="text-red-500 text-xs mt-1">{errors.acceptTerms}</p>}
            </div>

            {submitError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{submitError}</div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                className="flex w-full items-center justify-center bg-[#ff7900] hover:bg-[#e66f00] md:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    Envoyer ma candidature <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
              </section>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
