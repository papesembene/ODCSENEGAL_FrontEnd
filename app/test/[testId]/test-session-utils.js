export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export function createStorageKeys(testId) {
  return {
    answers: `test::${testId}::answers`,
    startedAt: `test::${testId}::startedAt`,
    auth: `test::${testId}::auth`,
    submitted: `test::${testId}::submitted`,
  }
}

export function getQuestionCount(testData) {
  if (!testData) {
    return 0
  }

  if (typeof testData.totalQuestions === "number") {
    return testData.totalQuestions
  }

  return testData.questions?.length || 0
}

export function calculateCountdownLabel(targetDateTime) {
  const diff = targetDateTime.getTime() - Date.now()

  if (diff <= 0) {
    return ""
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  let countdownText = ""
  if (days > 0) countdownText += `${days}j `
  if (hours > 0 || days > 0) countdownText += `${hours}h `
  countdownText += `${minutes}min ${seconds}s`

  return countdownText
}

export function calculateScore(testData, answers) {
  let totalScore = 0
  let maxScore = 0

  testData.questions.forEach((question, index) => {
    maxScore += question.score

    if (question.type === "qcm_multiple") {
      const userAnswers = answers[index] || []
      const correctAnswers = question.correctAnswers || []
      const isCorrect =
        correctAnswers.length === userAnswers.length &&
        correctAnswers.every((answer) => userAnswers.includes(answer))

      if (isCorrect) {
        totalScore += question.score
      }
      return
    }

    if (question.type === "texte_libre") {
      if (answers[index] && answers[index].trim() !== "") {
        totalScore += question.score
      }
      return
    }

    if (answers[index] === question.correctAnswer) {
      totalScore += question.score
    }
  })

  return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
}

export function buildResultPayload({ testData, authData, answers, finalScore }) {
  const now = new Date()

  return {
    id: `result_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    testId: testData.id,
    testTitle: testData.title,
    referentiel: testData.referentiel,
    candidate: {
      name: authData.name,
      email: authData.email,
      phone: authData.phone?.replace(/\s/g, ""),
    },
    score: finalScore,
    status: finalScore >= testData.passingScore ? "admis" : "rejeté",
    totalQuestions: testData.questions.length,
    answeredQuestions: Object.keys(answers).length,
    answers,
    completedAt: now.toISOString(),
    submittedDate: now.toLocaleDateString("fr-FR"),
    submittedTime: now.toLocaleTimeString("fr-FR"),
  }
}

export function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return `${minutes}:${secs.toString().padStart(2, "0")}`
}
