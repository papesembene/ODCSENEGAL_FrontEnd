"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { RichTextDisplay } from "@/components/ui/rich-text-display"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  Lock,
  User,
  Phone,
  Mail,
  Shield,
  RefreshCw
} from "lucide-react"
import { toast, Toaster } from "sonner"
import { AntiCheatService } from "./antiCheat"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function TestCandidatePage() {
  const params = useParams()
  const router = useRouter()
  const testId = params?.testId
  const [loading, setLoading] = useState(true)
  const [testData, setTestData] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [testStarted, setTestStarted] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(true)
  const [authError, setAuthError] = useState("")
  
  // Gestion de l'accès par date/heure
  const [testAccessStatus, setTestAccessStatus] = useState("checking") // checking, too_early, expired, available
  const [scheduledDateTime, setScheduledDateTime] = useState(null)
  const [countdown, setCountdown] = useState("")
  
  // Modals
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  
  const [authData, setAuthData] = useState({
    name: "",
    email: "",
    phone: ""
  })

  const storageKeys = useMemo(() => ({
    answers: `test::${testId}::answers`,
    startedAt: `test::${testId}::startedAt`,
    auth: `test::${testId}::auth`,
    submitted: `test::${testId}::submitted`
  }), [testId])

  const [resumeAttempted, setResumeAttempted] = useState(false)
  const [resuming, setResuming] = useState(false)

  const timerRef = useRef(null)
  const antiCheatRef = useRef(null)

  const loadTestData = async () => {
    try {
      if (!testId) {
        return
      }
      const response = await fetch(`${API_BASE_URL}/api/admin/tests/${testId}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        const test = result.data
        console.log("Test chargé depuis MongoDB:", test.title)
        setTestData(test)
        setTimeRemaining(test.duration * 60)
        setLoading(false)
        checkTestAvailability(test)
        return
      }
      
      // Test non trouvé
      toast.error("Test non trouvé")
      setTestData(null)
      setLoading(false)
    } catch (error) {
      console.error("Erreur lors du chargement du test:", error)
      toast.error("Erreur lors du chargement du test. Vérifiez que le backend est démarré.")
      setTestData(null)
      setLoading(false)
    }
  }

  const checkTestAvailability = (test) => {
    const now = new Date()
    const testDateTime = new Date(`${test.scheduledDate}T${test.scheduledTime}`)
    const testEndTime = new Date(testDateTime.getTime() + test.duration * 60000)
    
    setScheduledDateTime(testDateTime)
    
    if (now < testDateTime) {
      setTestAccessStatus("too_early")
      calculateCountdown(testDateTime)
    } else if (now > testEndTime) {
      setTestAccessStatus("expired")
    } else if (test.status !== "active") {
      setTestAccessStatus("inactive")
    } else {
      setTestAccessStatus("available")
    }
  }
  
  const calculateCountdown = (targetDateTime) => {
    const timer = setInterval(() => {
      const now = new Date()
      const diff = targetDateTime - now
      
      if (diff <= 0) {
        clearInterval(timer)
        setTestAccessStatus("available")
        setCountdown("")
        toast.success("Le test est maintenant disponible ! Vous pouvez vous authentifier.")
        return
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      let countdownText = ""
      if (days > 0) countdownText += `${days}j `
      if (hours > 0 || days > 0) countdownText += `${hours}h `
      countdownText += `${minutes}min ${seconds}s`
      
      setCountdown(countdownText)
    }, 1000)
    
    return timer
  }

  const performAuthentication = useCallback(
    async ({ name, email, phone }, { silent = false, skipValidation = false } = {}) => {
      setAuthError("")
      const cleanedEmail = (email || "").trim().toLowerCase()
      const cleanedPhone = (phone || "").replace(/\s/g, "")
      const cleanedName = (name || "").trim()

      if (!skipValidation) {
        if (!cleanedName || !cleanedEmail || !cleanedPhone) {
          const error = "❌ Veuillez remplir tous les champs"
          setAuthError(error)
          if (!silent) toast.error(error)
          return false
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if (!emailRegex.test(cleanedEmail)) {
          const error = "❌ Format d'email invalide. Exemple: exemple@email.com"
          setAuthError(error)
          if (!silent) toast.error(error)
          return false
        }

        // Validation minimale : juste vérifier qu'il y a des chiffres
        // Le backend fera la vraie validation en comparant avec la base de données
        const hasDigits = /\d/.test(cleanedPhone)
        if (!hasDigits) {
          const error = "❌ Veuillez entrer un numéro de téléphone valide"
          setAuthError(error)
          if (!silent) toast.error(error)
          return false
        }
      } else if (!cleanedEmail || !cleanedPhone) {
        return false
      }

      setLoading(true)

      try {
        // Envoyer le téléphone tel quel, le backend fera la normalisation
        // On retire juste les espaces en début/fin pour éviter les erreurs
        const phoneToSend = (phone || "").trim()
        
        const verifyResponse = await fetch(`${API_BASE_URL}/api/admin/tests/${testId}/verify-access`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: cleanedEmail,
            phone: phoneToSend
          })
        })

        const verifyResult = await verifyResponse.json()

        if (!verifyResponse.ok || !verifyResult.success || !verifyResult.authorized) {
          const error = verifyResult.error || "❌ Accès non autorisé"
          setAuthError(error)
          if (!silent) toast.error(error)
          return false
        }

        // await fetch(`${API_BASE_URL}/api/admin/tests/${testId}/log-connection`, {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({
        //     email: cleanedEmail,
        //     candidateId: verifyResult.candidate?.id
        //   })
        // })

        const candidateName = cleanedName || [
          verifyResult.candidate?.firstName,
          verifyResult.candidate?.lastName
        ].filter(Boolean).join(" ").trim()

        setAuthData({
          name: candidateName,
          email: cleanedEmail,
          phone: cleanedPhone
        })

        if (typeof window !== "undefined") {
          localStorage.setItem(
            storageKeys.auth,
            JSON.stringify({
              name: candidateName,
              email: cleanedEmail,
              phone: cleanedPhone
            })
          )
        }

        setIsAuthenticated(true)
        setShowAuthDialog(false)
        setAuthError("")
        if (!silent) {
          toast.success("✅ Authentification réussie. Vous pouvez commencer le test.")
        }
        return true
      } catch (error) {
        console.error("Erreur d'authentification:", error)
        const errorMsg = "❌ Erreur de connexion au serveur. Veuillez réessayer."
        setAuthError(errorMsg)
        if (!silent) toast.error(errorMsg)
        return false
      } finally {
        setLoading(false)
      }
    },
    [testId, storageKeys]
  )

  const resumeTestFromStorage = useCallback(() => {
    if (!testData || typeof window === "undefined") {
      return
    }

    try {
      const storedSubmitted = localStorage.getItem(storageKeys.submitted)
      if (storedSubmitted === "true") {
        setTestCompleted(true)
        setShowSuccessModal(true)
        toast.info("Vous avez déjà soumis ce test. Merci pour votre participation.")
        return
      }

      const storedAnswers = localStorage.getItem(storageKeys.answers)
      if (storedAnswers) {
        const parsedAnswers = JSON.parse(storedAnswers)
        if (parsedAnswers && typeof parsedAnswers === "object") {
          setAnswers(parsedAnswers)
        }
      }

      const storedStartedAt = localStorage.getItem(storageKeys.startedAt)
      if (storedStartedAt) {
        const startedAtDate = new Date(storedStartedAt)
        if (!Number.isNaN(startedAtDate.getTime())) {
          const endTime = startedAtDate.getTime() + testData.duration * 60000
          const remainingSeconds = Math.max(0, Math.floor((endTime - Date.now()) / 1000))
          setTimeRemaining(remainingSeconds)

          if (remainingSeconds > 0) {
            setTestStarted(true)
            if (!resuming) {
              toast.info("Reprise de votre session de test.")
            }
          } else {
            setTestStarted(false)
            setTestCompleted(true)
            setShowSuccessModal(true)
          }
        }
      }
    } catch (error) {
      console.warn("Impossible de reprendre l'état du test depuis le stockage local:", error)
    }
  }, [resuming, storageKeys, testData])

  useEffect(() => {
    loadTestData()
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      // Nettoyer le service anti-triche lors du démontage
      if (antiCheatRef.current) {
        try {
          antiCheatRef.current.stop()
          antiCheatRef.current.cleanup()
        } catch (error) {
          console.warn("Erreur lors du nettoyage du service anti-triche:", error)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const storedAuth = localStorage.getItem(storageKeys.auth)
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth)
        setAuthData((prev) => ({
          name: parsed.name || prev.name || "",
          email: parsed.email || prev.email || "",
          phone: parsed.phone || prev.phone || ""
        }))
      } catch (error) {
        console.warn("Impossible de recharger les informations d'authentification locales:", error)
      }
    }
  }, [storageKeys])

  useEffect(() => {
    if (testStarted && timeRemaining > 0 && !testCompleted) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmitTest(true) // Auto-submit quand le temps expire
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      return () => clearInterval(timerRef.current)
    }
  }, [testStarted, timeRemaining, testCompleted])

  useEffect(() => {
    if (!testData || testAccessStatus !== "available" || isAuthenticated || resumeAttempted) {
      return
    }
    if (typeof window === "undefined") {
      return
    }

    const storedAuth = localStorage.getItem(storageKeys.auth)
    if (!storedAuth) {
      setResumeAttempted(true)
      return
    }

    try {
      const parsed = JSON.parse(storedAuth)
      if (parsed?.email && parsed?.phone) {
        setResuming(true)
        performAuthentication(parsed, { silent: true, skipValidation: true })
          .finally(() => {
            setResumeAttempted(true)
            setResuming(false)
          })
      } else {
        setResumeAttempted(true)
      }
    } catch (error) {
      console.warn("Impossible de reprendre automatiquement l'authentification:", error)
      setResumeAttempted(true)
    }
  }, [performAuthentication, resumeAttempted, storageKeys, testAccessStatus, isAuthenticated, testData])

  useEffect(() => {
    if (isAuthenticated) {
      resumeTestFromStorage()
    }
  }, [isAuthenticated, resumeTestFromStorage])

  // Réinitialiser le service anti-triche après un rafraîchissement si le test est en cours
  useEffect(() => {
    // Vérifier que toutes les conditions sont remplies
    if (!testStarted || testCompleted || !isAuthenticated || !authData.email || !testId) {
      return
    }

    // Vérifier si le service existe déjà et est actif
    if (antiCheatRef.current && antiCheatRef.current.isActive) {
      console.log("[AntiCheat] Service déjà actif, pas de réinitialisation nécessaire")
      return
    }
    
    console.log("[AntiCheat] Réinitialisation du service anti-triche après rafraîchissement...")
    
    // Nettoyer l'ancien service s'il existe
    if (antiCheatRef.current) {
      try {
        antiCheatRef.current.stop()
        antiCheatRef.current.cleanup()
      } catch (error) {
        console.warn("[AntiCheat] Erreur lors du nettoyage de l'ancien service:", error)
      }
    }
    
    // Réinitialiser le service anti-triche
    try {
      antiCheatRef.current = new AntiCheatService(
        testId,
        authData.email,
        (violation) => {
          // Afficher un avertissement pour certaines violations
          if (violation.type === 'tab_switch' || violation.type === 'blur') {
            toast.warning(`⚠️ ${violation.message}`)
          }
        }
      )
      antiCheatRef.current.start()
      console.log("[AntiCheat] ✅ Service anti-triche réinitialisé et démarré avec succès")
      console.log("[AntiCheat] Violations restaurées:", antiCheatRef.current.violations.length)
    } catch (error) {
      console.error("[AntiCheat] ❌ Erreur lors de l'initialisation du service:", error)
    }
    
    return () => {
      if (antiCheatRef.current) {
        try {
          console.log("[AntiCheat] Nettoyage du service anti-triche...")
          antiCheatRef.current.stop()
          antiCheatRef.current.cleanup()
        } catch (error) {
          console.warn("[AntiCheat] Erreur lors du nettoyage:", error)
        }
      }
    }
  }, [testStarted, testCompleted, isAuthenticated, authData.email, testId])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const handleBeforeUnload = (event) => {
      if (testStarted && !testCompleted) {
        event.preventDefault()
        event.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [testStarted, testCompleted])

  useEffect(() => {
    if (typeof document === "undefined") {
      return
    }

    const handleVisibility = () => {
      if (document.hidden && testStarted && !testCompleted) {
        toast.warning("⚠️ Veuillez rester sur l'onglet du test.")
      }
    }

    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [testStarted, testCompleted])

  const handleAuthenticate = async () => {
    await performAuthentication(authData)
  }

  const handleStartTest = () => {
    if (typeof window !== "undefined") {
      const alreadySubmitted = localStorage.getItem(storageKeys.submitted)
      if (alreadySubmitted === "true") {
        toast.error("Vous avez déjà soumis ce test.")
        setTestCompleted(true)
        setShowSuccessModal(true)
        return
      }
    }

    // Calculer le temps restant en fonction de l'heure actuelle
    const now = new Date()
    const testDateTime = new Date(`${testData.scheduledDate}T${testData.scheduledTime}`)
    const testEndTime = new Date(testDateTime.getTime() + testData.duration * 60000)
    
    // Temps écoulé depuis le début du test (en millisecondes)
    const elapsedMs = now - testDateTime
    const elapsedMinutes = Math.floor(elapsedMs / 60000)
    
    // Temps restant en secondes
    const remainingMinutes = Math.max(0, testData.duration - elapsedMinutes)
    const remainingSeconds = remainingMinutes * 60
    
    setTimeRemaining(remainingSeconds)
    setTestStarted(true)
    
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKeys.startedAt, new Date().toISOString())
    }
    
    // Démarrer le service anti-triche
    if (authData.email && testId) {
      antiCheatRef.current = new AntiCheatService(
        testId,
        authData.email,
        (violation) => {
          // Afficher un avertissement pour certaines violations
          if (violation.type === 'tab_switch' || violation.type === 'blur') {
            toast.warning(`⚠️ ${violation.message}`)
          }
        }
      )
      antiCheatRef.current.start()
    }
    
    if (remainingMinutes < testData.duration) {
      toast.warning(`Attention ! Il vous reste ${remainingMinutes} minute(s) pour terminer le test.`)
    } else {
      toast.success("Le test a commencé. Bonne chance !")
    }
  }

  const handleAnswerChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value
    })
  }
  
  const handleMultipleAnswerChange = (questionId, optionIndex, checked) => {
    const currentAnswers = answers[questionId] || []
    const newAnswers = checked
      ? [...currentAnswers, optionIndex]
      : currentAnswers.filter(i => i !== optionIndex)
    
    setAnswers({
      ...answers,
      [questionId]: newAnswers
    })
  }

  useEffect(() => {
    if (!testStarted || typeof window === "undefined") {
      return
    }

    try {
      localStorage.setItem(storageKeys.answers, JSON.stringify(answers))
    } catch (error) {
      console.warn("Impossible d'enregistrer les réponses dans le stockage local:", error)
    }
  }, [answers, storageKeys, testStarted])

  const handleNextQuestion = () => {
    if (currentQuestion < testData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const calculateScore = () => {
    let totalScore = 0
    let maxScore = 0
    
    testData.questions.forEach((question, index) => {
      maxScore += question.score
      
      // Gérer les différents types de questions
      if (question.type === "qcm_multiple") {
        // QCM à choix multiples
        const userAnswers = answers[index] || []
        const correctAnswers = question.correctAnswers || []
        
        // Comparer les réponses
        const isCorrect = correctAnswers.length === userAnswers.length &&
                         correctAnswers.every(ans => userAnswers.includes(ans))
        
        if (isCorrect) {
          totalScore += question.score
        }
      } else if (question.type === "texte_libre") {
        // Pour l'instant, on ne note pas automatiquement le texte libre
        // Un admin devrait le noter manuellement
        // On compte la question comme correcte si une réponse a été fournie
        if (answers[index] && answers[index].trim() !== "") {
          totalScore += question.score
        }
      } else {
        // QCM simple (ancien format et nouveau)
        if (answers[index] === question.correctAnswer) {
          totalScore += question.score
        }
      }
    })
    
    return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
  }

  const handleSubmitTest = (autoSubmit = false) => {
    if (!autoSubmit) {
      // Afficher le modal de confirmation pour toute soumission manuelle
      setShowConfirmSubmit(true)
      return
    }
    
    // Procéder à la soumission (auto-submit uniquement)
    confirmSubmitTest(autoSubmit)
  }

  const confirmSubmitTest = (autoSubmit = false) => {
    setShowConfirmSubmit(false)
    clearInterval(timerRef.current)
    
    // Arrêter le service anti-triche
    if (antiCheatRef.current) {
      const violationsSummary = antiCheatRef.current.getViolationsSummary()
      console.log("Résumé des violations:", violationsSummary)
      antiCheatRef.current.stop()
      antiCheatRef.current.cleanup()
    }
    
    const finalScore = calculateScore()
    setScore(finalScore)
    setTestStarted(false)
    setTestCompleted(true)
    
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKeys.submitted, "true")
      localStorage.removeItem(storageKeys.startedAt)
      localStorage.removeItem(storageKeys.answers)
    }
    
    // Envoyer les résultats au serveur
    submitResults(finalScore)
    
    // Afficher le modal de succès
    setShowSuccessModal(true)
    
    if (autoSubmit) {
      toast.warning("Le temps est écoulé. Votre test a été automatiquement soumis.")
    }
  }

  const submitResults = async (finalScore) => {
    try {
      const resultData = {
        id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        testId: testData.id,
        testTitle: testData.title,
        referentiel: testData.referentiel,
        candidate: {
          name: authData.name,
          email: authData.email,
          phone: authData.phone?.replace(/\s/g, "")
        },
        score: finalScore,
        status: finalScore >= testData.passingScore ? "admis" : "rejeté",
        totalQuestions: testData.questions.length,
        answeredQuestions: Object.keys(answers).length,
        answers,
        completedAt: new Date().toISOString(),
        submittedDate: new Date().toLocaleDateString('fr-FR'),
        submittedTime: new Date().toLocaleTimeString('fr-FR')
      }
      
      // Enregistrer dans MongoDB via l'API
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/tests/results`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(resultData)
        })
        
        const result = await response.json()
        
        if (result.success) {
          console.log("Résultats enregistrés avec succès dans MongoDB:", resultData)
          
          // Marquer la connexion comme terminée
          // await fetch(`${API_BASE_URL}/api/admin/tests/${testData.id}/complete-connection`, {
          //   method: "POST",
          //   headers: { "Content-Type": "application/json" },
          //   body: JSON.stringify({ email: authData.email.toLowerCase() })
          // })
          
          // Mettre à jour le statut du test si la durée est dépassée
          await fetch(`${API_BASE_URL}/api/admin/tests/${testData.id}/update-status`, {
            method: "POST"
          })
        } else {
          console.error("Erreur lors de l'enregistrement des résultats:", result.error)
          toast.error("Erreur lors de l'enregistrement des résultats")
          if (typeof window !== "undefined") {
            localStorage.removeItem(storageKeys.submitted)
          }
        }
      } catch (apiError) {
        console.error("Erreur lors de l'envoi des résultats à l'API:", apiError)
        toast.error("Impossible d'enregistrer les résultats. Vérifiez la connexion au backend.")
        if (typeof window !== "undefined") {
          localStorage.removeItem(storageKeys.submitted)
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi des résultats:", error)
      if (typeof window !== "undefined") {
        localStorage.removeItem(storageKeys.submitted)
      }
    }
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!testData) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
              Test non trouvé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base">Le test demandé n'existe pas ou n'est plus disponible.</p>
            <Button className="mt-4 w-full h-12 sm:h-10 text-sm sm:text-base touch-manipulation" onClick={() => router.push("/")}>
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Page d'attente si le test n'est pas encore disponible
  if (testAccessStatus === "too_early") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 px-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
              <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-orange-600 animate-pulse" />
            </div>
            <CardTitle className="text-xl sm:text-2xl">Test pas encore disponible</CardTitle>
            <CardDescription className="text-sm sm:text-base mt-2">
              Ce test sera accessible à partir du{" "}
              <strong className="text-orange-600">
                {scheduledDateTime?.toLocaleDateString("fr-FR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                à {scheduledDateTime?.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">Temps restant avant l'ouverture du test :</p>
              <div className="text-2xl sm:text-4xl font-bold text-orange-600 font-mono">{countdown}</div>
            </div>

            <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <AlertDescription className="text-xs sm:text-sm">
                <strong className="text-sm sm:text-base text-blue-900 dark:text-blue-100">Informations sur le test</strong>
                <div className="mt-2 space-y-1 text-xs sm:text-sm">
                  <p><strong>Test :</strong> {testData.title}</p>
                  <p><strong>Référentiel :</strong> {testData.referentiel}</p>
                  <p><strong>Durée :</strong> {testData.duration} minutes</p>
                  <p><strong>Nombre de questions :</strong> {testData.questions?.length || 0}</p>
                </div>
              </AlertDescription>
            </Alert>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200">
              <h4 className="font-semibold mb-2 text-sm sm:text-base text-orange-900 dark:text-orange-100">
                📋 Préparez-vous !
              </h4>
              <ul className="text-xs sm:text-sm space-y-1 text-orange-800 dark:text-orange-200">
                <li>✓ Vérifiez votre connexion internet</li>
                <li>✓ Assurez-vous d'avoir {testData.duration} minutes disponibles</li>
                <li>✓ Préparez vos informations (nom, email, téléphone)</li>
                <li>✓ Cette page se mettra à jour automatiquement</li>
              </ul>
            </div>

            <Button 
              variant="outline" 
              className="w-full h-12 sm:h-10 text-sm sm:text-base touch-manipulation"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualiser la page
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Page si le test a expiré
  if (testAccessStatus === "expired") {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <XCircle className="h-8 w-8 sm:h-10 sm:w-10 text-red-600" />
            </div>
            <CardTitle className="text-xl sm:text-2xl text-red-600">Test expiré</CardTitle>
            <CardDescription className="text-sm sm:text-base mt-2">
              Le créneau horaire pour passer ce test est terminé.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Ce test était disponible jusqu'au{" "}
              {scheduledDateTime && new Date(scheduledDateTime.getTime() + testData.duration * 60000).toLocaleString("fr-FR")}
            </p>
            <Alert>
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <AlertDescription className="text-xs sm:text-sm">
                Veuillez contacter l'administration pour plus d'informations.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Page si le test n'est pas actif
  if (testAccessStatus === "inactive") {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
              <Lock className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-600" />
            </div>
            <CardTitle className="text-xl sm:text-2xl">Test non actif</CardTitle>
            <CardDescription className="text-sm sm:text-base mt-2">
              Ce test n'est pas actif pour le moment.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              Veuillez contacter l'administration pour plus d'informations.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestionData = testData.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / testData.questions.length) * 100
  const answeredCount = Object.keys(answers).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        {/* Dialog d'authentification */}
        <Dialog open={showAuthDialog && !isAuthenticated && testAccessStatus === "available"} onOpenChange={setShowAuthDialog}>
          <DialogContent className="sm:max-w-md mx-4">
            <DialogHeader>
              <DialogTitle className="flex items-center text-base sm:text-lg">
                <Shield className="mr-2 h-5 w-5 text-orange-500" />
                Authentification requise
              </DialogTitle>
              <DialogDescription className="text-sm">
                Veuillez vous identifier pour accéder au test
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nom complet *</Label>
                <div className="relative">
                  <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    className="pl-8"
                    value={authData.name}
                    onChange={(e) => setAuthData({ ...authData, name: e.target.value })}
                    placeholder="Prénom Nom"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-8"
                    value={authData.email}
                    onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                    placeholder="votre.email@example.com"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Téléphone *</Label>
                <div className="relative">
                  <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    className="pl-8"
                    value={authData.phone}
                    onChange={(e) => setAuthData({ ...authData, phone: e.target.value })}
                    placeholder="+221 XX XXX XX XX"
                  />
                </div>
              </div>

              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  Une seule tentative est autorisée. Le test sera bloqué après expiration du temps.
                </AlertDescription>
              </Alert>

              {/* Affichage de l'erreur */}
              {authError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button onClick={handleAuthenticate} className="w-full" disabled={loading || resuming}>
                {loading ? "Vérification..." : resuming ? "Reprise en cours..." : "Continuer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Page d'accueil du test */}
        {isAuthenticated && !testStarted && (
          <Card>
            <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardTitle className="text-xl sm:text-2xl">{testData.title}</CardTitle>
              <CardDescription className="text-orange-100 text-sm sm:text-base">
                {testData.referentiel}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Durée</p>
                    <p className="text-base sm:text-lg font-semibold">{testData.duration} minutes</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Questions</p>
                    <p className="text-base sm:text-lg font-semibold">{testData.questions.length}</p>
                  </div>
                </div>
                
                
              </div>

              <Alert className="border-l-4 border-orange-500 bg-orange-50">
  <AlertCircle className="h-4 w-4 flex-shrink-0 text-orange-600" />
  <AlertDescription className="text-xs sm:text-sm text-gray-800">
    
    {/* TITRE */}
    <strong className="text-sm sm:text-base text-gray-900">
      📌 Instructions importantes
    </strong>

    {/* LISTE INSTRUCTIONS */}
    <ul className="list-disc list-inside mt-2 space-y-1 text-xs sm:text-sm">
      <li>Vous <span className="font-medium">ne pouvez pas mettre le test en pause</span>.</li>
      <li>Le test sera <span className="font-medium">automatiquement soumis</span> à l’expiration du temps.</li>
      <li>Assurez-vous d’avoir <span className="font-medium">une connexion stable</span>.</li>
      <li><span className="font-medium">Une seule tentative</span> est autorisée.</li>
      <li>Utilisation d'ordinateur fortement recommandée .</li>

    </ul>

    {/* SÉPARATEUR */}
    <div className="my-4 border-t border-gray-300"></div>

    {/* AVERTISSEMENT */}
    <strong className="text-sm sm:text-base block text-red-700">
      ⚠️ Avertissement anti-triche
    </strong>

    <p className="mt-2 text-xs sm:text-sm">
      Ce test est surveillé par un système avancé de détection.
      
    </p>

    {/* LISTE ANTI-TRICHE */}
    <ul className="list-disc list-inside mt-3 space-y-1 text-xs sm:text-sm">
      <li><span className="font-medium text-gray-900">Blocage du copier/coller</span> et des raccourcis suspects (Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A).</li>
      <li><span className="font-medium text-gray-900">Désactivation du clic droit</span> et des outils de développement (F12, Ctrl+Shift+I/J, Ctrl+U).</li>
      <li><span className="font-medium text-gray-900">Détection des captures d’écran</span> (PrintScreen, raccourcis spéciaux…).</li>
      <li><span className="font-medium text-gray-900">Détection des changements d’onglet</span>, duplication de la page, réduction de fenêtre ou perte de focus.</li>
      <li><span className="font-medium">Avertissements visuels</span> déclenchés automatiquement en cas de violation.</li>
      <li><span className="font-medium text-red-600">Avertissement sonore</span> en cas de comportement suspect.</li>
    </ul>

    {/* NOTE FINALE */}
    <p className="mt-3 text-xs sm:text-sm font-semibold text-red-700">
     Toute tentative de triche est enregistrée et transmise automatiquement à l’équipe d’évaluation.
     <br />
     Toute violation répétée ou grave entraînera une sanction pouvant aller jusqu’à l’invalidation du test.
    </p>
  </AlertDescription>
</Alert>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base truncate">Candidat : {authData.name}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{authData.email}</p>
                </div>
                <Badge className="bg-green-100 text-green-800 text-xs sm:text-sm flex-shrink-0">Prêt</Badge>
              </div>

              <Button 
                onClick={handleStartTest} 
                className="w-full bg-orange-500 hover:bg-orange-600 h-12 sm:h-14 text-base sm:text-lg touch-manipulation"
              >
                Commencer le test
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Interface du test */}
        {testStarted && !testCompleted && (
          <div className="space-y-4">
            {/* Header avec timer */}
            <Card>
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Question {currentQuestion + 1} sur {testData.questions.length}</p>
                    <p className="text-sm">
                      Répondues: {answeredCount} / {testData.questions.length}
                    </p>
                  </div>
                  
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg w-full sm:w-auto justify-center ${
                    timeRemaining < 300 ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                  }`}>
                    <Clock className="h-5 w-5" />
                    <span className="text-lg font-bold">{formatTime(timeRemaining)}</span>
                  </div>
                </div>
                <Progress value={progress} className="mt-4" />
              </CardContent>
            </Card>

            {/* Question */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                  <CardTitle className="text-lg sm:text-xl">
                    Question {currentQuestion + 1}
                  </CardTitle>
                  <div className="flex items-center space-x-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs sm:text-sm">{currentQuestionData.score} pts</Badge>
                    {currentQuestionData.type === "qcm_multiple" && (
                      <Badge variant="outline" className="text-xs sm:text-sm">Choix multiples</Badge>
                    )}
                  </div>
                </div>
                {/*
                <CardDescription className="text-base mt-2">
                  {currentQuestionData.question}
                </CardDescription>*/}
                <CardDescription className="text-sm sm:text-base mt-2">
                  <RichTextDisplay content={currentQuestionData.question} />
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Afficher l'image si elle existe */}
                {currentQuestionData.image && (
                  <div className="mb-6">
                    <img 
                      src={currentQuestionData.image} 
                      alt="Question" 
                      className="w-full max-w-full h-auto max-h-48 sm:max-h-64 mx-auto rounded-lg border shadow-sm"
                    />
                  </div>
                )}
                {/* QCM Simple */}
                {(!currentQuestionData.type || currentQuestionData.type === "qcm_simple") && (
                  <RadioGroup 
                    value={answers[currentQuestion] !== undefined && answers[currentQuestion] !== null ? answers[currentQuestion].toString() : ""}
                    onValueChange={(value) => handleAnswerChange(currentQuestion, parseInt(value))}
                  >
                    {currentQuestionData.options.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-4 sm:p-4 min-h-[56px] rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer touch-manipulation"
                      >
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} className="h-5 w-5 flex-shrink-0" />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-sm sm:text-base">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {/* QCM Multiple */}
                {currentQuestionData.type === "qcm_multiple" && (
                  <div className="space-y-3">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Plusieurs réponses possibles. Cochez toutes les bonnes réponses.
                      </AlertDescription>
                    </Alert>
                    {currentQuestionData.options.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-4 sm:p-4 min-h-[56px] rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 touch-manipulation"
                      >
                        <Checkbox
                          id={`option-multiple-${index}`}
                          checked={answers[currentQuestion] ? (Array.isArray(answers[currentQuestion]) && answers[currentQuestion].includes(index)) : false}
                          onCheckedChange={(checked) => handleMultipleAnswerChange(currentQuestion, index, checked)}
                          className="h-5 w-5 flex-shrink-0"
                        />
                        <Label htmlFor={`option-multiple-${index}`} className="flex-1 cursor-pointer text-sm sm:text-base">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}

                {/* Texte Libre */}
                {currentQuestionData.type === "texte_libre" && (
                  <div className="space-y-3">
                    <Textarea
                      value={answers[currentQuestion] || ""}
                      onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                      placeholder="Saisissez votre réponse ici..."
                      rows={6}
                      className="resize-none text-sm sm:text-base min-h-[120px]"
                    />
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Cette réponse sera évaluée manuellement par l'équipe ODC.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <Card>
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
                  <Button
                    variant="outline"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestion === 0}
                    className="w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm touch-manipulation"
                  >
                    Précédent
                  </Button>
                  
                  <div className="flex space-x-2 w-full sm:w-auto">
                    {currentQuestion === testData.questions.length - 1 ? (
                      <Button
                        onClick={() => handleSubmitTest(false)}
                        className="bg-green-500 hover:bg-green-600 w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm touch-manipulation"
                      >
                        Soumettre le test
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleNextQuestion}
                        className="w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm touch-manipulation"
                      >
                        Suivant
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation rapide */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm sm:text-base">Navigation rapide</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                  {testData.questions.map((q, index) => (
                    <Button
                      key={index}
                      variant={currentQuestion === index ? "default" : "outline"}
                      size="sm"
                      className={`min-h-[44px] text-xs sm:text-sm touch-manipulation ${
                        answers[index] !== undefined 
                          ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400" 
                          : ""
                      }`}
                      onClick={() => setCurrentQuestion(index)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Résultats */}
        {/* Modal de confirmation de soumission */}
        <Dialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
          <DialogContent className="sm:max-w-md mx-4">
            <DialogHeader>
              <DialogTitle className="flex items-center text-base sm:text-lg">
                <AlertCircle className="mr-2 h-5 w-5 text-orange-500" />
                Confirmer la soumission
              </DialogTitle>
              <DialogDescription className="text-sm">
                Êtes-vous sûr(e) de vouloir soumettre votre test ?
              </DialogDescription>
            </DialogHeader>
            
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {testData && (
                  <p>
                    <strong>Attention !</strong> Il vous reste {testData.questions.length - Object.keys(answers).length} question(s) non répondue(s). 
                    Une fois soumis, vous ne pourrez plus modifier vos réponses.
                  </p>
                )}
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmSubmit(false)}>
                Annuler
              </Button>
              <Button onClick={() => confirmSubmitTest(false)} className="bg-orange-500 hover:bg-orange-600">
                Confirmer la soumission
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de succès après soumission */}
        <Dialog open={showSuccessModal} onOpenChange={(open) => {
          if (!open) {
            router.push("/")
          }
        }}>
          <DialogContent className="sm:max-w-md mx-4">
            <DialogHeader>
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />
                </div>
              </div>
              <DialogTitle className="text-center text-xl sm:text-2xl">
                Test soumis avec succès !
              </DialogTitle>
              <DialogDescription className="text-center">
                Votre test a été enregistré avec succès
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    Vos résultats ont été transmis à l'équipe d'Orange Digital Center.
                  </p>
                </AlertDescription>
              </Alert>

              <Alert className="bg-orange-50 dark:bg-orange-900/20 border-orange-200">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription>
                  <p className="text-sm text-orange-900 dark:text-orange-100">
                    <strong>Prochaine étape :</strong> Vous serez recontacté(e) une fois votre candidature évaluée pour la suite du processus de sélection.
                  </p>
                </AlertDescription>
              </Alert>

              <div className="text-center text-sm text-muted-foreground">
                <p>Merci pour votre participation !</p>
                <p className="mt-1">L'équipe Orange Digital Center vous contactera sous peu.</p>
              </div>
            </div>

            <DialogFooter>
              <Button 
                onClick={() => router.push("/")} 
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                Retour à l'accueil
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  )
}