import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"
import { API_BASE_URL } from "../constants"
import { toast } from "sonner"

export function ResultDetailsDialog({
  open,
  onOpenChange,
  selectedResult,
  testsData,
  manualGrades,
  handleSaveManualGrade,
  calculateTotalScore,
  fetchResults,
}) {
  if (!selectedResult) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails du résultat - {selectedResult.candidate?.name || selectedResult.candidateName}</DialogTitle>
          <DialogDescription>
            Analyse détaillée des réponses du candidat et notation manuelle.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Card>
            <CardHeader className="pb-3 px-4">
              <h3 className="font-semibold text-lg">Informations candidat</h3>
            </CardHeader>
            <CardContent className="px-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Nom :</span>
                  <p className="font-medium">{selectedResult.candidate?.name || selectedResult.candidateName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email :</span>
                  <p className="font-medium">{selectedResult.candidate?.email || selectedResult.candidateEmail}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Téléphone :</span>
                  <p className="font-medium">{selectedResult.candidate?.phone || selectedResult.candidatePhone}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Référentiel :</span>
                  <Badge variant="outline">{selectedResult.referentiel}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Score actuel :</span>
                  <p className="font-bold text-lg">{calculateTotalScore()}%</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Date de soumission :</span>
                  <p className="font-medium">
                    {selectedResult.submittedDate ||
                      new Date(selectedResult.completedAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Réponses aux questions</h3>
            {(() => {
              const test = testsData.find((t) => t.id === selectedResult.testId)
              if (!test || !test.questions) {
                return (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Impossible de charger les questions du test.</AlertDescription>
                  </Alert>
                )
              }

              return test.questions.map((question, idx) => {
                const answer = selectedResult.answers?.[idx]
                const isCorrect =
                  question.type === "qcm_simple"
                    ? answer === question.correctAnswer
                    : question.type === "qcm_multiple"
                      ? JSON.stringify((answer || []).sort()) === JSON.stringify(question.correctAnswers.sort())
                      : null

                return (
                  <Card
                    key={idx}
                    className={
                      question.type !== "texte_libre"
                        ? isCorrect
                          ? "border-green-200 bg-green-50/50 dark:bg-green-900/10"
                          : "border-red-200 bg-red-50/50 dark:bg-red-900/10"
                        : ""
                    }
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline">Question {idx + 1}</Badge>
                            <Badge>
                              {question.type === "qcm_simple"
                                ? "QCM Simple"
                                : question.type === "qcm_multiple"
                                  ? "QCM Multiple"
                                  : "Texte libre"}
                            </Badge>
                            <Badge variant="secondary">{question.score} pts</Badge>
                            {question.image && (
                              <Badge variant="outline" className="bg-blue-50">
                                📷 Image
                              </Badge>
                            )}
                          </div>
                          <p className="font-medium">{question.question}</p>
                          {question.image && (
                            <img
                              src={question.image || "/placeholder.svg"}
                              alt="Question"
                              className="mt-2 max-h-32 rounded border"
                            />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {question.type === "texte_libre" ? (
                        <div className="space-y-2">
                          <Label>Réponse du candidat :</Label>
                          <div className="p-3 bg-white dark:bg-gray-950 border rounded">
                            <p className="whitespace-pre-wrap">{answer || "(Aucune réponse)"}</p>
                          </div>

                          <div className="flex items-center space-x-2 pt-2">
                            <Label htmlFor={`grade-${idx}`}>Note manuelle (/{question.score}) :</Label>
                            <Input
                              id={`grade-${idx}`}
                              type="number"
                              min="0"
                              max={question.score}
                              step="0.5"
                              value={manualGrades[`q${idx}`] || 0}
                              onChange={(e) => handleSaveManualGrade(`q${idx}`, e.target.value)}
                              className="w-24"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label>Options :</Label>
                          {question.options.map((opt, optIdx) => {
                            const isUserAnswer =
                              question.type === "qcm_simple" ? answer === optIdx : (answer || []).includes(optIdx)
                            const isCorrectAnswer =
                              question.type === "qcm_simple"
                                ? question.correctAnswer === optIdx
                                : question.correctAnswers.includes(optIdx)

                            return (
                              <div
                                key={optIdx}
                                className={`p-2 border rounded flex items-center space-x-2 ${
                                  isCorrectAnswer
                                    ? "bg-green-50 border-green-200 dark:bg-green-900/10"
                                    : isUserAnswer
                                      ? "bg-red-50 border-red-200 dark:bg-red-900/10"
                                      : ""
                                }`}
                              >
                                {isUserAnswer && <span className="text-blue-600">👉</span>}
                                {isCorrectAnswer && <CheckCircle className="h-4 w-4 text-green-600" />}
                                <span>{opt}</span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })
            })()}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          <Button
            onClick={async () => {
              const finalScore = calculateTotalScore()
              const test = testsData.find((t) => t.id === selectedResult.testId)
              const passingScore = test?.passingScore || 70
              const newStatus = finalScore >= passingScore ? "admis" : "rejeté"

              try {
                const response = await fetch(`${API_BASE_URL}/api/admin/tests/results/${selectedResult.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    score: finalScore,
                    status: newStatus,
                    manualGrades: manualGrades,
                  }),
                })

                const result = await response.json()

                if (result.success) {
                  toast.success(`Score final : ${finalScore}% - Statut : ${newStatus}`)
                  await fetchResults()
                  onOpenChange(false)
                } else {
                  toast.error("Erreur lors de la sauvegarde du score final")
                }
              } catch (error) {
                toast.error("Impossible de sauvegarder le score. Vérifiez la connexion au backend.")
              }
            }}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Valider les notes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
