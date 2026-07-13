export function createAnswerHandlers({ currentQuestion, setAnswers }) {
  const updateCurrentQuestionAnswer = (value) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: value,
    }))
  }

  return {
    handleSingleAnswerChange: (value) => {
      updateCurrentQuestionAnswer(value)
    },
    handleMultipleAnswerChange: (optionIndex, checked) => {
      setAnswers((prev) => {
        const currentAnswers = prev[currentQuestion] || []
        const nextAnswers = checked
          ? [...currentAnswers, optionIndex]
          : currentAnswers.filter((index) => index !== optionIndex)

        return {
          ...prev,
          [currentQuestion]: nextAnswers,
        }
      })
    },
    handleTextAnswerChange: (value) => {
      updateCurrentQuestionAnswer(value)
    },
  }
}
