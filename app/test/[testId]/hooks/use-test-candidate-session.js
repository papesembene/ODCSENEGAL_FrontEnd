"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { AntiCheatService } from "../antiCheat"
import { fetchJsonWithTimeout, fetchWithTimeout } from "@/app/utils/fetchWithTimeout"
import {
  API_BASE_URL,
  buildResultPayload,
  calculateCountdownLabel,
  calculateScore,
  createStorageKeys,
  formatTime,
  getQuestionCount,
} from "../test-session-utils"
import { buildAuthenticatedCandidate, sanitizeAuthPayload, validateAuthPayload } from "./test-candidate-session-auth"
import { createAnswerHandlers } from "./test-candidate-session-handlers"
import { getTestAvailabilityState, getTestStartState } from "./test-candidate-session-status"
import { readStoredJsonValue, removeStoredValues, resolveStoredTestSession, writeStoredJsonValue, writeStoredValue } from "./test-candidate-session-storage"
import { useAutoResumeAuthentication, useRestoreStoredAuth } from "./use-test-candidate-auth-recovery"
import { useBeforeUnloadProtection, usePersistedAnswers, useVisibilityWarning } from "./use-test-candidate-browser-guards"

export default function useTestCandidateSession({ testId }) {
  const [loading, setLoading] = useState(true)
  const [testData, setTestData] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [testStarted, setTestStarted] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(true)
  const [authError, setAuthError] = useState("")
  const [testAccessStatus, setTestAccessStatus] = useState("checking")
  const [scheduledDateTime, setScheduledDateTime] = useState(null)
  const [countdown, setCountdown] = useState("")
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [authData, setAuthData] = useState({ name: "", email: "", phone: "" })
  const [resumeAttempted, setResumeAttempted] = useState(false)
  const [resuming, setResuming] = useState(false)
  const [loadingFullTest, setLoadingFullTest] = useState(false)

  const storageKeys = useMemo(() => createStorageKeys(testId), [testId])
  const timerRef = useRef(null)
  const antiCheatRef = useRef(null)
  const countdownRef = useRef(null)
  const serverDraftTimerRef = useRef(null)
  const lastServerDraftRef = useRef("")
  const lastServerDraftAtRef = useRef(0)

  const isExpectedAuthError = useCallback((message) => {
    return [
      "Test déjà passé",
      "Email ou numéro incorrect",
      "Numéro incorrect",
      "Vous ne faites pas partie du groupe autorisé",
      "Test expiré",
    ].some((expectedMessage) => message.includes(expectedMessage))
  }, [])

  const getFriendlyAuthMessage = useCallback((message) => {
    if (message.includes("Email ou numéro incorrect") || message.includes("Numéro incorrect")) {
      return "Les informations saisies ne correspondent pas à la liste autorisée pour ce test."
    }

    if (message.includes("Vous ne faites pas partie du groupe autorisé")) {
      return "Votre candidature n'est pas rattachée à ce groupe de test."
    }

    if (message.includes("Test expiré")) {
      return "Le créneau de ce test est terminé. Veuillez contacter l'administration."
    }

    return message
  }, [])

  const stopAntiCheat = useCallback(() => {
    if (!antiCheatRef.current) {
      return
    }

    try {
      antiCheatRef.current.stop()
      antiCheatRef.current.cleanup()
    } catch (error) {
      console.warn("Erreur lors du nettoyage du service anti-triche:", error)
    }
  }, [])

  const startAntiCheat = useCallback(() => {
    if (!authData.email || !testId) {
      return
    }

    stopAntiCheat()

    try {
      antiCheatRef.current = new AntiCheatService(testId, authData.email, (violation) => {
        if (violation.type === "tab_switch" || violation.type === "blur") {
          toast.warning(violation.message)
        }
      })
      antiCheatRef.current.start()
    } catch (error) {
      console.error("[AntiCheat] Erreur lors de l'initialisation du service:", error)
    }
  }, [authData.email, stopAntiCheat, testId])

  const updateCountdown = useCallback((targetDate) => {
    const nextLabel = calculateCountdownLabel(targetDate)

    if (!nextLabel) {
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
        countdownRef.current = null
      }
      setTestAccessStatus("available")
      setCountdown("")
      toast.success("Le test est maintenant disponible ! Vous pouvez vous authentifier.")
      return
    }

    setCountdown(nextLabel)
  }, [])

  const checkTestAvailability = useCallback((test) => {
    const { status, testDate } = getTestAvailabilityState(test)

    setScheduledDateTime(testDate)

    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }

    if (status === "too_early") {
      setTestAccessStatus("too_early")
      updateCountdown(testDate)
      countdownRef.current = setInterval(() => updateCountdown(testDate), 1000)
      return
    }

    if (status === "expired") {
      setTestAccessStatus("expired")
      return
    }

    if (status === "inactive") {
      setTestAccessStatus("inactive")
      return
    }

    setTestAccessStatus("available")
  }, [updateCountdown])

  const applyLoadedTest = useCallback((test) => {
    setTestData((prev) => ({
      ...(prev || {}),
      ...test,
    }))
    setTimeRemaining(test.duration * 60)
    checkTestAvailability(test)
  }, [checkTestAvailability])

  const loadTestMetadata = useCallback(async () => {
    try {
      if (!testId) {
        return
      }

      const result = await fetchJsonWithTimeout(`${API_BASE_URL}/api/admin/tests/${testId}/public`, {
        timeout: 15000,
        retries: 1,
      })

      if (result.success && result.data) {
        applyLoadedTest(result.data)
      } else {
        toast.error("Test non trouvé")
        setTestData(null)
      }
    } catch (error) {
      console.error("Erreur lors du chargement du test:", error)
      toast.error("Erreur lors du chargement du test. Vérifiez que le backend est démarré.")
      setTestData(null)
    } finally {
      setLoading(false)
    }
  }, [applyLoadedTest, testId])

  const ensureFullTestData = useCallback(async () => {
    if (!testId) {
      return null
    }

    if (Array.isArray(testData?.questions) && testData.questions.length > 0) {
      return testData
    }

    setLoadingFullTest(true)

    try {
      const result = await fetchJsonWithTimeout(`${API_BASE_URL}/api/admin/tests/${testId}`, {
        timeout: 20000,
        retries: 1,
      })

      if (!result.success || !result.data) {
        throw new Error(result.error || "Test non trouvé")
      }

      applyLoadedTest(result.data)
      return result.data
    } catch (error) {
      console.error("Erreur lors du chargement complet du test:", error)
      toast.error("Impossible de préparer le test. Veuillez réessayer.")
      return null
    } finally {
      setLoadingFullTest(false)
    }
  }, [applyLoadedTest, testData, testId])

  const performAuthentication = useCallback(
    async ({ name, email, phone }, { silent = false, skipValidation = false } = {}) => {
      setAuthError("")
      const { cleanedName, cleanedEmail, cleanedPhone, rawPhone } = sanitizeAuthPayload({ name, email, phone })
      const validationError = validateAuthPayload({
        cleanedName,
        cleanedEmail,
        cleanedPhone,
        skipValidation,
      })

      if (validationError === "missing_required_fields") {
        return false
      }

      if (validationError) {
        setAuthError(validationError)
        if (!silent) toast.error(validationError)
        return false
      }

      setLoading(true)

      try {
        const verifyResult = await fetchJsonWithTimeout(`${API_BASE_URL}/api/admin/tests/${testId}/verify-access`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          timeout: 15000,
          retries: 1,
          body: JSON.stringify({
            email: cleanedEmail,
            phone: rawPhone,
          }),
        })

        if (!verifyResult.success || !verifyResult.authorized) {
          const error = verifyResult.error || "❌ Accès non autorisé"
          setAuthError(error)
          if (!silent) toast.error(error)
          return false
        }

        const nextAuthData = buildAuthenticatedCandidate({
          cleanedName,
          cleanedEmail,
          cleanedPhone,
          candidate: verifyResult.candidate,
        })

        setAuthData(nextAuthData)

        if (typeof window !== "undefined") {
          writeStoredJsonValue(storageKeys.auth, nextAuthData)
        }

        setIsAuthenticated(true)
        setShowAuthDialog(false)
        setAuthError("")

        if (!silent) {
          toast.success("✅ Authentification réussie. Vous pouvez commencer le test.")
        }

        return true
      } catch (error) {
        const serverMessage = error instanceof Error ? error.message : ""
        const errorMsg = serverMessage || "Erreur de connexion au serveur. Veuillez réessayer."

        if (silent) {
          removeStoredValues([storageKeys.auth])
          setAuthData((previous) => ({ ...previous, email: "", phone: "" }))
          setAuthError("")
          return false
        }

        if (errorMsg.includes("Test déjà passé")) {
          removeStoredValues([storageKeys.auth])
          writeStoredValue(storageKeys.submitted, "true")
          setTestStarted(false)
          setTestCompleted(true)
          setShowAuthDialog(false)
          setShowSuccessModal(true)
          toast.info("Vous avez déjà soumis ce test. Merci pour votre participation.")
          return false
        }

        if (!isExpectedAuthError(errorMsg)) {
          console.error("Erreur d'authentification:", error)
          toast.error("Impossible de joindre le serveur. Veuillez réessayer.")
        } else {
          toast.info(getFriendlyAuthMessage(errorMsg))
        }

        setAuthError(getFriendlyAuthMessage(errorMsg))
        return false
      } finally {
        setLoading(false)
      }
    },
    [getFriendlyAuthMessage, isExpectedAuthError, storageKeys.auth, storageKeys.submitted, testId],
  )

  const resumeTestFromStorage = useCallback(() => {
    if (!testData || typeof window === "undefined") {
      return
    }

    try {
      if (localStorage.getItem(storageKeys.submitted) === "true") {
        setTestCompleted(true)
        setShowSuccessModal(true)
        toast.info("Vous avez déjà soumis ce test. Merci pour votre participation.")
        return
      }

      const storedAnswers = readStoredJsonValue(storageKeys.answers)
      if (storedAnswers) {
        if (typeof storedAnswers === "object") {
          setAnswers(storedAnswers)
        }
      }

      const storedStartedAt = localStorage.getItem(storageKeys.startedAt)
      const storedSession = resolveStoredTestSession({
        startedAt: storedStartedAt,
        durationInMinutes: testData.duration,
      })
      if (!storedSession) {
        return
      }

      setTimeRemaining(storedSession.remainingSeconds)

      if (!storedSession.expired) {
        setTestStarted(true)
        if (!resuming) {
          toast.info("Reprise de votre session de test.")
        }
      } else {
        setTestStarted(false)
        setTestCompleted(true)
        setShowSuccessModal(true)
      }
    } catch (error) {
      console.warn("Impossible de reprendre l'état du test depuis le stockage local:", error)
    }
  }, [resuming, storageKeys.answers, storageKeys.startedAt, storageKeys.submitted, testData])

  const resumeTestFromServerDraft = useCallback(async () => {
    if (!testData?.id || !authData.email || !authData.phone || testCompleted || testStarted) {
      return
    }

    try {
      const query = new URLSearchParams({
        email: authData.email,
        phone: authData.phone,
      })
      const result = await fetchJsonWithTimeout(`${API_BASE_URL}/api/admin/tests/${testData.id}/session-draft?${query.toString()}`, {
        timeout: 8000,
        retries: 0,
      })
      const draft = result?.data

      if (!draft || draft.status !== "in_progress") {
        return
      }

      if (draft.answers && Object.keys(draft.answers).length > 0) {
        setAnswers(draft.answers)
        writeStoredJsonValue(storageKeys.answers, draft.answers)
      }

      setCurrentQuestion(Number.isInteger(draft.lastQuestion) ? draft.lastQuestion : 0)

      if (draft.remainingTime > 0) {
        setTimeRemaining(draft.remainingTime)
        setTestStarted(true)
        writeStoredValue(storageKeys.startedAt, new Date().toISOString())
        toast.info("Reprise de votre brouillon de test.")
      }
    } catch (error) {
      console.warn("Impossible de reprendre le brouillon serveur:", error)
    }
  }, [authData.email, authData.phone, storageKeys.answers, storageKeys.startedAt, testCompleted, testData?.id, testStarted])

  const submitResults = useCallback(
    async (finalScore) => {
      try {
        const resultData = buildResultPayload({ testData, authData, answers, finalScore })
        const result = await fetchJsonWithTimeout(`${API_BASE_URL}/api/admin/tests/results`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          timeout: 20000,
          retries: 1,
          body: JSON.stringify(resultData),
        })

        if (!result.success) {
          throw new Error(result.error || "Erreur lors de l'enregistrement des résultats")
        }

        await fetchWithTimeout(`${API_BASE_URL}/api/admin/tests/${testData.id}/update-status`, {
          method: "POST",
          timeout: 10000,
          retries: 0,
        })
      } catch (error) {
        console.error("Erreur lors de l'envoi des résultats:", error)
        toast.error("Impossible d'enregistrer les résultats. Vérifiez la connexion au backend.")
        if (typeof window !== "undefined") {
          removeStoredValues([storageKeys.submitted])
        }
      }
    },
    [answers, authData, storageKeys.submitted, testData],
  )

  const confirmSubmitTest = useCallback(
    (autoSubmit = false) => {
      setShowConfirmSubmit(false)
      clearInterval(timerRef.current)
      stopAntiCheat()

      const finalScore = calculateScore(testData, answers)
      setTestStarted(false)
      setTestCompleted(true)

      if (typeof window !== "undefined") {
        writeStoredValue(storageKeys.submitted, "true")
        removeStoredValues([storageKeys.startedAt, storageKeys.answers])
      }

      submitResults(finalScore)
      setShowSuccessModal(true)

      if (autoSubmit) {
        toast.warning("Le temps est écoulé. Votre test a été automatiquement soumis.")
      }
    },
    [answers, storageKeys.answers, storageKeys.startedAt, storageKeys.submitted, stopAntiCheat, submitResults, testData],
  )

  const handleSubmitTest = useCallback(
    (autoSubmit = false) => {
      if (!autoSubmit) {
        setShowConfirmSubmit(true)
        return
      }

      confirmSubmitTest(true)
    },
    [confirmSubmitTest],
  )

  const handleStartTest = useCallback(async () => {
    if (typeof window !== "undefined" && localStorage.getItem(storageKeys.submitted) === "true") {
      toast.error("Vous avez déjà soumis ce test.")
      setTestCompleted(true)
      setShowSuccessModal(true)
      return
    }

    const fullTestData = await ensureFullTestData()
    if (!fullTestData || getQuestionCount(fullTestData) === 0) {
      toast.error("Le contenu du test est indisponible pour le moment.")
      return
    }

    const { isLateStart, remainingMinutes } = getTestStartState(fullTestData)

    setTimeRemaining(remainingMinutes * 60)
    setTestStarted(true)

    if (typeof window !== "undefined") {
      writeStoredValue(storageKeys.startedAt, new Date().toISOString())
    }

    startAntiCheat()

    if (isLateStart) {
      toast.warning(`Attention ! Il vous reste ${remainingMinutes} minute(s) pour terminer le test.`)
    } else {
      toast.success("Le test a commencé. Bonne chance !")
    }
  }, [ensureFullTestData, startAntiCheat, storageKeys.startedAt, storageKeys.submitted])

  const updateAuthField = useCallback((field, value) => {
    setAuthData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const { handleSingleAnswerChange, handleMultipleAnswerChange, handleTextAnswerChange } = useMemo(() => createAnswerHandlers({ currentQuestion, setAnswers }), [currentQuestion])

  const saveServerDraft = useCallback(
    async ({ force = false } = {}) => {
      if (!testStarted || testCompleted || !isAuthenticated || !testData?.id || !authData.email || !authData.phone) {
        return
      }

      const payload = {
        email: authData.email,
        phone: authData.phone,
        name: authData.name,
        answers,
        lastQuestion: currentQuestion,
        remainingTime: timeRemaining,
      }
      const payloadSignature = JSON.stringify({
        answers,
        currentQuestion,
        testId: testData.id,
      })
      const now = Date.now()

      if (!force && payloadSignature === lastServerDraftRef.current) {
        return
      }

      if (!force && now - lastServerDraftAtRef.current < 1500) {
        return
      }

      try {
        await fetchJsonWithTimeout(`${API_BASE_URL}/api/admin/tests/${testData.id}/session-draft`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          timeout: 8000,
          retries: 0,
          body: JSON.stringify(payload),
        })
        lastServerDraftRef.current = payloadSignature
        lastServerDraftAtRef.current = now
      } catch (error) {
        console.warn("Brouillon serveur non sauvegardé:", error)
      }
    },
    [answers, authData.email, authData.name, authData.phone, currentQuestion, isAuthenticated, testCompleted, testData?.id, testStarted, timeRemaining],
  )

  useEffect(() => {
    loadTestMetadata()

    return () => {
      clearInterval(timerRef.current)
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
      stopAntiCheat()
    }
  }, [loadTestMetadata, stopAntiCheat])

  useRestoreStoredAuth({ setAuthData, storageKey: storageKeys.auth })

  useEffect(() => {
    if (!testStarted || timeRemaining <= 0 || testCompleted) {
      return
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmitTest(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [handleSubmitTest, testCompleted, testStarted, timeRemaining])

  useAutoResumeAuthentication({ isAuthenticated, performAuthentication, resumeAttempted, setResumeAttempted, setResuming, storageKey: storageKeys.auth, testAccessStatus, testData })

  useEffect(() => {
    if (isAuthenticated) {
      resumeTestFromStorage()
    }
  }, [isAuthenticated, resumeTestFromStorage])

  useEffect(() => {
    if (isAuthenticated) {
      resumeTestFromServerDraft()
    }
  }, [isAuthenticated, resumeTestFromServerDraft])

  useEffect(() => {
    if (!isAuthenticated || !testStarted) {
      return
    }

    if (Array.isArray(testData?.questions) && testData.questions.length > 0) {
      return
    }

    ensureFullTestData()
  }, [ensureFullTestData, isAuthenticated, testData, testStarted])

  useBeforeUnloadProtection({ testCompleted, testStarted })
  useVisibilityWarning({ testCompleted, testStarted })
  usePersistedAnswers({ answers, storageKey: storageKeys.answers, testStarted })

  useEffect(() => {
    if (!testStarted || testCompleted || !isAuthenticated) {
      return
    }

    if (serverDraftTimerRef.current) {
      clearTimeout(serverDraftTimerRef.current)
    }

    serverDraftTimerRef.current = setTimeout(() => {
      saveServerDraft()
    }, 1200)

    return () => {
      if (serverDraftTimerRef.current) {
        clearTimeout(serverDraftTimerRef.current)
      }
    }
  }, [answers, currentQuestion, isAuthenticated, saveServerDraft, testCompleted, testStarted])

  useEffect(() => {
    if (!testStarted || testCompleted || !isAuthenticated) {
      return
    }

    const intervalId = setInterval(() => {
      saveServerDraft({ force: true })
    }, 90000)

    return () => clearInterval(intervalId)
  }, [isAuthenticated, saveServerDraft, testCompleted, testStarted])

  useEffect(() => {
    if (!testStarted || testCompleted || !isAuthenticated || !authData.email || !testId) {
      return
    }

    if (antiCheatRef.current?.isActive) {
      return
    }

    startAntiCheat()

    return () => {
      stopAntiCheat()
    }
  }, [authData.email, isAuthenticated, startAntiCheat, stopAntiCheat, testCompleted, testId, testStarted])

  const currentQuestionData = testData?.questions?.[currentQuestion]
  const answeredCount = Object.keys(answers).length
  const questionCount = getQuestionCount(testData)
  const progress = questionCount > 0 ? ((currentQuestion + 1) / questionCount) * 100 : 0
  const unansweredCount = questionCount > 0 ? questionCount - answeredCount : 0
  const formattedTimeRemaining = formatTime(timeRemaining)

  return {
    loading,
    testData,
    currentQuestion,
    currentQuestionData,
    answers,
    testStarted,
    testCompleted,
    isAuthenticated,
    showAuthDialog,
    authError,
    testAccessStatus,
    scheduledDateTime,
    countdown,
    showConfirmSubmit,
    showSuccessModal,
    authData,
    resuming,
    loadingFullTest,
    answeredCount,
    progress,
    unansweredCount,
    formattedTimeRemaining,
    setCurrentQuestion,
    setShowAuthDialog,
    setShowConfirmSubmit,
    handleStartTest,
    handleSubmitTest,
    confirmSubmitTest,
    performAuthentication,
    updateAuthField,
    handleSingleAnswerChange,
    handleMultipleAnswerChange,
    handleTextAnswerChange,
  }
}
