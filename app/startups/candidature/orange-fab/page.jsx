"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, ArrowLeft, Upload, AlertCircle, FileText, Lightbulb } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  countryCodes,
  diplomas,
  legalForms,
  regionsData,
  roles,
  sectors,
} from "./constants"
import {
  buildInputFormData,
  buildSelectFormData,
  clearFieldError,
  handlePhoneInput,
  sanitizeOrangeFabFieldValue,
} from "./input-helpers"
import {
  validateFieldRealtime as validateOrangeFabFieldRealtime,
  validateFileType,
  validateRequiredFieldOnBlur as validateOrangeFabRequiredFieldOnBlur,
  validateStep1 as validateOrangeFabStep1,
  validateStep2 as validateOrangeFabStep2,
  validateStep3 as validateOrangeFabStep3,
} from "./validation"
import {
  OrangeFabInfoTab,
  OrangeFabProgressSteps,
  OrangeFabRegulationDialog,
  OrangeFabSuccessState,
} from "./ui-sections"


export default function OrangeFabCandidaturePage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
        //const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orangefab/check-email?email=${encodeURIComponent(formData.email)}`)

        if (response.ok) {
          const data = await response.json()
          setEmailExists(data.exists)
        }
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
        //const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        const fullPhone = formData.phoneCountry + formData.phone
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orangefab/check-phone?phone=${encodeURIComponent(fullPhone)}`)

        if (response.ok) {
          const data = await response.json()
          setPhoneExists(data.exists)
        }
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
      const maxSize = 128 * 1024 * 1024 

      // Validation du type de fichier
      if (!validateFileType(file)) {
        setValidationErrors((prev) => ({
          ...prev,
          [name]:
            "Type de fichier non autorisé. Formats acceptés : Images (PNG, JPG, JPEG, GIF, BMP, WEBP), Documents Word (DOC, DOCX), PowerPoint (PPT, PPTX), PDF",
        }))
        return
      }

      if (file.size > maxSize) {
        setValidationErrors((prev) => ({
          ...prev,
          [name]: "Le fichier est trop volumineux. Taille maximale : 128MB",
        }))
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

    // Validation finale avec affichage des erreurs (CONSERVÉE)
    if (!validateStep3()) {
      // Faire défiler jusqu'au premier champ en erreur
      scrollToFirstError()
      return
    }

    setIsSubmitting(true)

    try {
      const form = new FormData()

      // Ajouter tous les champs au FormData
      Object.keys(formData).forEach((key) => {
        if (key !== "cv" && key !== "pitchDeck") {
          form.append(key, formData[key])
        }
      })

      // Ajouter le téléphone complet avec indicatif
      form.append("fullPhone", formData.phoneCountry + formData.phone)

      // Ajouter les fichiers
      if (formData.cv) form.append("cv", formData.cv)
      if (formData.pitchDeck) form.append("pitch_deck", formData.pitchDeck)

      //const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orangefab/`, {
        method: "POST",
        body: form,
      })

      if (!response.ok) {
        const err = await response.json()
        alert(`Erreur : ${err.error || "Échec de la soumission."}`)
        return
      }

      setIsSubmitted(true)
    } catch (error) {
      console.error("Erreur lors de la soumission :", error)
      alert("Erreur lors de la soumission : " + error.message)
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
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <Link href="/startups" className="flex items-center text-orange-500 hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'espace Startups
          </Link>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Candidature Orange Fab
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Postulez pour rejoindre notre programme d'accompagnement pour startups en phase d'idéation et de
            prototypage.
          </p>
        </div>

        <Tabs defaultValue="apply" className="mt-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="apply">Candidature</TabsTrigger>
            <TabsTrigger value="info">Informations</TabsTrigger>
          </TabsList>

          <TabsContent value="apply">
            {isSubmitted ? (
              <OrangeFabSuccessState />
            ) : (
              <>
                {/* Form Section */}
                <section className="py-16 bg-gray-50 dark:bg-gray-800">
                  <div className="container mx-auto px-4">
                    <Card className="max-w-4xl mx-auto">
                      <CardHeader>
                        <CardTitle>Formulaire de candidature</CardTitle>
                        <CardDescription>
                          Veuillez remplir ce formulaire pour postuler au programme Orange Fab. Les champs marqués d'un
                          astérisque (<span className="text-red-500">*</span>) sont obligatoires.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <OrangeFabProgressSteps step={step} />

                        <form onSubmit={handleSubmit}>
                          {/* Step 1: Informations personnelles */}
                          {step === 1 && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor="firstName">
                                    Prénom <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
                                    className={getAllErrors().firstName ? "border-red-500" : ""}
                                  />
                                  {getAllErrors().firstName && (
                                    <Alert variant="destructive" className="mt-2 py-2">
                                      <AlertCircle className="h-4 w-4" />
                                      <AlertDescription>{getAllErrors().firstName}</AlertDescription>
                                    </Alert>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="lastName">
                                    Nom <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
                                    className={getAllErrors().lastName ? "border-red-500" : ""}
                                  />
                                  {getAllErrors().lastName && (
                                    <Alert variant="destructive" className="mt-2 py-2">
                                      <AlertCircle className="h-4 w-4" />
                                      <AlertDescription>{getAllErrors().lastName}</AlertDescription>
                                    </Alert>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="role">
                                  Rôle dans le Startup <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                  value={formData.role}
                                  onValueChange={(value) => handleSelectChange("role", value)}
                                  required
                                >
                                  <SelectTrigger className={getAllErrors().role ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Sélectionnez votre rôle" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {roles.map((role) => (
                                      <SelectItem key={role.value} value={role.value}>
                                        {role.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {getAllErrors().role && (
                                  <Alert variant="destructive" className="mt-2 py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{getAllErrors().role}</AlertDescription>
                                  </Alert>
                                )}

                                {formData.role === "Autre" && (
                                  <div className="mt-2">
                                    <Input
                                      id="otherRole"
                                      name="otherRole"
                                      value={formData.otherRole}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      placeholder="Précisez votre rôle"
                                      required
                                      className={getAllErrors().otherRole ? "border-red-500" : ""}
                                    />
                                    {getAllErrors().otherRole && (
                                      <Alert variant="destructive" className="mt-2 py-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{getAllErrors().otherRole}</AlertDescription>
                                      </Alert>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor="email">
                                    Email <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
                                    className={`${emailExists || getAllErrors().email ? "border-red-500" : ""}`}
                                  />
                                  {emailExists && (
                                    <Alert variant="destructive" className="mt-2 py-2">
                                      <AlertCircle className="h-4 w-4" />
                                      <AlertDescription>Cet email a déjà été utilisé pour une candidature.</AlertDescription>
                                    </Alert>
                                  )}
                                  {getAllErrors().email && !emailExists && (
                                    <Alert variant="destructive" className="mt-2 py-2">
                                      <AlertCircle className="h-4 w-4" />
                                      <AlertDescription>{getAllErrors().email}</AlertDescription>
                                    </Alert>
                                  )}
                                  {emailCheckLoading && (
                                    <p className="text-sm text-gray-500 mt-1">Vérification en cours...</p>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="emailAlternate">Email autre contact</Label>
                                  <Input
                                    id="emailAlternate"
                                    name="emailAlternate"
                                    type="email"
                                    value={formData.emailAlternate}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={getAllErrors().emailAlternate ? "border-red-500" : ""}
                                  />
                                  {getAllErrors().emailAlternate && (
                                    <Alert variant="destructive" className="mt-2 py-2">
                                      <AlertCircle className="h-4 w-4" />
                                      <AlertDescription>{getAllErrors().emailAlternate}</AlertDescription>
                                    </Alert>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="phone">
                                  Téléphone <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex">
                                  <Select
                                    value={formData.phoneCountry}
                                    onValueChange={(value) => handleSelectChange("phoneCountry", value)}
                                  >
                                    <SelectTrigger className="w-32 rounded-r-none border-r-0">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {countryCodes.map((country) => (
                                        <SelectItem key={country.code} value={country.code}>
                                          <span className="flex items-center gap-2">
                                            <span>{country.flag}</span>
                                            <span>{country.code}</span>
                                          </span>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    onKeyDown={handlePhoneInput}
                                    placeholder="771234567"
                                    required
                                    className={`rounded-l-none ${phoneExists || getAllErrors().phone ? "border-red-500" : ""}`}
                                  />
                                </div>
                                {phoneExists && (
                                  <Alert variant="destructive" className="mt-2 py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                      Ce numéro de téléphone a déjà été utilisé pour une candidature.
                                    </AlertDescription>
                                  </Alert>
                                )}
                                {getAllErrors().phone && !phoneExists && (
                                  <Alert variant="destructive" className="mt-2 py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{getAllErrors().phone}</AlertDescription>
                                  </Alert>
                                )}
                                {phoneCheckLoading && <p className="text-sm text-gray-500 mt-1">Vérification en cours...</p>}
                                <p className="text-xs text-gray-500">Saisissez uniquement des chiffres</p>
                              </div>

                              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor="region">
                                    Région <span className="text-red-500">*</span>
                                  </Label>
                                  <Select
                                    value={formData.region}
                                    onValueChange={(value) => handleSelectChange("region", value)}
                                    required
                                  >
                                    <SelectTrigger className={getAllErrors().region ? "border-red-500" : ""}>
                                      <SelectValue placeholder="Sélectionnez votre région" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Object.keys(regionsData).map((region) => (
                                        <SelectItem key={region} value={region}>
                                          {region}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  {getAllErrors().region && (
                                    <Alert variant="destructive" className="mt-2 py-2">
                                      <AlertCircle className="h-4 w-4" />
                                      <AlertDescription>{getAllErrors().region}</AlertDescription>
                                    </Alert>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="department">
                                    Département <span className="text-red-500">*</span>
                                  </Label>
                                  <Select
                                    value={formData.department}
                                    onValueChange={(value) => handleSelectChange("department", value)}
                                    required
                                    disabled={!formData.region}
                                  >
                                    <SelectTrigger className={getAllErrors().department ? "border-red-500" : ""}>
                                      <SelectValue placeholder="Sélectionnez votre département" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {formData.region &&
                                        regionsData[formData.region]?.map((department) => (
                                          <SelectItem key={department} value={department}>
                                            {department}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                  {getAllErrors().department && (
                                    <Alert variant="destructive" className="mt-2 py-2">
                                      <AlertCircle className="h-4 w-4" />
                                      <AlertDescription>{getAllErrors().department}</AlertDescription>
                                    </Alert>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="diploma">
                                  Diplôme <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                  value={formData.diploma}
                                  onValueChange={(value) => handleSelectChange("diploma", value)}
                                  required
                                >
                                  <SelectTrigger className={getAllErrors().diploma ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Sélectionnez votre diplôme" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {diplomas.map((diploma) => (
                                      <SelectItem key={diploma.value} value={diploma.value}>
                                        {diploma.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {getAllErrors().diploma && (
                                  <Alert variant="destructive" className="mt-2 py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{getAllErrors().diploma}</AlertDescription>
                                  </Alert>
                                )}

                                {formData.diploma === "autre" && (
                                  <div className="mt-2">
                                    <Input
                                      id="otherDiploma"
                                      name="otherDiploma"
                                      value={formData.otherDiploma}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      placeholder="Précisez votre diplôme"
                                      required
                                      className={getAllErrors().otherDiploma ? "border-red-500" : ""}
                                    />
                                    {getAllErrors().otherDiploma && (
                                      <Alert variant="destructive" className="mt-2 py-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{getAllErrors().otherDiploma}</AlertDescription>
                                      </Alert>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="institution">Établissement</Label>
                                <Input
                                  id="institution"
                                  name="institution"
                                  value={formData.institution}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  className={getAllErrors().institution ? "border-red-500" : ""}
                                />
                                {getAllErrors().institution && (
                                  <Alert variant="destructive" className="mt-2 py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{getAllErrors().institution}</AlertDescription>
                                  </Alert>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="cv">
                                  CV <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center justify-center w-full">
                                    <label
                                      htmlFor="cv"
                                      className={`flex flex-col items-center justify-center w-full h-32 border-2 ${getAllErrors().cv ? "border-red-500" : "border-gray-300"} border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500`}
                                    >
                                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {formData.cv ? (
                                          <>
                                            <FileText className="w-8 h-8 mb-3 text-green-500" />
                                            <p className="mb-2 text-sm text-green-500 font-semibold">Fichier sélectionné</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                              {formData.cv.name} ({(formData.cv.size / 1024 / 1024).toFixed(2)} MB)
                                            </p>
                                          </>
                                        ) : (
                                          <>
                                            <Upload className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" />
                                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                              <span className="font-semibold">Cliquez pour télécharger</span> ou
                                              glissez-déposez
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                              Images, Word, PowerPoint, PDF (MAX. 128MB)
                                            </p>
                                          </>
                                        )}
                                      </div>
                                      <input
                                        id="cv"
                                        name="cv"
                                        type="file"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept=".png,.jpg,.jpeg,.gif,.bmp,.webp,.doc,.docx,.ppt,.pptx,.pdf"
                                        required
                                      />
                                    </label>
                                  </div>
                                  {getAllErrors().cv && (
                                    <Alert variant="destructive" className="mt-2 py-2">
                                      <AlertCircle className="h-4 w-4" />
                                      <AlertDescription>{getAllErrors().cv}</AlertDescription>
                                    </Alert>
                                  )}
                                  {formData.cv && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setFormData((prev) => ({ ...prev, cv: null }))}
                                      className="w-full md:w-auto"
                                    >
                                      Changer de document
                                    </Button>
                                  )}
                                </div>
                              </div>

                              <div className="flex justify-end">
                                <Button
                                  type="button"
                                  onClick={nextStep}
                                  className="bg-orange-500 hover:bg-orange-600 transition-colors"
                                >
                                  Suivant <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Step 2: Informations entreprise */}
                          {step === 2 && (
                            <div className="space-y-6">
                              <div className="space-y-2">
                                <Label htmlFor="companyName">
                                  Nom de l'entreprise <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id="companyName"
                                  name="companyName"
                                  value={formData.companyName}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  required
                                  className={getAllErrors().companyName ? "border-red-500" : ""}
                                />
                                {getAllErrors().companyName && (
                                  <Alert variant="destructive" className="mt-2 py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{getAllErrors().companyName}</AlertDescription>
                                  </Alert>
                                )}
                              </div>

                              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor="website">Site web</Label>
                                  <Input
                                    id="website"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    placeholder="https://"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="ninea">
                                    NINEA ou régie de commerce <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id="ninea"
                                    name="ninea"
                                    value={formData.ninea}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
                                    className={getAllErrors().ninea ? "border-red-500" : ""}
                                  />
                                  {getAllErrors().ninea && (
                                    <Alert variant="destructive" className="mt-2 py-2">
                                      <AlertCircle className="h-4 w-4" />
                                      <AlertDescription>{getAllErrors().ninea}</AlertDescription>
                                    </Alert>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="sector">
                                  Secteur d'activité <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                  value={formData.sector}
                                  onValueChange={(value) => handleSelectChange("sector", value)}
                                  required
                                >
                                  <SelectTrigger className={getAllErrors().sector ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Sélectionnez un secteur" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {sectors.map((sector) => (
                                      <SelectItem key={sector.value} value={sector.value}>
                                        {sector.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {getAllErrors().sector && (
                                  <Alert variant="destructive" className="mt-2 py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{getAllErrors().sector}</AlertDescription>
                                  </Alert>
                                )}

                                {formData.sector === "other" && (
                                  <div className="mt-2">
                                    <Input
                                      id="otherSector"
                                      name="otherSector"
                                      value={formData.otherSector}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      placeholder="Précisez le secteur"
                                      required
                                      className={getAllErrors().otherSector ? "border-red-500" : ""}
                                    />
                                    {getAllErrors().otherSector && (
                                      <Alert variant="destructive" className="mt-2 py-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{getAllErrors().otherSector}</AlertDescription>
                                      </Alert>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor="businessModel">
                                    Modèle d'affaire <span className="text-red-500">*</span>
                                  </Label>
                                  <Select
                                    value={formData.businessModel}
                                    onValueChange={(value) => handleSelectChange("businessModel", value)}
                                    required
                                  >
                                    <SelectTrigger className={getAllErrors().businessModel ? "border-red-500" : ""}>
                                      <SelectValue placeholder="Sélectionnez un modèle" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="B2B">B2B</SelectItem>
                                      <SelectItem value="B2C">B2C</SelectItem>
                                      <SelectItem value="B2B2C">B2B2C</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  {getAllErrors().businessModel && (
                                    <Alert variant="destructive" className="mt-2 py-2">
                                      <AlertCircle className="h-4 w-4" />
                                      <AlertDescription>{getAllErrors().businessModel}</AlertDescription>
                                    </Alert>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="creationDate">
                                    Date de création <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id="creationDate"
                                    name="creationDate"
                                    type="date"
                                    value={formData.creationDate}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
                                    className={getAllErrors().creationDate ? "border-red-500" : ""}
                                  />
                                  {getAllErrors().creationDate && (
                                    <Alert variant="destructive" className="mt-2 py-2">
                                      <AlertCircle className="h-4 w-4" />
                                      <AlertDescription>{getAllErrors().creationDate}</AlertDescription>
                                    </Alert>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="legalForm">
                                  Forme juridique <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                  value={formData.legalForm}
                                  onValueChange={(value) => handleSelectChange("legalForm", value)}
                                  required
                                >
                                  <SelectTrigger className={getAllErrors().legalForm ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Sélectionnez une forme juridique" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {legalForms.map((form) => (
                                      <SelectItem key={form.value} value={form.value}>
                                        {form.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {getAllErrors().legalForm && (
                                  <Alert variant="destructive" className="mt-2 py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{getAllErrors().legalForm}</AlertDescription>
                                  </Alert>
                                )}

                                {formData.legalForm === "Autre" && (
                                  <div className="mt-2">
                                    <Input
                                      id="otherLegalForm"
                                      name="otherLegalForm"
                                      value={formData.otherLegalForm}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      placeholder="Précisez la forme juridique"
                                      required
                                      className={getAllErrors().otherLegalForm ? "border-red-500" : ""}
                                    />
                                    {getAllErrors().otherLegalForm && (
                                      <Alert variant="destructive" className="mt-2 py-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{getAllErrors().otherLegalForm}</AlertDescription>
                                      </Alert>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor="capital">Capital</Label>
                                  <div className="flex">
                                    <Input
                                      id="capital"
                                      name="capital"
                                      value={formData.capital}
                                      onChange={handleChange}
                                      placeholder="Montant"
                                      className="rounded-r-none"
                                    />
                                    <Select
                                      value={formData.capitalCurrency}
                                      onValueChange={(value) => handleSelectChange("capitalCurrency", value)}
                                    >
                                      <SelectTrigger className="w-24 rounded-l-none border-l-0">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="F CFA">F CFA</SelectItem>
                                        <SelectItem value="$">$</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="employees">
                                    Nombre d'employés <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id="employees"
                                    name="employees"
                                    type="number"
                                    value={formData.employees}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
                                    className={getAllErrors().employees ? "border-red-500" : ""}
                                  />
                                  {getAllErrors().employees && (
                                    <Alert variant="destructive" className="mt-2 py-2">
                                      <AlertCircle className="h-4 w-4" />
                                      <AlertDescription>{getAllErrors().employees}</AlertDescription>
                                    </Alert>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="address">Adresse du siège social</Label>
                                <Input id="address" name="address" value={formData.address} onChange={handleChange} />
                              </div>

                              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor="revenue">Chiffre d'affaire</Label>
                                  <div className="flex">
                                    <Input
                                      id="revenue"
                                      name="revenue"
                                      value={formData.revenue}
                                      onChange={handleChange}
                                      placeholder="Montant"
                                      className="rounded-r-none"
                                    />
                                    <Select
                                      value={formData.revenueCurrency}
                                      onValueChange={(value) => handleSelectChange("revenueCurrency", value)}
                                    >
                                      <SelectTrigger className="w-24 rounded-l-none border-l-0">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="F CFA">F CFA</SelectItem>
                                        <SelectItem value="$">$</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label>
                                  Avez-vous levé des fonds <span className="text-red-500">*</span>
                                </Label>
                                <RadioGroup
                                  value={formData.raisedFunds}
                                  onValueChange={(value) => handleRadioChange("raisedFunds", value)}
                                  className="flex flex-row space-x-6"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Oui" id="funds-yes" />
                                    <Label htmlFor="funds-yes">Oui</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Non" id="funds-no" />
                                    <Label htmlFor="funds-no">Non</Label>
                                  </div>
                                </RadioGroup>
                                {getAllErrors().raisedFunds && (
                                  <Alert variant="destructive" className="mt-2 py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{getAllErrors().raisedFunds}</AlertDescription>
                                  </Alert>
                                )}

                                {formData.raisedFunds === "Oui" && (
                                  <div className="mt-4 space-y-2">
                                    <Label htmlFor="raisedAmount">
                                      Montant levé <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="flex">
                                      <Input
                                        id="raisedAmount"
                                        name="raisedAmount"
                                        value={formData.raisedAmount}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Montant"
                                        required
                                        className={`rounded-r-none ${getAllErrors().raisedAmount ? "border-red-500" : ""}`}
                                      />
                                      <Select
                                        value={formData.raisedCurrency}
                                        onValueChange={(value) => handleSelectChange("raisedCurrency", value)}
                                      >
                                        <SelectTrigger className="w-24 rounded-l-none border-l-0">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="F CFA">F CFA</SelectItem>
                                          <SelectItem value="$">$</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    {getAllErrors().raisedAmount && (
                                      <Alert variant="destructive" className="mt-2 py-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{getAllErrors().raisedAmount}</AlertDescription>
                                      </Alert>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="clients">Références clients</Label>
                                <Textarea
                                  id="clients"
                                  name="clients"
                                  value={formData.clients}
                                  onChange={handleChange}
                                  rows={3}
                                  placeholder="Citez vos principales références clients"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="pitchDeck">
                                  Document de présentation (pitch deck) <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center justify-center w-full">
                                    <label
                                      htmlFor="pitchDeck"
                                      className={`flex flex-col items-center justify-center w-full h-32 border-2 ${getAllErrors().pitchDeck ? "border-red-500" : "border-gray-300"} border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500`}
                                    >
                                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {formData.pitchDeck ? (
                                          <>
                                            <FileText className="w-8 h-8 mb-3 text-green-500" />
                                            <p className="mb-2 text-sm text-green-500 font-semibold">Fichier sélectionné</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                              {formData.pitchDeck.name} ({(formData.pitchDeck.size / 1024 / 1024).toFixed(2)}{" "}
                                              MB)
                                            </p>
                                          </>
                                        ) : (
                                          <>
                                            <Upload className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" />
                                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                              <span className="font-semibold">Cliquez pour télécharger</span> ou
                                              glissez-déposez
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                              Images, Word, PowerPoint, PDF (MAX. 128MB)
                                            </p>
                                          </>
                                        )}
                                      </div>
                                      <input
                                        id="pitchDeck"
                                        name="pitchDeck"
                                        type="file"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept=".png,.jpg,.jpeg,.gif,.bmp,.webp,.doc,.docx,.ppt,.pptx,.pdf"
                                        required
                                      />
                                    </label>
                                  </div>
                                  {getAllErrors().pitchDeck && (
                                    <Alert variant="destructive" className="mt-2 py-2">
                                      <AlertCircle className="h-4 w-4" />
                                      <AlertDescription>{getAllErrors().pitchDeck}</AlertDescription>
                                    </Alert>
                                  )}
                                  {formData.pitchDeck && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setFormData((prev) => ({ ...prev, pitchDeck: null }))}
                                      className="w-full md:w-auto"
                                    >
                                      Changer de document
                                    </Button>
                                  )}
                                </div>
                              </div>

                              <div className="flex justify-between">
                                <Button type="button" variant="outline" onClick={prevStep}>
                                  <ArrowLeft className="mr-2 h-4 w-4" /> Précédent
                                </Button>
                                <Button
                                  type="button"
                                  onClick={nextStep}
                                  className="bg-orange-500 hover:bg-orange-600 transition-colors"
                                >
                                  Suivant <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Step 3: Produit/Service */}
                          {step === 3 && (
                            <div className="space-y-6">
                              <div className="space-y-2">
                                <Label htmlFor="productName">
                                  Nom du produit/service <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id="productName"
                                  name="productName"
                                  value={formData.productName}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  required
                                  className={getAllErrors().productName ? "border-red-500" : ""}
                                />
                                {getAllErrors().productName && (
                                  <Alert variant="destructive" className="mt-2 py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{getAllErrors().productName}</AlertDescription>
                                  </Alert>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="productDescription">
                                  Description du produit/service <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                  id="productDescription"
                                  name="productDescription"
                                  value={formData.productDescription}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  rows={4}
                                  required
                                  className={getAllErrors().productDescription ? "border-red-500" : ""}
                                />
                                {getAllErrors().productDescription && (
                                  <Alert variant="destructive" className="mt-2 py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{getAllErrors().productDescription}</AlertDescription>
                                  </Alert>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="activityDescription">
                                  Description de l'activité <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                  id="activityDescription"
                                  name="activityDescription"
                                  value={formData.activityDescription}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  rows={4}
                                  required
                                  className={getAllErrors().activityDescription ? "border-red-500" : ""}
                                />
                                {getAllErrors().activityDescription && (
                                  <Alert variant="destructive" className="mt-2 py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{getAllErrors().activityDescription}</AlertDescription>
                                  </Alert>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label>
                                  Avez-vous un produit ou un service fonctionnel ? <span className="text-red-500">*</span>
                                </Label>
                                <RadioGroup
                                  value={formData.hasWorkingProduct}
                                  onValueChange={(value) => handleRadioChange("hasWorkingProduct", value)}
                                  className="flex flex-row space-x-6"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Oui" id="product-yes" />
                                    <Label htmlFor="product-yes">Oui</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Non" id="product-no" />
                                    <Label htmlFor="product-no">Non</Label>
                                  </div>
                                </RadioGroup>
                                {getAllErrors().hasWorkingProduct && (
                                  <Alert variant="destructive" className="mt-2 py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{getAllErrors().hasWorkingProduct}</AlertDescription>
                                  </Alert>
                                )}
                              </div>

                              {/* Règlement de participation */}
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="acceptTerms"
                                  checked={formData.acceptTerms}
                                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, acceptTerms: checked }))}
                                  required
                                />
                                <Label htmlFor="acceptTerms" className="text-sm">
                                  J'ai lu et accepté le{" "}
                                  <OrangeFabRegulationDialog
                                    isOpen={isRegulationOpen}
                                    onOpenChange={setIsRegulationOpen}
                                    onAccept={() => {
                                      setHasReadRegulation(true)
                                      setIsRegulationOpen(false)
                                    }}
                                  />
                                  . <span className="text-red-500">*</span>
                                </Label>
                              </div>
                              {getAllErrors().acceptTerms && (
                                <Alert variant="destructive" className="mt-2 py-2">
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertDescription>{getAllErrors().acceptTerms}</AlertDescription>
                                </Alert>
                              )}

                              <div className="flex justify-between">
                                <Button type="button" variant="outline" onClick={prevStep}>
                                  <ArrowLeft className="mr-2 h-4 w-4" /> Précédent
                                </Button>
                                <Button
                                  type="submit"
                                  disabled={isSubmitting || !hasReadRegulation}
                                  className="bg-orange-500 hover:bg-orange-600 transition-colors"
                                >
                                  {isSubmitting ? (
                                    <>
                                      <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                      >
                                        <circle
                                          className="opacity-25"
                                          cx="12"
                                          cy="12"
                                          r="10"
                                          stroke="currentColor"
                                          strokeWidth="4"
                                        ></circle>
                                        <path
                                          className="opacity-75"
                                          fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                      </svg>
                                      Envoi en cours...
                                    </>
                                  ) : (
                                    <>
                                      Soumettre ma candidature <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                </section>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="info">
            <OrangeFabInfoTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
