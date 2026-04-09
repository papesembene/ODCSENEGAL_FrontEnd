"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Check,
  Upload,
  ArrowLeft,
  ArrowRight,
  Clock,
  Users,
  Lightbulb,
  AlertCircle,
  FileText,
  FileIcon as FilePresentation,
  X,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  API_BASE_URL,
  COUNTRY_CODES,
  DIPLOMAS,
  FILE_FORMATS_HELP_TEXT,
  FILE_INPUT_ACCEPT,
  LEGAL_FORMS,
  REGIONS_DATA,
  ROLES,
  SECTORS,
} from "./constants"
import {
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

export default function StartupCandidaturePage() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [emailExists, setEmailExists] = useState(false)
  const [phoneExists, setPhoneExists] = useState(false)
  const [emailCheckLoading, setEmailCheckLoading] = useState(false)
  const [phoneCheckLoading, setPhoneCheckLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [realtimeErrors, setRealtimeErrors] = useState({})
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

    setFormData((prev) => updateFormDataValue(prev, name, processedValue))

    // Reset validation errors
    if (name === "email") setEmailExists(false)
    if (name === "phone") setPhoneExists(false)

    setValidationErrors((prev) => omitError(prev, name))

    setRealtimeErrors((prev) => omitError(prev, name))

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
        const response = await fetch(
          `${API_BASE_URL}/api/startup/check-email?email=${encodeURIComponent(formData.email)}`,
        )
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

  // Vérification de téléphone avec l'API
  useEffect(() => {
    const checkPhoneExists = async () => {
      if (!formData.phone || formData.phone.length < 8) return

      setPhoneCheckLoading(true)
      try {
        const fullPhone = formData.phoneCountry + formData.phone
        const response = await fetch(`${API_BASE_URL}/api/startup/check-phone?phone=${encodeURIComponent(fullPhone)}`)
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
      const fileError = validateFile(file)

      if (fileError) {
        setValidationErrors((prev) => ({
          ...prev,
          [name]: fileError,
        }))
        return
      }

      setFormData((prev) => updateFormDataValue(prev, name, file))
      setValidationErrors((prev) => omitError(prev, name))
    }
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => updateFormDataValue(prev, name, value))
    setValidationErrors((prev) => omitError(prev, name))
    setRealtimeErrors((prev) => omitError(prev, name))
  }

  const handleRadioChange = (name, value) => {
    setFormData((prev) => updateFormDataValue(prev, name, value))
    setValidationErrors((prev) => omitError(prev, name))
  }

  // Fonction pour combiner les erreurs
  const getAllErrors = () => {
    return mergeErrors(realtimeErrors, validationErrors)
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

    if (!runStep3Validation()) {
      scrollToFirstError()
      return
    }

    setIsSubmitting(true)

    try {
      const form = new FormData()

      Object.keys(formData).forEach((key) => {
        if (key !== "cv" && key !== "pitchDeck") {
          form.append(key, formData[key])
        }
      })

      form.append("fullPhone", formData.phoneCountry + formData.phone)
      form.append("program", "startup_lab")

      if (formData.cv) form.append("cv", formData.cv)
      if (formData.pitchDeck) form.append("pitch_deck", formData.pitchDeck)

      const response = await fetch(`${API_BASE_URL}/api/startup/submit`, {
        method: "POST",
        body: form,
      })

      if (!response.ok) {
        const contentType = response.headers.get("content-type")
        let errorMessage = `Erreur HTTP ! Code : ${response.status}`

        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } else {
          const text = await response.text()
          if (text) errorMessage = text
        }

        throw new Error(errorMessage)
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
            Candidature Startup Lab
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
              <Card className="mt-6">
                <CardContent className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
                  <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                    <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Candidature envoyée avec succès !</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Merci pour votre candidature. Notre équipe l'examinera dans les plus brefs délais et vous contactera
                    pour la suite du processus.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Un email de confirmation a été envoyé à l'adresse que vous avez fournie.
                  </p>
                  <div className="mt-6">
                    <Button asChild>
                      <Link href="/startups">Retour à l'espace Startups</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Formulaire de candidature</CardTitle>
                  <CardDescription>
                    Veuillez remplir tous les champs obligatoires marqués d'un astérisque (*).
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-8">
                    <div className="flex justify-between">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`flex flex-col items-center ${
                            i < step ? "text-orange-500" : i === step ? "text-blue-500" : "text-gray-400"
                          }`}
                        >
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                              i < step
                                ? "border-orange-500 bg-orange-100 dark:bg-orange-900"
                                : i === step
                                  ? "border-blue-500 bg-blue-100 dark:bg-blue-900"
                                  : "border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
                            }`}
                          >
                            {i < step ? <Check className="h-5 w-5" /> : <span>{i}</span>}
                          </div>
                          <span className="mt-2 text-sm">
                            {i === 1
                              ? "Informations personnelles"
                              : i === 2
                                ? "Informations entreprise"
                                : "Produit/Service"}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-2 rounded-full bg-orange-500"
                        style={{ width: `${((step - 1) / 2) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit}>
                    {/* Step 1: Informations personnelles */}
                    {step === 1 && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-medium">Informations personnelles</h3>

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
                            Rôle dans la startup <span className="text-red-500">*</span>
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
                              {ROLES.map((role) => (
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
                            <Label htmlFor="emailAlternate">Email alternatif</Label>
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
                                {COUNTRY_CODES.map((country) => (
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
                                {Object.keys(REGIONS_DATA).map((region) => (
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
                                  REGIONS_DATA[formData.region]?.map((department) => (
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
                              {DIPLOMAS.map((diploma) => (
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
                            className={getAllErrors().institution ? "border-red-500" : ""}
                          />
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
                                        {FILE_FORMATS_HELP_TEXT}
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
                                  accept={FILE_INPUT_ACCEPT}
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
                                Changer de fichier
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
                        <h3 className="text-lg font-medium">Informations sur l'entreprise</h3>

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
                              {SECTORS.map((sector) => (
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
                              {LEGAL_FORMS.map((form) => (
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
                                      <FilePresentation className="w-8 h-8 mb-3 text-green-500" />
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
                                        {FILE_FORMATS_HELP_TEXT}
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
                                  accept={FILE_INPUT_ACCEPT}
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
                                Changer de fichier
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
                        <h3 className="text-lg font-medium">Informations sur le produit/service</h3>

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

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="acceptTerms"
                            checked={formData.acceptTerms}
                            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, acceptTerms: checked }))}
                            required
                          />
                          <Label htmlFor="acceptTerms" className="text-sm">
                            J'ai lu et accepté le{" "}
                            <Dialog open={isRegulationOpen} onOpenChange={setIsRegulationOpen}>
                              <DialogTrigger asChild>
                                <span
                                  className="text-orange-500 font-medium cursor-pointer hover:underline"
                                  onClick={() => setIsRegulationOpen(true)}
                                >
                                  règlement de participation
                                </span>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh]">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center justify-between">
                                    Règlement du Concours INNOV'OSS 2024
                                    <Button variant="ghost" size="sm" onClick={() => setIsRegulationOpen(false)}>
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </DialogTitle>
                                  <DialogDescription>
                                    Veuillez lire attentivement ce règlement avant d'accepter les conditions de
                                    participation.
                                  </DialogDescription>
                                </DialogHeader>
                                <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
                                  <div className="space-y-4 text-sm">
                                    <div>
                                      <h3 className="font-bold text-lg mb-2">REGLEMENT DU CONCOURS</h3>
                                      <h4 className="font-semibold mb-2">
                                        « Appel à projet INNOV'OSS Décembre 2024 - 5ème Edition »
                                      </h4>
                                      <p className="mb-4">
                                        Le présent Règlement décrit les conditions et modalités de la cinquième édition
                                        du Concours « Appel à Projet INNOV'OSS 2024 » organisé par SONATEL, ci-après
                                        désigné « le Concours ».
                                      </p>
                                      <p className="mb-4">
                                        La participation au Concours vaut, pour le Participant, acceptation sans réserve
                                        du présent Règlement.
                                      </p>
                                    </div>

                                    <div>
                                      <h4 className="font-semibold mb-2">Article 1 : Définitions</h4>
                                      <p className="mb-2">
                                        Dans le cadre de l'interprétation du présent Règlement, les expressions
                                        suivantes auront la signification :
                                      </p>
                                      <ul className="list-disc pl-6 space-y-1">
                                        <li>
                                          <strong>Agritech :</strong> désigne un domaine d'activité où on utilise les
                                          outils technologiques pour améliorer le quotidien des agriculteurs.
                                        </li>
                                        <li>
                                          <strong>Edtech :</strong> désigne une activité qui vise à faciliter
                                          l'enseignement et l'apprentissage en mettant la technologie au service de
                                          l'éducation.
                                        </li>
                                        <li>
                                          <strong>Foodtech :</strong> désigne des innovations sur les produits, la
                                          distribution, le marché ou le modèle économique.
                                        </li>
                                        <li>
                                          <strong>Intelligence Artificielle :</strong> désigne un processus d'imitation
                                          de l'intelligence humaine qui repose sur la création et l'application
                                          d'algorithmes exécutés dans un environnement informatique.
                                        </li>
                                        <li>
                                          <strong>Orange fab :</strong> désigne le programme d'accélération de startups
                                          de Sonatel afin de les accompagner dans la phase de croissance. Il est dédié
                                          aux startups matures.
                                        </li>
                                        <li>
                                          <strong>Orange Startup Studio (OSS) :</strong> est une structure du groupe
                                          SONATEL dédiée à la création et à l'accompagnement de Startup Innovantes et à
                                          fort potentiel.
                                        </li>
                                      </ul>
                                    </div>

                                    <div>
                                      <h4 className="font-semibold mb-2">Article 2 : Organisateur</h4>
                                      <p>
                                        SONATEL S.A, Société Anonyme avec Conseil d'Administration au capital social de
                                        cinquante milliards (50 000 000 000) de Francs CFA ayant son siège social au 64,
                                        Voie de Dégagement Nord (VDN), Dakar, immatriculée au Registre du Commerce et du
                                        Crédit Mobilier de Dakar sous le numéro SN.DKR.74 B 61, (ci-après « SONATEL » ou
                                        « l'Organisateur »), organise, du 29 novembre au 19 décembre 2024, un concours
                                        intitulé « L'appel à projet INNOV'OSS », (ci-après le « Concours »).
                                      </p>
                                    </div>

                                    <div>
                                      <h4 className="font-semibold mb-2">Article 4 : Description du Concours</h4>
                                      <p className="mb-2">
                                        Orange Startup Studio (OSS) apporte un support financier, un accompagnement
                                        technique, de la visibilité et du networking pour toutes les startups admises à
                                        l'un de ses programmes ci-dessous :
                                      </p>
                                      <ul className="list-disc pl-6 mb-2">
                                        <li>Startup Lab</li>
                                        <li>Orange fab</li>
                                      </ul>
                                      <p className="mb-2">
                                        L'appel à projet INNOV'OSS 2024 est un concours d'excellence dont le but est de
                                        sélectionner des projets innovants orientés sur plusieurs thématiques ci-dessous
                                        :
                                      </p>
                                      <ul className="list-disc pl-6">
                                        <li>Immobilier/Foncier</li>
                                        <li>Transport</li>
                                        <li>Foodtech</li>
                                        <li>Edtech</li>
                                        <li>Insurtech</li>
                                        <li>Agritech</li>
                                        <li>Intelligence Artificielle</li>
                                      </ul>
                                    </div>

                                    <div>
                                      <h4 className="font-semibold mb-2">Article 5 : Déroulement du Concours</h4>
                                      <p className="mb-2">Le concours se déroule en trois phases :</p>

                                      <div className="mb-3">
                                        <h5 className="font-medium">1ère phase : Inscription</h5>
                                        <p>
                                          Les inscriptions au Concours sont ouvertes du 29 novembre 2024 à 00 heure au
                                          13 décembre 2024 à 23 heures 59 minutes.
                                        </p>
                                        <p>
                                          La participation au Concours est unique. Au risque de voir sa candidature
                                          écartée, un même candidat ne peut soumettre plusieurs candidatures au
                                          Concours.
                                        </p>
                                        <p>L'inscription au Concours est gratuite.</p>
                                      </div>

                                      <div className="mb-3">
                                        <h5 className="font-medium">2ème phase : Sélection du Jury</h5>
                                        <p>Le Jury fera une présélection des candidatures le 16 décembre 2024.</p>
                                        <p>La sélection définitive des candidatures aura lieu le 19 décembre 2024.</p>
                                      </div>

                                      <div>
                                        <h5 className="font-medium">
                                          3ème phase : Jury, Choix des finalistes, et délibération
                                        </h5>
                                        <p>
                                          Le jury chargé d'effectuer le classement des Projets sera constitué par des
                                          membres du personnel de SONATEL.
                                        </p>
                                        <p>Les critères retenus pour la sélection incluent :</p>
                                        <ul className="list-disc pl-6 mt-1">
                                          <li>Qualité du Dossier</li>
                                          <li>Caractère Innovant et Valeur ajoutée du projet</li>
                                          <li>Impact Economique</li>
                                          <li>Compétences Techniques du ou des entrepreneurs</li>
                                          <li>Performance Environnementale du projet</li>
                                        </ul>
                                      </div>
                                    </div>

                                    <div>
                                      <h4 className="font-semibold mb-2">Article 6 : Avantages</h4>
                                      <p>
                                        Il est accordé aux Gagnants un accompagnement par OSS pour un développement de
                                        leur activité. Selon le niveau de maturité du projet, il sera autorisé à
                                        intégrer l'un des programmes Startup Lab ou Orange Fab.
                                      </p>
                                    </div>

                                    <div>
                                      <h4 className="font-semibold mb-2">
                                        Article 7 : Traitement des données personnelles
                                      </h4>
                                      <p>
                                        En participant au Concours, les candidats autorisent SONATEL à utiliser leur
                                        nom, prénoms et/ou image, la dénomination de leurs Projets, et leur description
                                        pour la promotion de la marque ORANGE.
                                      </p>
                                      <p className="mt-2">
                                        Les données personnelles recueillies dans le cadre du Concours sont traitées
                                        conformément à la loi n°2008-12 du 25 janvier 2008 sur la protection des données
                                        à caractère personnel.
                                      </p>
                                    </div>

                                    <div>
                                      <h4 className="font-semibold mb-2">Article 9 : Propriété Intellectuelle</h4>
                                      <p>
                                        Les Candidats sont titulaires des Connaissances, techniques et procédés
                                        antérieurs utilisés dans le cadre des développements ou projets présentés au
                                        Concours. Il appartient aux Candidats de protéger leurs Projets en déposant leur
                                        marque, dessin ou modèle industriel, nom de domaine et éventuellement un brevet.
                                      </p>
                                      <p className="mt-2">
                                        Les Résultats produits dans le cadre des programmes définis et permis par la
                                        collaboration des coachs de Sonatel sont détenus à parts égales par Sonatel et
                                        l'équipe gagnante.
                                      </p>
                                    </div>

                                    <div>
                                      <h4 className="font-semibold mb-2">
                                        Article 10 : Droit applicable - Règlement des litiges
                                      </h4>
                                      <p>
                                        Le présent Règlement est soumis au droit sénégalais en toutes ses dispositions.
                                        Tout litige relatif au Concours fera l'objet de la recherche d'une solution à
                                        l'amiable, et à défaut d'entente, le litige sera soumis aux Tribunaux compétents
                                        de Dakar.
                                      </p>
                                    </div>
                                  </div>
                                </ScrollArea>
                                <div className="flex justify-end items-center pt-4">
                                  <Button
                                    onClick={() => {
                                      setHasReadRegulation(true)
                                      setIsRegulationOpen(false)
                                    }}
                                    className="bg-orange-500 hover:bg-orange-600"
                                  >
                                    J'ai lu et compris
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
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
                            disabled={isSubmitting}
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
            )}
          </TabsContent>

          <TabsContent value="info">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Programme Startup Lab</CardTitle>
                <CardDescription>
                  Notre programme d'accompagnement pour les startups en phase d'idéation et de prototypage.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="rounded-lg border p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
                      <Lightbulb className="h-8 w-8 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Startup Lab</h3>
                      <p className="text-sm text-muted-foreground">Phase d'idéation et prototypage</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        Programme de 6 mois destiné aux entrepreneurs en phase d'idéation et de prototypage. Nous vous
                        aidons à transformer votre idée en un projet viable.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Critères d'éligibilité</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                        <li>Avoir une idée innovante ou un projet en phase de démarrage</li>
                        <li>Être disponible pour s'engager pleinement dans le programme</li>
                        <li>Avoir une équipe d'au moins 2 personnes</li>
                        <li>Être basé au Sénégal</li>
                        <li>Avoir un prototype ou MVP en développement</li>
                      </ul>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">6 mois</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">10 startups</span>
                        </div>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/startups/programmes/startup-lab">
                          En savoir plus <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
