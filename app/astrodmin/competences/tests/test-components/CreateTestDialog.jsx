import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FORMATION_OPTIONS } from "../constants"
import { 
  Plus, 
  Trash, 
  Save, 
  FileUp, 
  Upload, 
  X,
  Image as ImageIcon,
  Circle,
  CheckCircle2
} from "lucide-react"
import { getQuestionValidationRequirements } from "../helpers"

function parseNumberInput(value, fallback) {
  if (value === "") {
    return fallback
  }

  const parsedValue = Number.parseInt(value, 10)
  return Number.isNaN(parsedValue) ? fallback : parsedValue
}

export function CreateTestDialog({
  open,
  onOpenChange,
  editingTest,
  newTest,
  setNewTest,
  currentQuestion,
  setCurrentQuestion,
  editingQuestionIndex,
  handleCancelEditQuestion,
  handleAddQuestion,
  handleEditQuestion,
  handleDeleteQuestion,
  handleImageUpload,
  handleRemoveImage,
  handleCreateTest,
  setShowImportQuestionsDialog,
}) {
  const questionValidationRequirements = getQuestionValidationRequirements(currentQuestion)
  const questionValidationError = questionValidationRequirements.find((requirement) => !requirement.valid)?.message ?? null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-5xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle>{editingTest ? "Modifier le test" : "Créer un nouveau test"}</DialogTitle>
          <DialogDescription>Remplissez les informations et ajoutez des questions à votre test.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-4">
          {/* Section Informations de base */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Configuration du test</CardTitle>
                <CardDescription>Paramètres généraux et référentiel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center gap-1">
                    Titre du test <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={newTest.title}
                    onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                    placeholder="Ex: Évaluation JavaScript Avancé"
                    className="focus-visible:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="referentiel">Référentiel *</Label>
                    <Select
                      value={newTest.referentiel}
                      onValueChange={(value) => setNewTest({ ...newTest, referentiel: value })}
                    >
                      <SelectTrigger id="referentiel">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {FORMATION_OPTIONS.map((formation) => (
                          <SelectItem key={formation.value} value={formation.value}>
                            {formation.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Durée (minutes) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newTest.duration}
                      onChange={(e) => setNewTest({ ...newTest, duration: parseNumberInput(e.target.value, 60) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduledDate">Date *</Label>
                    <Input
                      id="scheduledDate"
                      type="date"
                      value={newTest.scheduledDate}
                      onChange={(e) => setNewTest({ ...newTest, scheduledDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduledTime">Heure *</Label>
                    <Input
                      id="scheduledTime"
                      type="time"
                      value={newTest.scheduledTime}
                      onChange={(e) => setNewTest({ ...newTest, scheduledTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passingScore">Score de passage (%)</Label>
                    <Input
                      id="passingScore"
                      type="number"
                      value={newTest.passingScore}
                      onChange={(e) => setNewTest({ ...newTest, passingScore: parseNumberInput(e.target.value, 70) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optionnel)</Label>
                  <Textarea
                    id="description"
                    value={newTest.description}
                    onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                    placeholder="Instructions pour les candidats..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card data-question-form>
              <CardHeader className="pb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {editingQuestionIndex !== null ? "Modifier la question" : "Ajouter une question"}
                  </CardTitle>
                  <CardDescription>Créez vos questions une par une ou importez-les</CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowImportQuestionsDialog(true)}>
                  <FileUp className="mr-2 h-4 w-4" />
                  Importer CSV
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="q-text">Libellé de la question *</Label>
                  <Textarea
                    id="q-text"
                    value={currentQuestion.question}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                    placeholder="Votre question ici..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="q-type">Type de réponse</Label>
                    <Select
                      value={currentQuestion.type}
                      onValueChange={(value) => {
                        const updated = { ...currentQuestion, type: value }
                        if (value === "qcm_simple") {
                          updated.correctAnswer = null
                          updated.correctAnswers = []
                        } else if (value === "qcm_multiple") {
                          updated.correctAnswers = []
                          updated.correctAnswer = null
                        }
                        setCurrentQuestion(updated)
                      }}
                    >
                      <SelectTrigger id="q-type">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="qcm_simple">QCM (Choix Simple)</SelectItem>
                        <SelectItem value="qcm_multiple">QCM (Choix Multiple)</SelectItem>
                        <SelectItem value="texte_libre">Réponse libre (Texte)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="q-score">Points</Label>
                    <Input
                      id="q-score"
                      type="number"
                      value={currentQuestion.score}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, score: parseNumberInput(e.target.value, 5) })}
                    />
                  </div>
                </div>

                {/* Ajout d'image */}
                <div className="space-y-2">
                  <Label>Image de la question (optionnel)</Label>
                  <div className="flex flex-col gap-3">
                    {currentQuestion.image ? (
                      <div className="relative w-full max-w-xs group">
                        <img
                          src={currentQuestion.image || "/placeholder.svg"}
                          alt="Aperçu"
                          className="w-full h-auto rounded-lg border shadow-sm transition-transform group-hover:scale-[1.02]"
                        />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors"
                          >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="file"
                          id="image-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                        <label
                          htmlFor="image-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Cliquez pour ajouter une image</span>
                            </p>
                            <p className="text-xs text-gray-400">PNG, JPG ou GIF (max. 5MB)</p>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {currentQuestion.type !== "texte_libre" && (
                  <div className="space-y-3 pt-2">
                    <Label>Options et bonne(s) réponse(s)</Label>
                    {currentQuestion.options.map((option, idx) => (
                      <div key={idx} className="flex items-center gap-3 group">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-bold">
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...currentQuestion.options]
                            newOptions[idx] = e.target.value
                            setCurrentQuestion({ ...currentQuestion, options: newOptions })
                          }}
                          placeholder={`Option ${idx + 1}`}
                          className="flex-1"
                        />
                        {currentQuestion.type === "qcm_simple" ? (
                          <button
                            type="button"
                            className={`flex-shrink-0 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                              currentQuestion.correctAnswer === idx
                                ? "border-green-300 bg-green-50 text-green-700"
                                : "border-gray-200 bg-white text-gray-500 hover:border-green-200 hover:bg-green-50"
                            }`}
                            onClick={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: idx })}
                          >
                            {currentQuestion.correctAnswer === idx ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <Circle className="h-4 w-4" />
                            )}
                            Bonne réponse
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={`flex-shrink-0 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                              currentQuestion.correctAnswers.includes(idx)
                                ? "border-green-300 bg-green-50 text-green-700"
                                : "border-gray-200 bg-white text-gray-500 hover:border-green-200 hover:bg-green-50"
                            }`}
                            onClick={() => {
                              const newCorrects = currentQuestion.correctAnswers.includes(idx)
                                ? currentQuestion.correctAnswers.filter((i) => i !== idx)
                                : [...currentQuestion.correctAnswers, idx]
                              setCurrentQuestion({ ...currentQuestion, correctAnswers: newCorrects })
                            }}
                          >
                            {currentQuestion.correctAnswers.includes(idx) ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <Circle className="h-4 w-4" />
                            )}
                            Réponse correcte
                          </button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() =>
                        setCurrentQuestion({ ...currentQuestion, options: [...currentQuestion.options, ""] })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" /> Ajouter une option
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Pour un QCM, sélectionnez clairement la ou les bonnes réponses avant d'ajouter la question.
                    </p>
                    <div className="space-y-1 rounded-md border border-dashed border-gray-200 bg-gray-50 p-3 text-xs">
                      {questionValidationRequirements.map((requirement) => (
                        <p
                          key={requirement.key}
                          className={requirement.valid ? "text-green-700" : "text-red-600"}
                        >
                          {requirement.valid ? "OK" : "A faire"} - {requirement.message}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button type="button" onClick={handleAddQuestion} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    {editingQuestionIndex !== null ? "Mettre à jour" : "Ajouter la question"}
                  </Button>
                  {editingQuestionIndex !== null && (
                    <Button type="button" variant="ghost" onClick={handleCancelEditQuestion}>
                      Annuler
                    </Button>
                  )}
                </div>
                {questionValidationError && (
                  <p className="text-sm font-medium text-red-600">
                    Validation en attente: {questionValidationError}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Section Liste des Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold flex items-center gap-2">
                Questions ajoutées
                <Badge variant="secondary" className="rounded-full">
                  {newTest.questions.length}
                </Badge>
              </h3>
              <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Total : {newTest.questions.reduce((sum, q) => sum + (q.score || 0), 0)} pts
              </div>
            </div>

            <div className="space-y-4 max-h-[1200px] pr-2 overflow-y-visible">
              {newTest.questions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50 border-2 border-dashed rounded-xl text-muted-foreground">
                  <Plus className="h-12 w-12 mb-4 opacity-20" />
                  <p>Aucune question n'a encore été ajoutée.</p>
                  <p className="text-sm">Commencez par en créer une à gauche.</p>
                </div>
              ) : (
                newTest.questions.map((q, idx) => (
                  <Card key={idx} className="overflow-hidden border-l-4 border-l-blue-500">
                    <CardHeader className="p-4 flex flex-row items-start justify-between bg-gray-50/50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                            Type : {q.type === "qcm_simple" ? "Simple" : q.type === "qcm_multiple" ? "Multiple" : "Libre"}
                          </Badge>
                          <Badge className="bg-blue-600">{q.score} pts</Badge>
                          {q.image && (
                            <Badge variant="outline" className="bg-white border-blue-200 text-blue-700">
                              <ImageIcon className="h-3 w-3 mr-1" /> Image
                            </Badge>
                          )}
                        </div>
                        <p className="font-semibold text-sm leading-tight line-clamp-2">
                          {idx + 1}. {q.question}
                        </p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                          onClick={() => handleEditQuestion(idx)}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:bg-red-50"
                          onClick={() => handleDeleteQuestion(idx)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    {q.type !== "texte_libre" && (
                      <CardContent className="p-4 pt-2">
                        <div className="grid grid-cols-1 gap-1">
                          {q.options.map((opt, oIdx) => {
                            const isCorrect =
                              q.type === "qcm_simple" ? q.correctAnswer === oIdx : q.correctAnswers?.includes(oIdx)
                            return (
                              <div
                                key={oIdx}
                                className={`text-xs p-2 rounded border flex items-center justify-between ${
                                  isCorrect ? "bg-green-50 border-green-200 text-green-800" : "bg-white border-gray-100"
                                }`}
                              >
                                <span className="truncate">{opt}</span>
                                {isCorrect && <Save className="h-3 w-3 fill-current" />}
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-8 pt-4 border-t gap-3">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="button" onClick={handleCreateTest} className="px-10 bg-blue-600 hover:bg-blue-700 shadow-lg font-bold">
            {editingTest ? "Mettre à jour le test" : "Finaliser et créer le test"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
