import { FORMATION_OPTIONS } from "./constants.js"

export const createInitialGroup = () => ({
  name: "",
  formation: "",
  test_id: "",
  test_date: "",
  test_time: "",
  duration: 60,
  location: "",
  instructions: "",
})

export const createInitialInvitationDetails = () => ({
  test_id: "",
  test_date: "",
  test_time: "",
  duration: 60,
  location: "En ligne",
  instructions: "",
})

export const createInitialTest = () => ({
  title: "",
  referentiel: "",
  duration: 60,
  scheduledDate: "",
  scheduledTime: "",
  totalQuestions: 0,
  passingScore: 70,
  candidatesGroup: "",
  description: "",
  questions: [],
})

export const createInitialQuestion = () => ({
  question: "",
  type: "qcm_simple",
  options: ["", "", "", ""],
  correctAnswer: null,
  correctAnswers: [],
  score: 5,
  image: null,
  imageFile: null,
})

export const validateQuestionBeforeSave = (question) => {
  const requirements = getQuestionValidationRequirements(question)
  const failedRequirement = requirements.find((requirement) => !requirement.valid)
  return failedRequirement ? failedRequirement.message : null
}

export const getQuestionValidationRequirements = (question) => {
  const requirements = [
    {
      key: "question",
      valid: question.question.trim() !== "",
      message: "Veuillez saisir la question",
    },
  ]

  if (question.type === "texte_libre") {
    return requirements
  }

  const filledOptions = question.options.filter((option) => option.trim() !== "")

  requirements.push({
    key: "options",
    valid: filledOptions.length >= 2,
    message: "Veuillez saisir au moins 2 options de réponse",
  })

  if (question.type === "qcm_simple") {
    requirements.push({
      key: "correct-answer",
      valid: question.correctAnswer !== null,
      message: "Veuillez sélectionner la bonne réponse",
    })
  }

  if (question.type === "qcm_multiple") {
    requirements.push({
      key: "correct-answers",
      valid: question.correctAnswers.length > 0,
      message: "Veuillez sélectionner au moins une bonne réponse",
    })
  }

  return requirements
}

export const buildQuestionPayload = (question, questionIndex) => ({
  id: `q${questionIndex + 1}`,
  ...question,
  options: question.type === "texte_libre" ? [] : question.options.filter((option) => option.trim() !== ""),
})

export const buildQuestionEditorState = (question) => ({
  question: question.question || "",
  type: question.type || "qcm_simple",
  options: question.options ? [...question.options] : ["", "", "", ""],
  correctAnswer: question.correctAnswer !== undefined ? question.correctAnswer : null,
  correctAnswers: question.correctAnswers ? [...question.correctAnswers] : [],
  score: question.score || 5,
  image: question.image || null,
  imageFile: question.imageFile || null,
})

export const parseQuestionsCsv = (content, existingQuestionCount) => {
  const lines = content.split("\n").slice(1)
  const importedQuestions = []

  lines.forEach((line) => {
    if (!line.trim()) return

    const parts = line.split(";").map((part) => part.trim())
    if (parts.length < 6) return

    const question = {
      id: `q${existingQuestionCount + importedQuestions.length + 1}`,
      question: parts[0],
      type: parts[1] || "qcm_simple",
      options: [parts[2], parts[3], parts[4], parts[5]].filter((option) => option && option !== ""),
      score: Number.parseInt(parts[7]) || 5,
    }

    if (parts[1] === "qcm_simple") {
      question.correctAnswer = Number.parseInt(parts[6])
      question.correctAnswers = []
    } else if (parts[1] === "qcm_multiple") {
      question.correctAnswer = null
      question.correctAnswers =
        parts[6] && parts[6].trim() !== ""
          ? parts[6]
              .split(",")
              .map((value) => Number.parseInt(value.trim()))
              .filter((value) => !Number.isNaN(value))
          : []
    } else {
      question.correctAnswer = null
      question.correctAnswers = []
    }

    importedQuestions.push(question)
  })

  return importedQuestions
}

export const parseImportedResultsCsv = (content) => {
  return content
    .split("\n")
    .slice(1)
    .reduce((results, line) => {
      if (!line.trim()) return results

      const parts = line.split(",").map((part) => part.trim())
      if (parts.length < 7) return results

      results.push({
        id: `result_imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        testId: parts[3],
        testTitle: "Test importé",
        candidate: {
          name: parts[0],
          email: parts[1],
          phone: parts[2],
        },
        score: Number.parseInt(parts[4]),
        status: parts[5].toLowerCase(),
        referentiel: "Import manuel",
        completedAt: parts[6],
        submittedDate: new Date(parts[6]).toLocaleDateString("fr-FR"),
        submittedTime: new Date(parts[6]).toLocaleTimeString("fr-FR"),
      })

      return results
    }, [])
}

export const calculateResultScorePercentage = (selectedResult, testsData, manualGrades) => {
  if (!selectedResult || !selectedResult.answers) return selectedResult?.score || 0

  let totalScore = 0
  let totalPossible = 0
  const test = testsData.find((item) => item.id === selectedResult.testId)

  if (test?.questions) {
    test.questions.forEach((question, index) => {
      totalPossible += question.score

      if (question.type === "texte_libre") {
        totalScore += manualGrades[`q${index}`] || 0
        return
      }

      const answer = selectedResult.answers[index]
      if (question.type === "qcm_simple" && answer === question.correctAnswer) {
        totalScore += question.score
      }

      if (question.type === "qcm_multiple") {
        const correctAnswers = (question.correctAnswers || []).slice().sort().join(",")
        const userAnswers = (answer || []).slice().sort().join(",")
        if (correctAnswers === userAnswers) {
          totalScore += question.score
        }
      }
    })
  }

  return totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0
}

export const calculateResultPoints = (result, testsData) => {
  if (result?.points) return result.points
  if (!result || !result.answers) {
    const test = testsData.find((item) => item.id === result?.testId)
    if (test?.questions) {
      const total = test.questions.reduce((sum, question) => sum + (question.score || 0), 0)
      const obtained = Math.round(((result?.score || 0) * total) / 100)
      return { obtained, total }
    }

    return { obtained: 0, total: 0 }
  }

  let obtained = 0
  let total = 0
  const test = testsData.find((item) => item.id === result.testId)

  if (test?.questions) {
    test.questions.forEach((question, index) => {
      total += question.score || 0

      if (question.type === "texte_libre") {
        const manualGrade = result.manualGrades?.[`q${index}`] || result.manualGrades?.[index]
        obtained += manualGrade || 0
        return
      }

      const answer = result.answers[index]
      if (question.type === "qcm_simple" && answer === question.correctAnswer) {
        obtained += question.score || 0
      }

      if (question.type === "qcm_multiple") {
        const correctAnswers = (question.correctAnswers || []).slice().sort().join(",")
        const userAnswers = (answer || []).slice().sort().join(",")
        if (correctAnswers === userAnswers) {
          obtained += question.score || 0
        }
      }
    })
  }

  return { obtained: Math.round(obtained), total }
}

export const isSelectedStatus = (status) => status === "selected" || status === "admis"
export const isNotSelectedStatus = (status) => status === "not_selected" || status === "rejeté"
export const isPendingStatus = (status) =>
  status === "pending" || status === "en_attente" || (!isSelectedStatus(status) && !isNotSelectedStatus(status))

export const buildGroupedResults = (filteredResults, testsData, testGroups) => {
  const grouped = {}

  filteredResults.forEach((result) => {
    const formation = normalizeFormationName(result.referentiel) || "Non spécifié"

    if (!grouped[formation]) {
      grouped[formation] = {
        formation,
        totalResults: 0,
        admis: 0,
        rejected: 0,
        pending: 0,
        groups: {},
      }
    }

    grouped[formation].totalResults++

    if (result.status === "admis") grouped[formation].admis++
    else if (result.status === "rejeté") grouped[formation].rejected++
    else grouped[formation].pending++

    const test = testsData.find((item) => item.id === result.testId)
    const groupId = test?.candidatesGroup || "Aucun groupe"
    const group = testGroups.find((item) => item.id === groupId)
    const groupName = group?.name || groupId

    if (!grouped[formation].groups[groupName]) {
      grouped[formation].groups[groupName] = {
        groupName,
        groupId,
        results: [],
        admis: 0,
        rejected: 0,
        pending: 0,
      }
    }

    grouped[formation].groups[groupName].results.push(result)

    if (result.status === "admis") grouped[formation].groups[groupName].admis++
    else if (result.status === "rejeté") grouped[formation].groups[groupName].rejected++
    else grouped[formation].groups[groupName].pending++
  })

  return Object.values(grouped)
}

export const buildAdminStats = (testsData, testResults, statistics) => ({
  totalTests: testsData.length,
  activeTests: testsData.filter((test) => test.status === "active").length,
  completedTests: testsData.filter((test) => test.status === "completed").length,
  totalCandidates: statistics?.total ?? 0,
  selectedCandidates: statistics?.admis ?? 0,
  averageScore: Math.round(statistics?.average_score || 0),
  passRate: Math.round(statistics?.pass_rate || 0),
})

export const buildScoreDistributionData = (statistics) => statistics?.score_distribution ??
  [0, 20, 40, 60, 80].map((lower) => ({ range: `${lower}-${lower + 20}`, count: 0 }))

export const buildStatusDistributionData = (statistics) => [
  { name: "Passe en entretien", value: statistics?.admis ?? 0, color: "#10B981" },
  { name: "Rejetés", value: statistics?.rejetes ?? 0, color: "#EF4444" },
  { name: "En attente", value: statistics?.pending ?? 0, color: "#F59E0B" },
]

export const getTestUrl = (testId) => {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/test/${testId}`
  }

  return `/test/${testId}`
}

export const normalizeFormationName = (name) => {
  if (!name) return ""

  const normalizedName = normalizeFormationToken(name)
  const formation = FORMATION_OPTIONS.find((option) => {
    const values = [option.value, option.label, ...(option.aliases || [])]
    return values.some((value) => normalizeFormationToken(value) === normalizedName)
  })

  if (formation) return formation.value
  if (normalizedName.includes("dev") && (normalizedName.includes("web") || normalizedName.includes("mobile"))) return "Dev Web"
  if (normalizedName.includes("data")) return "Data"
  if (normalizedName.includes("hack")) return "Hackeuse"
  if (normalizedName.includes("aws") || normalizedName.includes("cloud")) return "AWS"
  if (normalizedName.includes("referent") || normalizedName.includes("digital")) return "Référent Digital"
  if (normalizedName.includes("cyber")) return "Cyber security"
  if (normalizedName.includes("intel") || normalizedName === "ia") return "Intelligence Artificielle"

  return name
}

export const normalizeFormationToken = (name) =>
  String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
