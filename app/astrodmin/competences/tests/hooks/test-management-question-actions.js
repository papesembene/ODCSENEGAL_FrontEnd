import { toast } from "sonner"
import {
  buildQuestionEditorState,
  buildQuestionPayload,
  createInitialQuestion,
  parseQuestionsCsv,
  validateQuestionBeforeSave,
} from "../helpers"

export function createQuestionHandlers({
  currentQuestion,
  editingQuestionIndex,
  newTest,
  setCurrentQuestion,
  setEditingQuestionIndex,
  setNewTest,
  setShowImportQuestionsDialog,
}) {
  const handleAddQuestion = () => {
    const validationError = validateQuestionBeforeSave(currentQuestion)
    if (validationError) {
      toast.error(validationError)
      return
    }

    const questionData = buildQuestionPayload(
      currentQuestion,
      editingQuestionIndex !== null ? editingQuestionIndex : newTest.questions.length,
    )

    if (editingQuestionIndex !== null) {
      setNewTest((prev) => {
        const updatedQuestions = [...prev.questions]
        updatedQuestions[editingQuestionIndex] = questionData
        return { ...prev, questions: updatedQuestions }
      })
      setEditingQuestionIndex(null)
      toast.success("Question modifiée")
    } else {
      setNewTest((prev) => ({
        ...prev,
        questions: [...prev.questions, questionData],
      }))
      toast.success("Question ajoutée")
    }

    setCurrentQuestion(createInitialQuestion())
  }

  const handleEditQuestion = (index) => {
    const questionToEdit = newTest.questions[index]
    setCurrentQuestion(buildQuestionEditorState(questionToEdit))
    setEditingQuestionIndex(index)

    setTimeout(() => {
      const questionFormCard = document.querySelector("[data-question-form]")
      if (questionFormCard) {
        questionFormCard.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 100)
  }

  const handleDeleteQuestion = (index) => {
    setNewTest((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, currentIndex) => currentIndex !== index),
    }))
    toast.success("Question supprimée")
  }

  const handleCancelEditQuestion = () => {
    setCurrentQuestion(createInitialQuestion())
    setEditingQuestionIndex(null)
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image valide")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5MB")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setCurrentQuestion((prev) => ({
        ...prev,
        image: reader.result,
        imageFile: file,
      }))
      toast.success("Image ajoutée")
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setCurrentQuestion((prev) => ({
      ...prev,
      image: null,
      imageFile: null,
    }))
    toast.success("Image supprimée")
  }

  const handleImportQuestionsFromExcel = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (loadEvent) => {
      try {
        const importedQuestions = parseQuestionsCsv(loadEvent.target.result, newTest.questions.length)
        setNewTest((prev) => ({
          ...prev,
          questions: [...prev.questions, ...importedQuestions],
        }))
        toast.success(`${importedQuestions.length} question(s) importée(s)`)
        setShowImportQuestionsDialog(false)
      } catch (error) {
        console.error("Erreur d'import:", error)
        toast.error("Erreur lors de l'import du fichier")
      }
    }

    if (file.name.endsWith(".csv")) {
      reader.readAsText(file, "UTF-8")
    } else {
      toast.error("Veuillez sélectionner un fichier CSV")
    }
  }

  return {
    handleAddQuestion,
    handleCancelEditQuestion,
    handleDeleteQuestion,
    handleEditQuestion,
    handleImageUpload,
    handleImportQuestionsFromExcel,
    handleRemoveImage,
  }
}
