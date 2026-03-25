"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle, ArrowLeft, ArrowRight, Check, Loader2, Upload } from "lucide-react"
import { useAuth } from "@/app/contexts/AuthContext"

// Icons
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
)

const LinkedInIcon = () => (
  <svg className="h-5 w-5 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
)

export default function RegisterPage() {
  const router = useRouter()
  const fileInputRef = useRef(null)
  const { register, loginWithGoogle, loginWithLinkedIn, isLoading: authLoading, error: authError } = useAuth()

  // General states
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Step 1: Basic Information
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [profileType, setProfileType] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)

  // Step 2: Profile-specific Information
  // Student
  const [institution, setInstitution] = useState("")
  const [educationLevel, setEducationLevel] = useState("")
  const [sector, setSector] = useState("")
  const [motivations, setMotivations] = useState("")
  const [interests, setInterests] = useState("")
  const [cvFile, setCvFile] = useState(null)
  const [coverLetterFile, setCoverLetterFile] = useState(null)

  // Startup
  const [companyName, setCompanyName] = useState("")
  const [logo, setLogo] = useState(null)
  const [companySector, setCompanySector] = useState("")
  const [location, setLocation] = useState("")
  const [valueProposition, setValueProposition] = useState("")
  const [maturityStage, setMaturityStage] = useState("")
  const [foundingTeam, setFoundingTeam] = useState("")
  const [pitchDeckFile, setPitchDeckFile] = useState(null)
  const [businessPlanFile, setBusinessPlanFile] = useState(null)
  const [needs, setNeeds] = useState("")

  // Corporate / Investor
  const [organizationName, setOrganizationName] = useState("")
  const [activities, setActivities] = useState("")
  const [interestSectors, setInterestSectors] = useState("")
  const [cooperationObjectives, setCooperationObjectives] = useState("")
  const [brochureFile, setBrochureFile] = useState(null)

  // Validation errors
  const [emailError, setEmailError] = useState(null)
  const [passwordError, setPasswordError] = useState(null)
  const [confirmPasswordError, setConfirmPasswordError] = useState(null)
  const [profileTypeError, setProfileTypeError] = useState(null)
  const [termsError, setTermsError] = useState(null)
  const [formErrors, setFormErrors] = useState({})

  // Reset errors when fields change
  useEffect(() => {
    if (email) setEmailError(null)
    if (password) setPasswordError(null)
    if (confirmPassword) setConfirmPasswordError(null)
    if (profileType) setProfileTypeError(null)
    if (acceptTerms) setTermsError(null)
    setError(null)
  }, [email, password, confirmPassword, profileType, acceptTerms])

  // Afficher l'erreur d'authentification si elle existe
  useEffect(() => {
    if (authError) {
      setError(authError)
    }
  }, [authError])

  // Validate Step 1
  const validateStep1 = () => {
    let isValid = true

    // Email validation
    if (!email) {
      setEmailError("L'email est requis")
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Format d'email invalide")
      isValid = false
    }

    // Password validation
    if (!password) {
      setPasswordError("Le mot de passe est requis")
      isValid = false
    } else if (password.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères")
      isValid = false
    }

    // Confirm password validation
    if (!confirmPassword) {
      setConfirmPasswordError("Veuillez confirmer votre mot de passe")
      isValid = false
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Les mots de passe ne correspondent pas")
      isValid = false
    }

    // Profile type validation
    if (!profileType) {
      setProfileTypeError("Veuillez sélectionner un type de profil")
      isValid = false
    }

    // Terms validation
    if (!acceptTerms) {
      setTermsError("Vous devez accepter les conditions générales et la politique de confidentialité")
      isValid = false
    }

    return isValid
  }

  // Validate Step 2
  const validateStep2 = () => {
    let isValid = true
    const errors = {}

    if (profileType === "student") {
      if (!institution) {
        errors.institution = "L'établissement est requis"
        isValid = false
      }
      if (!educationLevel) {
        errors.educationLevel = "Le niveau d'études est requis"
        isValid = false
      }
      if (!sector) {
        errors.sector = "Le secteur est requis"
        isValid = false
      }
    } else if (profileType === "startup") {
      if (!companyName) {
        errors.companyName = "Le nom de l'entreprise est requis"
        isValid = false
      }
      if (!companySector) {
        errors.companySector = "Le secteur est requis"
        isValid = false
      }
      if (!location) {
        errors.location = "La localisation est requise"
        isValid = false
      }
      if (!valueProposition) {
        errors.valueProposition = "La proposition de valeur est requise"
        isValid = false
      }
      if (!maturityStage) {
        errors.maturityStage = "Le stade de maturité est requis"
        isValid = false
      }
    } else if (profileType === "corporate" || profileType === "investor") {
      if (!organizationName) {
        errors.organizationName = "Le nom de l'organisation est requis"
        isValid = false
      }
      if (!activities) {
        errors.activities = "Les activités sont requises"
        isValid = false
      }
      if (!interestSectors) {
        errors.interestSectors = "Les secteurs d'intérêt sont requis"
        isValid = false
      }
    }

    setFormErrors(errors)
    return isValid
  }

  // Handle step navigation
  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
      window.scrollTo(0, 0)
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3)
      window.scrollTo(0, 0)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  // Handle file changes
  const handleFileChange = (e, setFile) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

    const handleSubmit = async (e) => {
    e.preventDefault()
  
    if (!validateStep2()) return
  
    setIsLoading(true)
    setError(null)
  
    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("password", password)
      formData.append("profileType", profileType)
  
      // Add profile-specific fields
      if (profileType === "student") {
        formData.append("institution", institution)
        formData.append("educationLevel", educationLevel)
        formData.append("sector", sector)
        formData.append("motivations", motivations)
        formData.append("interests", interests)
        if (cvFile) formData.append("cv_file", cvFile)
        if (coverLetterFile) formData.append("cover_letter_file", coverLetterFile)
      } else if (profileType === "startup") {
        formData.append("companyName", companyName)
        formData.append("companySector", companySector)
        formData.append("location", location)
        formData.append("valueProposition", valueProposition)
        formData.append("maturityStage", maturityStage)
        formData.append("foundingTeam", foundingTeam)
        formData.append("needs", needs)
        if (logo) formData.append("logo_file", logo)
        if (pitchDeckFile) formData.append("pitch_deck_file", pitchDeckFile)
        if (businessPlanFile) formData.append("business_plan_file", businessPlanFile)
      } else if (profileType === "corporate" || profileType === "investor") {
        formData.append("organizationName", organizationName)
        formData.append("activities", activities)
        formData.append("interestSectors", interestSectors)
        formData.append("cooperationObjectives", cooperationObjectives)
        if (brochureFile) formData.append("brochure_file", brochureFile)
      }
  
      // 👉 Envoi de la requête POST vers ton backend déployé
      const response = await fetch("https://odcdeploye-2.onrender.com/api/auth/register", {
        method: "POST",
        body: formData,
      })
  
      const data = await response.json()
  
      if (!response.ok) {
        throw new Error(data?.message || "Erreur lors de l'inscription")
      }
  
      setSuccess(true)
  
      // Rediriger après 2s
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (err) {
      setError(err?.message || "Une erreur est survenue lors de l'inscription")
    } finally {
      setIsLoading(false)
    }
  }

  // OAuth registration
  const handleOAuthRegister = async (provider) => {
    try {
      if (provider === "google") {
        await loginWithGoogle()
      } else if (provider === "linkedin") {
        await loginWithLinkedIn()
      }
    } catch (err) {
      setError(err?.message || `Erreur d'inscription avec ${provider}`)
    }
  }

  // Render profile-specific form (Step 2)
  const renderProfileForm = () => {
    switch (profileType) {
      case "student":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Profil Étudiant / Jeune</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="institution" className="block text-sm font-medium text-gray-700">
                  Établissement <span className="text-red-500">*</span>
                </label>
                <input
                  id="institution"
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    formErrors.institution
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-[#ff7900] focus:border-[#ff7900]"
                  }`}
                />
                {formErrors.institution && <p className="text-red-500 text-sm">{formErrors.institution}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="educationLevel" className="block text-sm font-medium text-gray-700">
                  Niveau d'études <span className="text-red-500">*</span>
                </label>
                <select
                  id="educationLevel"
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    formErrors.educationLevel
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-[#ff7900] focus:border-[#ff7900]"
                  }`}
                >
                  <option value="">Sélectionnez votre niveau</option>
                  <option value="bac">Bac</option>
                  <option value="bac+1">Bac+1</option>
                  <option value="bac+2">Bac+2</option>
                  <option value="bac+3">Bac+3</option>
                  <option value="bac+4">Bac+4</option>
                  <option value="bac+5">Bac+5</option>
                  <option value="doctorat">Doctorat</option>
                </select>
                {formErrors.educationLevel && <p className="text-red-500 text-sm">{formErrors.educationLevel}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="sector" className="block text-sm font-medium text-gray-700">
                Secteur d'études <span className="text-red-500">*</span>
              </label>
              <input
                id="sector"
                type="text"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  formErrors.sector
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[#ff7900] focus:border-[#ff7900]"
                }`}
              />
              {formErrors.sector && <p className="text-red-500 text-sm">{formErrors.sector}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="motivations" className="block text-sm font-medium text-gray-700">
                Motivations
              </label>
              <textarea
                id="motivations"
                value={motivations}
                onChange={(e) => setMotivations(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7900] focus:border-[#ff7900]"
                placeholder="Décrivez vos motivations pour rejoindre la plateforme..."
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
                Centres d'intérêt
              </label>
              <textarea
                id="interests"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7900] focus:border-[#ff7900]"
                placeholder="Listez vos centres d'intérêt professionnels..."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">CV</label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 flex items-center space-x-2"
                >
                  <Upload className="w-5 h-5" />
                  <span>Choisir un fichier</span>
                </button>
                {cvFile && (
                  <span className="text-sm text-gray-600 flex items-center">
                    <Check className="text-green-500 mr-1 w-4 h-4" /> {cvFile.name}
                  </span>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileChange(e, setCvFile)}
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                />
              </div>
              <p className="text-xs text-gray-500">Formats acceptés: PDF, DOC, DOCX. Max 5MB.</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Lettre de motivation</label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 flex items-center space-x-2"
                >
                  <Upload className="w-5 h-5" />
                  <span>Choisir un fichier</span>
                </button>
                {coverLetterFile && (
                  <span className="text-sm text-gray-600 flex items-center">
                    <Check className="text-green-500 mr-1 w-4 h-4" /> {coverLetterFile.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">Formats acceptés: PDF, DOC, DOCX. Max 5MB.</p>
            </div>
          </div>
        )

      case "startup":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Profil Startup / Porteur de projet</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  Nom de l'entreprise <span className="text-red-500">*</span>
                </label>
                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    formErrors.companyName
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-[#ff7900] focus:border-[#ff7900]"
                  }`}
                />
                {formErrors.companyName && <p className="text-red-500 text-sm">{formErrors.companyName}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="companySector" className="block text-sm font-medium text-gray-700">
                  Secteur d'activité <span className="text-red-500">*</span>
                </label>
                <input
                  id="companySector"
                  type="text"
                  value={companySector}
                  onChange={(e) => setCompanySector(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    formErrors.companySector
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-[#ff7900] focus:border-[#ff7900]"
                  }`}
                />
                {formErrors.companySector && <p className="text-red-500 text-sm">{formErrors.companySector}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Localisation <span className="text-red-500">*</span>
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  formErrors.location
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[#ff7900] focus:border-[#ff7900]"
                }`}
                placeholder="Ville, Pays"
              />
              {formErrors.location && <p className="text-red-500 text-sm">{formErrors.location}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="valueProposition" className="block text-sm font-medium text-gray-700">
                Proposition de valeur <span className="text-red-500">*</span>
              </label>
              <textarea
                id="valueProposition"
                value={valueProposition}
                onChange={(e) => setValueProposition(e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  formErrors.valueProposition
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[#ff7900] focus:border-[#ff7900]"
                }`}
                placeholder="Décrivez brièvement la proposition de valeur de votre startup..."
              />
              {formErrors.valueProposition && <p className="text-red-500 text-sm">{formErrors.valueProposition}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="maturityStage" className="block text-sm font-medium text-gray-700">
                  Stade de maturité <span className="text-red-500">*</span>
                </label>
                <select
                  id="maturityStage"
                  value={maturityStage}
                  onChange={(e) => setMaturityStage(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    formErrors.maturityStage
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-[#ff7900] focus:border-[#ff7900]"
                  }`}
                >
                  <option value="">Sélectionnez le stade</option>
                  <option value="idée">Idée</option>
                  <option value="prototype">Prototype</option>
                  <option value="mvp">MVP</option>
                  <option value="commercialisation">Commercialisation</option>
                  <option value="croissance">Croissance</option>
                  <option value="scale-up">Scale-up</option>
                </select>
                {formErrors.maturityStage && <p className="text-red-500 text-sm">{formErrors.maturityStage}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="foundingTeam" className="block text-sm font-medium text-gray-700">
                  Équipe fondatrice
                </label>
                <input
                  id="foundingTeam"
                  type="text"
                  value={foundingTeam}
                  onChange={(e) => setFoundingTeam(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7900] focus:border-[#ff7900]"
                  placeholder="Nombre de fondateurs et rôles"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="needs" className="block text-sm font-medium text-gray-700">
                Besoins exprimés
              </label>
              <textarea
                id="needs"
                value={needs}
                onChange={(e) => setNeeds(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7900] focus:border-[#ff7900]"
                placeholder="RH, financement, partenaires, etc."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Logo</label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 flex items-center space-x-2"
                >
                  <Upload className="w-5 h-5" />
                  <span>Choisir un fichier</span>
                </button>
                {logo && (
                  <span className="text-sm text-gray-600 flex items-center">
                    <Check className="text-green-500 mr-1 w-4 h-4" /> {logo.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">Formats acceptés: PNG, JPG, SVG. Max 2MB.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Pitch Deck</label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 flex items-center space-x-2"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Choisir un fichier</span>
                  </button>
                  {pitchDeckFile && (
                    <span className="text-sm text-gray-600 flex items-center">
                      <Check className="text-green-500 mr-1 w-4 h-4" /> {pitchDeckFile.name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">Formats acceptés: PDF, PPT, PPTX. Max 10MB.</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Business Plan</label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 flex items-center space-x-2"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Choisir un fichier</span>
                  </button>
                  {businessPlanFile && (
                    <span className="text-sm text-gray-600 flex items-center">
                      <Check className="text-green-500 mr-1 w-4 h-4" /> {businessPlanFile.name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">Formats acceptés: PDF, DOC, DOCX. Max 10MB.</p>
              </div>
            </div>
          </div>
        )

      case "corporate":
      case "investor":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Profil {profileType === "corporate" ? "Corporate" : "Administration"}
            </h3>

            <div className="space-y-2">
              <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700">
                Nom de l'organisation <span className="text-red-500">*</span>
              </label>
              <input
                id="organizationName"
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  formErrors.organizationName
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[#ff7900] focus:border-[#ff7900]"
                }`}
              />
              {formErrors.organizationName && <p className="text-red-500 text-sm">{formErrors.organizationName}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="activities" className="block text-sm font-medium text-gray-700">
                Activités <span className="text-red-500">*</span>
              </label>
              <textarea
                id="activities"
                value={activities}
                onChange={(e) => setActivities(e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  formErrors.activities
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[#ff7900] focus:border-[#ff7900]"
                }`}
                placeholder="Décrivez les principales activités de votre organisation..."
              />
              {formErrors.activities && <p className="text-red-500 text-sm">{formErrors.activities}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="interestSectors" className="block text-sm font-medium text-gray-700">
                Secteurs d'intérêt <span className="text-red-500">*</span>
              </label>
              <textarea
                id="interestSectors"
                value={interestSectors}
                onChange={(e) => setInterestSectors(e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  formErrors.interestSectors
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[#ff7900] focus:border-[#ff7900]"
                }`}
                placeholder="Listez les secteurs qui vous intéressent..."
              />
              {formErrors.interestSectors && <p className="text-red-500 text-sm">{formErrors.interestSectors}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="cooperationObjectives" className="block text-sm font-medium text-gray-700">
                Objectifs de coopération
              </label>
              <textarea
                id="cooperationObjectives"
                value={cooperationObjectives}
                onChange={(e) => setCooperationObjectives(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7900] focus:border-[#ff7900]"
                placeholder="Décrivez vos objectifs de coopération avec l'écosystème..."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Plaquette / Documentation</label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 flex items-center space-x-2"
                >
                  <Upload className="w-5 h-5" />
                  <span>Choisir un fichier</span>
                </button>
                {brochureFile && (
                  <span className="text-sm text-gray-600 flex items-center">
                    <Check className="text-green-500 mr-1 w-4 h-4" /> {brochureFile.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">Formats acceptés: PDF, DOC, DOCX, PPT, PPTX. Max 10MB.</p>
            </div>
          </div>
        )

      default:
        return (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
            Veuillez d'abord sélectionner un type de profil à l'étape 1.
          </div>
        )
    }
  }

  // Render summary (Step 3)
  const renderSummary = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800">Récapitulatif de votre inscription</h3>

        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h4 className="font-medium text-gray-700 mb-2">Informations de base</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Type de profil</p>
              <p className="font-medium">
                {profileType === "student" && "Étudiant / Jeune"}
                {profileType === "startup" && "Porteur de projet / Startup"}
                {profileType === "corporate" && "Corporate"}
                {profileType === "investor" && "Investisseur"}
                {profileType === "other" && "Autre acteur de l'écosystème"}
              </p>
            </div>
          </div>
        </div>

        {profileType === "student" && (
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h4 className="font-medium text-gray-700 mb-2">Profil Étudiant / Jeune</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Établissement</p>
                <p className="font-medium">{institution}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Niveau d'études</p>
                <p className="font-medium">{educationLevel}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Secteur</p>
                <p className="font-medium">{sector}</p>
              </div>
              {motivations && (
                <div className="col-span-1 md:col-span-2">
                  <p className="text-sm text-gray-500">Motivations</p>
                  <p className="font-medium">{motivations}</p>
                </div>
              )}
              {cvFile && (
                <div>
                  <p className="text-sm text-gray-500">CV</p>
                  <p className="font-medium text-[#ff7900]">{cvFile.name}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {profileType === "startup" && (
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h4 className="font-medium text-gray-700 mb-2">Profil Startup</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nom de l'entreprise</p>
                <p className="font-medium">{companyName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Secteur</p>
                <p className="font-medium">{companySector}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Localisation</p>
                <p className="font-medium">{location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Stade de maturité</p>
                <p className="font-medium">{maturityStage}</p>
              </div>
              <div className="col-span-1 md:col-span-2">
                <p className="text-sm text-gray-500">Proposition de valeur</p>
                <p className="font-medium">{valueProposition}</p>
              </div>
            </div>
          </div>
        )}

        {(profileType === "corporate" || profileType === "investor") && (
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h4 className="font-medium text-gray-700 mb-2">
              Profil {profileType === "corporate" ? "Corporate" : "Investisseur"}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nom de l'organisation</p>
                <p className="font-medium">{organizationName}</p>
              </div>
              <div className="col-span-1 md:col-span-2">
                <p className="text-sm text-gray-500">Activités</p>
                <p className="font-medium">{activities}</p>
              </div>
              <div className="col-span-1 md:col-span-2">
                <p className="text-sm text-gray-500">Secteurs d'intérêt</p>
                <p className="font-medium">{interestSectors}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-md border border-blue-200 text-blue-800">
          <p className="text-sm">
            En cliquant sur "Finaliser l'inscription", vous confirmez que toutes les informations fournies sont
            correctes. Vous recevrez un email de confirmation pour valider votre compte.
          </p>
        </div>
      </div>
    )
  }

  // Main render
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      {/* Left column - Background image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        {/* Arrière-plan white smoke */}
        <div className="absolute inset-0 bg-[#F5F5F5]" />

        {/* Accent de couleur orange (coins) */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff7900] opacity-10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#ff7900] opacity-10 rounded-full translate-y-1/2 -translate-x-1/2" />

        {/* Image avec fond transparent */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <img
            src="/images/background-register.png?height=600&width=800"
            alt="Illustration"
            className="w-auto h-auto max-w-full max-h-full object-contain"
            style={{ filter: "drop-shadow(0px 10px 15px rgba(0, 0, 0, 0.1))" }}
          />
        </div>

        {/* Overlay noir semi-transparent pour faire ressortir le texte */}
        <div className="absolute inset-0 bg-black/40 z-10" />

        {/* Contenu texte avec accent orange */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center p-8">
            <h1 className="text-4xl font-bold mb-4 text-white">
              Rejoignez notre <span className="text-[#ff7900]">écosystème</span>
            </h1>
            <p className="text-xl max-w-md text-white">
              Créez votre compte pour accéder à toutes les opportunités d'accompagnement, de formation et de
              collaboration.
            </p>
          </div>
        </div>
      </div>

      {/* Right column - Registration form */}
      <div className="w-full lg:w-1/2 bg-white min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-2xl animate-fadeIn">
          {/* Mobile logo/header */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Créer un compte</h1>
            <p className="text-gray-600 mt-2">Rejoignez notre écosystème d'innovation</p>
          </div>

          {/* Form container */}
          <div className="bg-white rounded-xl p-8 shadow-xl border border-gray-200">
            {/* Progress steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                        currentStep === step
                          ? "bg-[#ff7900] text-white"
                          : currentStep > step
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {currentStep > step ? <Check className="w-4 h-4" /> : step}
                    </div>
                    <span className="text-xs mt-2 text-gray-600">
                      {step === 1 && "Compte"}
                      {step === 2 && "Profil"}
                      {step === 3 && "Validation"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="relative mt-2">
                <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full"></div>
                <div
                  className="absolute top-0 left-0 h-1 bg-[#ff7900] transition-all duration-300"
                  style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Form title */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {currentStep === 1 && "Créez votre compte"}
                {currentStep === 2 && "Complétez votre profil"}
                {currentStep === 3 && "Vérifiez vos informations"}
              </h2>
              <p className="text-gray-600 mt-1">
                {currentStep === 1 && "Renseignez vos informations de base"}
                {currentStep === 2 && "Ajoutez des informations spécifiques à votre profil"}
                {currentStep === 3 && "Vérifiez et confirmez vos informations"}
              </p>
            </div>

            {/* Error and success messages */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-3 rounded-md flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-3 rounded-md">
                <p>Inscription réussie! Redirection en cours...</p>
              </div>
            )}

            {/* Form content based on current step */}
            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="exemple@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        emailError
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-[#ff7900] focus:border-[#ff7900]"
                      }`}
                    />
                    {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Mot de passe <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                          passwordError
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-[#ff7900] focus:border-[#ff7900]"
                        }`}
                      />
                      {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirmer le mot de passe <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                          confirmPasswordError
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-[#ff7900] focus:border-[#ff7900]"
                        }`}
                      />
                      {confirmPasswordError && <p className="text-red-500 text-sm">{confirmPasswordError}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="profileType" className="block text-sm font-medium text-gray-700">
                      Type de profil <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="profileType"
                      value={profileType}
                      onChange={(e) => setProfileType(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        profileTypeError
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-[#ff7900] focus:border-[#ff7900]"
                      }`}
                    >
                      <option value="">Sélectionnez votre profil</option>
                      <option value="student">Étudiant / Jeune</option>
                      <option value="startup">Porteur de projet / Startup</option>
                      <option value="investor">Administration</option>
                      <option value="corporate">Corporate /entreprise</option>
                      <option value="other">Autre acteur de l'écosystème</option>
                    </select>
                    {profileTypeError && <p className="text-red-500 text-sm">{profileTypeError}</p>}
                  </div>

                  <div className="flex items-start space-x-2 pt-2">
                    <div className="flex items-center h-5">
                      <input
                        id="terms"
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="h-4 w-4 text-[#ff7900] border-gray-300 rounded focus:ring-[#ff7900]"
                      />
                    </div>
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      J'accepte les{" "}
                      <Link href="/terms" className="text-[#ff7900] hover:text-[#ff9a40] hover:underline">
                        conditions générales
                      </Link>{" "}
                      et la{" "}
                      <Link href="/privacy" className="text-[#ff7900] hover:text-[#ff9a40] hover:underline">
                        politique de confidentialité
                      </Link>
                    </label>
                  </div>
                  {termsError && <p className="text-red-500 text-sm">{termsError}</p>}

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Ou s'inscrire avec</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleOAuthRegister("google")}
                      disabled={isLoading || success || authLoading}
                      className="flex items-center justify-center gap-2 py-2 px-4 bg-white border border-gray-300 rounded-md text-gray-800 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <GoogleIcon />
                      Google
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOAuthRegister("linkedin")}
                      disabled={isLoading || success || authLoading}
                      className="flex items-center justify-center gap-2 py-2 px-4 bg-white border border-gray-300 rounded-md text-gray-800 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <LinkedInIcon />
                      LinkedIn
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Profile-specific Information */}
              {currentStep === 2 && renderProfileForm()}

              {/* Step 3: Summary */}
              {currentStep === 3 && renderSummary()}

              {/* Navigation buttons */}
              <div className="flex justify-between mt-8">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Précédent
                  </button>
                ) : (
                  <div></div>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-4 py-2 bg-[#ff7900] hover:bg-[#ff9a40] text-white rounded-md flex items-center gap-2"
                  >
                    Suivant
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#ff7900] hover:bg-[#ff9a40] text-white rounded-md flex items-center gap-2"
                    disabled={isLoading || authLoading}
                  >
                    {isLoading || authLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Inscription en cours...
                      </>
                    ) : (
                      <>
                        Finaliser l'inscription
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
              Vous avez déjà un compte?{" "}
              <Link href="/login" className="text-[#ff7900] hover:text-[#ff9a40] hover:underline font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


