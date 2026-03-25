"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Send, CheckCircle, ChevronDown, Search, AlertCircle} from "lucide-react"
import Link from "next/link"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

// Liste des pays avec codes téléphoniques
const countryCodes = [
  // Afrique
  { country: "Sénégal", abbr: "SN", code: "+221", format: "XX XXX XX XX", digits: 9, pattern: /^[7-9]\d{8}$/ },
  { country: "Maroc", abbr: "MA", code: "+212", format: "XX XXX XXXX", digits: 9, pattern: /^[5-9]\d{8}$/ },
  { country: "Côte d'Ivoire", abbr: "CI", code: "+225", format: "XX XXX XXXX", digits: 10, pattern: /^[0-9]\d{9}$/ },
  { country: "Cameroun", abbr: "CM", code: "+237", format: "X XX XX XX XX", digits: 9, pattern: /^[2-9]\d{8}$/ },
  { country: "Mali", abbr: "ML", code: "+223", format: "XX XX XX XX", digits: 8, pattern: /^[6-9]\d{7}$/ },
  { country: "Guinée", abbr: "GN", code: "+224", format: "XXX XXX XXX", digits: 9, pattern: /^[6-9]\d{8}$/ },
  { country: "Burkina Faso", abbr: "BF", code: "+226", format: "XX XX XX XX", digits: 8, pattern: /^[5-9]\d{7}$/ },
  { country: "Bénin", abbr: "BJ", code: "+229", format: "XX XXX XXX", digits: 8, pattern: /^[5-9]\d{7}$/ },
  { country: "Togo", abbr: "TG", code: "+228", format: "XX XXX XXX", digits: 8, pattern: /^[9]\d{7}$/ },
  { country: "Niger", abbr: "NE", code: "+227", format: "XX XX XX XX", digits: 8, pattern: /^[8-9]\d{7}$/ },
  { country: "Gabon", abbr: "GA", code: "+241", format: "X XX XX XX", digits: 8, pattern: /^[0-9]\d{7}$/ },
  { country: "Congo", abbr: "CG", code: "+242", format: "XX XXX XXXX", digits: 9, pattern: /^[0-9]\d{8}$/ },
  { country: "Algérie", abbr: "DZ", code: "+213", format: "XXX XX XX XX", digits: 9, pattern: /^[5-7]\d{8}$/ },
  { country: "Tunisie", abbr: "TN", code: "+216", format: "XX XXX XXX", digits: 8, pattern: /^[2-9]\d{7}$/ },
  { country: "Égypte", abbr: "EG", code: "+20", format: "XXX XXX XXXX", digits: 10, pattern: /^[1]\d{9}$/ },
  { country: "Afrique du Sud", abbr: "ZA", code: "+27", format: "XX XXX XXXX", digits: 9, pattern: /^[6-8]\d{8}$/ },
  { country: "Ghana", abbr: "GH", code: "+233", format: "XX XXX XXXX", digits: 9, pattern: /^[2-5]\d{8}$/ },
  { country: "Kenya", abbr: "KE", code: "+254", format: "XXX XXX XXX", digits: 9, pattern: /^[7]\d{8}$/ },
  { country: "Nigeria", abbr: "NG", code: "+234", format: "XXX XXX XXXX", digits: 10, pattern: /^[7-9]\d{9}$/ },

  // Europe
  { country: "France", abbr: "FR", code: "+33", format: "X XX XX XX XX", digits: 9, pattern: /^[1-9]\d{8}$/ },
  { country: "Royaume-Uni", abbr: "GB", code: "+44", format: "XXXX XXXXXX", digits: 10, pattern: /^[1-9]\d{9}$/ },
  { country: "Belgique", abbr: "BE", code: "+32", format: "XXX XX XX XX", digits: 9, pattern: /^[4-9]\d{8}$/ },
  { country: "Suisse", abbr: "CH", code: "+41", format: "XX XXX XX XX", digits: 9, pattern: /^[1-9]\d{8}$/ },
  { country: "Allemagne", abbr: "DE", code: "+49", format: "XXXX XXXXXX", digits: 10, pattern: /^[1-9]\d{9}$/ },
  { country: "Espagne", abbr: "ES", code: "+34", format: "XXX XXX XXX", digits: 9, pattern: /^[6-9]\d{8}$/ },
  { country: "Italie", abbr: "IT", code: "+39", format: "XXX XXX XXXX", digits: 10, pattern: /^[3]\d{9}$/ },
  { country: "Portugal", abbr: "PT", code: "+351", format: "XXX XXX XXX", digits: 9, pattern: /^[9]\d{8}$/ },
  { country: "Pays-Bas", abbr: "NL", code: "+31", format: "X XX XX XX XX", digits: 9, pattern: /^[6]\d{8}$/ },
  { country: "Suède", abbr: "SE", code: "+46", format: "XX XXX XX XX", digits: 9, pattern: /^[7]\d{8}$/ },

  // Amériques
  { country: "États-Unis", abbr: "US", code: "+1", format: "XXX XXX XXXX", digits: 10, pattern: /^[2-9]\d{9}$/ },
  { country: "Canada", abbr: "CA", code: "+1", format: "XXX XXX XXXX", digits: 10, pattern: /^[2-9]\d{9}$/ },
  { country: "Mexique", abbr: "MX", code: "+52", format: "XXX XXX XXXX", digits: 10, pattern: /^[1-9]\d{9}$/ },
  { country: "Brésil", abbr: "BR", code: "+55", format: "XX XXXX XXXX", digits: 10, pattern: /^[1-9]\d{9}$/ },
  { country: "Argentine", abbr: "AR", code: "+54", format: "XX XXXX XXXX", digits: 10, pattern: /^[1-9]\d{9}$/ },
  { country: "Colombie", abbr: "CO", code: "+57", format: "XXX XXX XXXX", digits: 10, pattern: /^[3]\d{9}$/ },

  // Asie
  { country: "Chine", abbr: "CN", code: "+86", format: "XXX XXXX XXXX", digits: 11, pattern: /^[1]\d{10}$/ },
  { country: "Japon", abbr: "JP", code: "+81", format: "XX XXXX XXXX", digits: 10, pattern: /^[7-9]\d{9}$/ },
  { country: "Corée du Sud", abbr: "KR", code: "+82", format: "XX XXXX XXXX", digits: 10, pattern: /^[1]\d{9}$/ },
  { country: "Inde", abbr: "IN", code: "+91", format: "XXXX XXX XXX", digits: 10, pattern: /^[6-9]\d{9}$/ },
  { country: "Indonésie", abbr: "ID", code: "+62", format: "XXX XXX XXXX", digits: 10, pattern: /^[8]\d{9}$/ },
  { country: "Malaisie", abbr: "MY", code: "+60", format: "XX XXXX XXXX", digits: 10, pattern: /^[1]\d{9}$/ },
  { country: "Singapour", abbr: "SG", code: "+65", format: "XXXX XXXX", digits: 8, pattern: /^[8-9]\d{7}$/ },
  { country: "Thaïlande", abbr: "TH", code: "+66", format: "X XXXX XXXX", digits: 9, pattern: /^[6-9]\d{8}$/ },

  // Moyen-Orient
  { country: "Émirats arabes unis", abbr: "AE", code: "+971", format: "XX XXX XXXX", digits: 9, pattern: /^[5]\d{8}$/ },
  { country: "Arabie saoudite", abbr: "SA", code: "+966", format: "XX XXX XXXX", digits: 9, pattern: /^[5]\d{8}$/ },
  { country: "Qatar", abbr: "QA", code: "+974", format: "XXXX XXXX", digits: 8, pattern: /^[3-7]\d{7}$/ },
  { country: "Israël", abbr: "IL", code: "+972", format: "XX XXX XXXX", digits: 9, pattern: /^[5]\d{8}$/ },

  // Océanie
  { country: "Australie", abbr: "AU", code: "+61", format: "XXX XXX XXX", digits: 9, pattern: /^[4]\d{8}$/ },
  { country: "Nouvelle-Zélande", abbr: "NZ", code: "+64", format: "XX XXX XXXX", digits: 9, pattern: /^[2]\d{8}$/ },
]

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

  const formations = [
    { id: "dev-web-mobile", name: "Développement Web & Mobile" },
    { id: "referent-digital", name: "Référent Digital" },
    { id: "dev-data", name: "Développeur Data" },
    { id: "hackeuses", name: "Hackeuses (100% femmes)", femaleOnly: true },
    { id: "aws-cloud", name: "AWS (Cloud Computing)" },
    { id: "cyber-security", name: "Cyber security" },
    { id: "intelligence-artificielle", name: "Intelligence Artificielle" },
  ]

  const regions = [
    "Dakar",
    "Diourbel",
    "Fatick",
    "Kaffrine",
    "Kaolack",
    "Kédougou",
    "Kolda",
    "Louga",
    "Matam",
    "Saint-Louis",
    "Sédhiou",
    "Tambacounda",
    "Thiès",
    "Ziguinchor",
  ]

  const nationalities = [
    "Afghane",
    "Albanaise",
    "Algérienne",
    "Allemande",
    "Américaine",
    "Andorrane",
    "Angolaise",
    "Antiguaise",
    "Argentine",
    "Arménienne",
    "Australienne",
    "Autrichienne",
    "Azerbaïdjanaise",
    "Bahaméenne",
    "Bahreïnienne",
    "Bangladaise",
    "Barbadienne",
    "Belge",
    "Bélizienne",
    "Béninoise",
    "Bhoutanaise",
    "Biélorusse",
    "Birmane",
    "Bissau-Guinéenne",
    "Bolivienne",
    "Bosnienne",
    "Botswanaise",
    "Brésilienne",
    "Britannique",
    "Brunéienne",
    "Bulgare",
    "Burkinabè",
    "Burundaise",
    "Cambodgienne",
    "Camerounaise",
    "Canadienne",
    "Cap-verdienne",
    "Centrafricaine",
    "Chilienne",
    "Chinoise",
    "Chypriote",
    "Colombienne",
    "Comorienne",
    "Congolaise (Congo-Brazzaville)",
    "Congolaise (Congo-Kinshasa)",
    "Coréenne du Nord",
    "Coréenne du Sud",
    "Costaricaine",
    "Croate",
    "Cubaine",
    "Danoise",
    "Djiboutienne",
    "Dominicaine",
    "Dominiquaise",
    "Égyptienne",
    "Émirienne",
    "Équato-guinéenne",
    "Équatorienne",
    "Érythréenne",
    "Espagnole",
    "Estonienne",
    "Eswatinienne",
    "Éthiopienne",
    "Fidjienne",
    "Finlandaise",
    "Française",
    "Gabonaise",
    "Gambienne",
    "Géorgienne",
    "Ghanéenne",
    "Grecque",
    "Grenadienne",
    "Guatémaltèque",
    "Guinéenne",
    "Guyanienne",
    "Haïtienne",
    "Hondurienne",
    "Hongroise",
    "Indienne",
    "Indonésienne",
    "Irakienne",
    "Iranienne",
    "Irlandaise",
    "Islandaise",
    "Israélienne",
    "Italienne",
    "Ivoirienne",
    "Jamaïcaine",
    "Japonaise",
    "Jordanienne",
    "Kazakhstanaise",
    "Kényane",
    "Kirghize",
    "Kiribatienne",
    "Koweïtienne",
    "Laotienne",
    "Lesothane",
    "Lettone",
    "Libanaise",
    "Libérienne",
    "Libyenne",
    "Liechtensteinoise",
    "Lituanienne",
    "Luxembourgeoise",
    "Macédonienne",
    "Malaisienne",
    "Malawite",
    "Maldivienne",
    "Malienne",
    "Maltaise",
    "Marocaine",
    "Marshallaise",
    "Mauricienne",
    "Mauritanienne",
    "Mexicaine",
    "Micronésienne",
    "Moldave",
    "Monégasque",
    "Mongole",
    "Monténégrine",
    "Mozambicaine",
    "Namibienne",
    "Nauruane",
    "Néerlandaise",
    "Néo-Zélandaise",
    "Népalaise",
    "Nicaraguayenne",
    "Nigériane",
    "Nigérienne",
    "Niuéenne",
    "Nord-coréenne",
    "Norvégienne",
    "Omanaise",
    "Ougandaise",
    "Ouzbèke",
    "Pakistanaise",
    "Palaosienne",
    "Palestinienne",
    "Panaméenne",
    "Papouasienne",
    "Paraguayenne",
    "Péruvienne",
    "Philippine",
    "Polonaise",
    "Portugaise",
    "Qatarienne",
    "Roumaine",
    "Russe",
    "Rwandaise",
    "Saint-Lucienne",
    "Saint-Marinaise",
    "Saint-Vincentaise",
    "Salomonaise",
    "Salvadorienne",
    "Samoane",
    "Santoméenne",
    "Saoudienne",
    "Sénégalaise",
    "Serbe",
    "Seychelloise",
    "Sierra-Léonaise",
    "Singapourienne",
    "Slovaque",
    "Slovène",
    "Somalienne",
    "Soudanaise",
    "Sud-Africaine",
    "Sud-Coréenne",
    "Sud-Soudanaise",
    "Suédoise",
    "Suisse",
    "Surinamaise",
    "Syrienne",
    "Tadjike",
    "Tanzanienne",
    "Tchadienne",
    "Tchèque",
    "Thaïlandaise",
    "Timoraise",
    "Togolaise",
    "Tonguienne",
    "Trinidadienne",
    "Tunisienne",
    "Turkmène",
    "Turque",
    "Tuvaluane",
    "Ukrainienne",
    "Uruguayenne",
    "Vanuatuane",
    "Vaticane",
    "Vénézuélienne",
    "Vietnamienne",
    "Yéménite",
    "Zambienne",
    "Zimbabwéenne",
  ]

  // Organiser les nationalités par première lettre
  const getNationalitiesByLetter = () => {
    const nationalitiesByLetter = {}

    nationalities.forEach((nationality) => {
      const firstLetter = nationality.charAt(0).toUpperCase()
      if (!nationalitiesByLetter[firstLetter]) {
        nationalitiesByLetter[firstLetter] = []
      }
      nationalitiesByLetter[firstLetter].push(nationality)
    })

    // Trier les clés alphabétiquement
    return Object.keys(nationalitiesByLetter)
      .sort()
      .reduce((result, key) => {
        result[key] = nationalitiesByLetter[key].sort((a, b) => a.localeCompare(b, "fr"))
        return result
      }, {})
  }

  // Récupérer les nationalités organisées par lettre
  const nationalitiesByLetter = getNationalitiesByLetter()

  const getMonthsForFormation = (formation) => {
    if (formation === "cyber-security") return 3
    if (formation === "intelligence-artificielle") return 4
    if (["hackeuses", "aws-cloud"].includes(formation)) return 4
    return 10
  }

  // Fonctions de validation
  const validateName = (value) => {
    if (!value.trim()) return "Ce champ est requis"
    // Modification: Autoriser les caractères spéciaux (accents, tirets, apostrophes)
    if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(value)) return "Veuillez entrer un nom valide"
    return null
  }

  const validateFirstName = (value) => {
    if (!value.trim()) return "Ce champ est requis"
    // Modification: Autoriser les caractères spéciaux (accents, tirets, apostrophes)
    if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(value)) return "Veuillez entrer un prénom valide"
    // Vérification de la longueur minimale
    return null
  }

  const validateEmail = (value) => {
    if (!value.trim()) return "L'email est requis"
    // Regex plus stricte pour l'email qui vérifie que le domaine a au moins 2 caractères après le point
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) return "Format d'email invalide"
    return null
  }

  // Nouvelle fonction de validation du téléphone basée sur le pays sélectionné
  const validatePhone = (value) => {
    if (!value.trim()) return "Le numéro de téléphone est requis"

    // Vérifier le nombre de chiffres
    if (value.length !== selectedCountry.digits) {
      return `Le numéro doit contenir exactement ${selectedCountry.digits} chiffres pour ${selectedCountry.country}`
    }

    // Vérifier le format selon le pattern du pays
    if (!selectedCountry.pattern.test(value)) {
      return `Format invalide pour un numéro ${selectedCountry.country}`
    }

    return null
  }

  const validateBirthPlace = (value) => {
    if (!value.trim()) return "Le lieu de naissance est requis"
    // Modification: Vérifier que le lieu ne commence pas par un chiffre
    if (/^\d/.test(value)) return "Le lieu ne doit pas commencer par un chiffre"
    return null
  }

  const validateIdNumber = (value) => {
    if (!value.trim()) return "Le numéro est requis"

    if (idType === "cni") {
      // CNI: alphanumérique, minimum 13 caractères, maximum 14 caractères
      if (!/^[A-Za-z0-9]{13,14}$/.test(value)) {
        return "La CNI doit contenir entre 13 et 14 caractères alphanumériques"
      }
    } else if (idType === "passport") {
      if (value.length < 8 || value.length > 9) return "Le passeport doit contenir 8 ou 9 caractères"
    }

    return null
  }

  // Validation d'un champ spécifique
  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
        return validateFirstName(value)
      case "lastName":
        return validateName(value)
      case "email":
        return validateEmail(value)
      case "phone":
        return validatePhone(value)
      case "birthPlace":
        return validateBirthPlace(value)
      case "birthDate":
        return !value ? "La date de naissance est requise" : null
      case "gender":
        return !value ? "Le genre est requis" : null
      case "idNumber":
        return validateIdNumber(value)
      case "nationality":
        return !value ? "La nationalité est requise" : null
      case "region":
        return !value ? "La région de résidence est requise" : null
      case "currentStructure":
        return null // Plus d'obligation pour la structure actuelle
      case "education":
        return !value ? "Le niveau d'études est requis" : null
      case "formation":
        return !value ? "Veuillez sélectionner une formation" : null
      case "isWorking":
        return value === undefined ? "Veuillez répondre par oui ou non" : null
      default:
        return null
    }
  }

  // Marquer un champ comme touché et valider
  const markFieldAsTouched = (name) => {
    setTouchedFields((prev) => ({
      ...prev,
      [name]: true,
    }))

    // Valider le champ
    const error = validateField(name, formData[name])
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
      const error = validateIdNumber(formData.idNumber)
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

    // Réinitialiser le numéro de téléphone lors du changement de pays
    setFormData((prev) => ({
      ...prev,
      phone: "",
    }))

    // Réinitialiser les erreurs de téléphone
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors.phone
      return newErrors
    })
  }

  // Fonction pour formater le numéro de téléphone selon le format du pays
  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return ""

    // Exemple simple de formatage (peut être amélioré pour correspondre exactement au format)
    let formatted = ""
    let currentGroup = ""
    const format = selectedCountry.format.split(" ")
    let digitIndex = 0

    for (let i = 0; i < format.length; i++) {
      const groupLength = format[i].length
      currentGroup = ""

      for (let j = 0; j < groupLength; j++) {
        if (digitIndex < phoneNumber.length) {
          currentGroup += phoneNumber[digitIndex]
          digitIndex++
        }
      }

      if (currentGroup) {
        formatted += currentGroup + (i < format.length - 1 ? " " : "")
      }
    }

    return formatted
  }

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target

    // Mise à jour des données du formulaire
    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      })
    } else {
      // Validation en temps réel pour les champs texte
      let newValue = value

      // Validation spécifique pour les champs de nom
      if (name === "firstName" || name === "lastName") {
        // Autoriser les caractères spéciaux mais pas les chiffres
        newValue = value.replace(/[0-9]/g, "")
      }

      // Validation spécifique pour le lieu de naissance
      if (name === "birthPlace") {
        // Autoriser les chiffres sauf au début
        if (/^\d/.test(value) && value.length === 1) {
          newValue = ""
        }
      }

      // Validation spécifique pour le téléphone
      if (name === "phone") {
        // Autoriser uniquement les chiffres
        newValue = value.replace(/[^0-9]/g, "")

        // Limiter au nombre de chiffres du pays sélectionné
        if (newValue.length > selectedCountry.digits) {
          newValue = newValue.slice(0, selectedCountry.digits)
        }
      }

      // Validation spécifique pour le numéro d'identité (CNI uniquement)
      if (name === "idNumber" && idType === "cni") {
        // Autoriser uniquement les caractères alphanumériques pour la CNI
        newValue = value.replace(/[^A-Za-z0-9]/g, "")
        
        // Limiter à 14 caractères maximum pour la CNI
        if (newValue.length > 14) {
          newValue = newValue.slice(0, 14)
        }
        // Note: La validation de minimum 13 caractères se fait dans validateIdNumber
      }

      // Si formation change, réinitialiser l'éducation
      if (name === "formation") {
        setFormData({
          ...formData,
          [name]: newValue,
          education: "", // Réinitialiser l'éducation
          currentStructure: "", // Réinitialiser la structure actuelle
        })
      } else {
        setFormData({
          ...formData,
          [name]: newValue,
        })
      }

      // Vérification en temps réel pour email et CNI/passeport
      if (name === "email" && newValue.length >= 3 && !checkingEmail) {
        await checkUniqueFields("email", newValue)
      } else if (name === "idNumber" && newValue.length >= 3 && !checkingIdNumber) {
        await checkUniqueFields("idNumber", newValue)
      }
    }

    // Valider le champ si déjà touché
    if (touchedFields[name]) {
      const error = validateField(name, type === "checkbox" ? checked : value)
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

      const response = await fetch(
        `https://api.orangedigitalcenter.sn/api/candidature/check-unique?field=${field}&value=${encodeURIComponent(value)}`,

      )
      const data = await response.json()

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
      const error = validateField(field, formData[field])
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
      const response = await fetch("https://api.orangedigitalcenter.sn/api/candidature/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(candidatureData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la soumission")
      }

      const result = await response.json()
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
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/competences" className="text-[#ff7900] hover:text-[#e66f00] flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">Déposer ma candidature</h1>
          <p className="text-gray-600">Remplissez le formulaire ci-dessous pour postuler à nos formations gratuites.</p>
        </div>

        <div className="mb-6">
          <Alert variant="destructive" className="bg-red-50 border-red-300">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800 font-bold">Attention - une double inscription entraîne une exclusion immédiate.</AlertTitle>
            <AlertDescription className="text-red-700">
            Chaque candidat ne peut s’inscrire qu’une seule fois. Toute tentative de double candidature sera automatiquement détectée et éliminera votre dossier sans possibilité de recours. Vérifiez attentivement vos informations avant de valider votre inscription.            </AlertDescription>
          </Alert>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <form onSubmit={handleSubmit} ref={formRef}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
              <div>
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
                      const error = validateIdNumber(formData.idNumber)
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

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                As-tu des notions en informatique ? <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-4">
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

            <div className="mb-6">
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                ref={(el) => (fieldRefs.current.isWorking = el)}
              >
                Travaillez-vous dans une entreprise actuellement?<span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-4">
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

            <div className="mb-6">
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                ref={(el) => (fieldRefs.current.isAvailable = el)}
              >
                Es-tu disponible pour te concentrer exclusivement à la formation pendant quelques mois ?{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-4">
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

            <div className="mb-8">
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
                className="bg-[#ff7900] hover:bg-[#e66f00] flex items-center"
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
          </form>
        </div>
      </div>
    </div>
  )
}