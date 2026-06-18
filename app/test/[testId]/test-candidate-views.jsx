"use client"

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
  RefreshCw,
} from "lucide-react"

export function TestLoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-orange-500"></div>
    </div>
  )
}

export function TestNotFoundState({ onBackHome }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
            Test non trouvé
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm sm:text-base">Le test demandé n&apos;existe pas ou n&apos;est plus disponible.</p>
          <Button className="mt-4 h-12 w-full touch-manipulation text-sm sm:h-10 sm:text-base" onClick={onBackHome}>
            Retour à l&apos;accueil
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function StatusCard({ icon, title, description, children, cardClassName = "max-w-md" }) {
  const Icon = icon

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className={`w-full ${cardClassName}`}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20 sm:h-20 sm:w-20">
            <Icon className="h-8 w-8 sm:h-10 sm:w-10" />
          </div>
          <CardTitle className="text-xl sm:text-2xl">{title}</CardTitle>
          <CardDescription className="mt-2 text-sm sm:text-base">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">{children}</CardContent>
      </Card>
    </div>
  )
}

export function TestTooEarlyState({ scheduledDateTime, countdown, testData, onReload }) {
  return (
    <StatusCard
      icon={Clock}
      title="Test pas encore disponible"
      description={
        <>
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
        </>
      }
      cardClassName="max-w-2xl"
    >
      <div className="text-center">
        <p className="mb-2 text-xs text-muted-foreground sm:text-sm">Temps restant avant l&apos;ouverture du test :</p>
        <div className="font-mono text-2xl font-bold text-orange-600 sm:text-4xl">{countdown}</div>
      </div>

      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
        <AlertCircle className="h-4 w-4 flex-shrink-0 text-blue-600" />
        <AlertDescription className="text-xs sm:text-sm">
          <strong className="text-sm text-blue-900 dark:text-blue-100 sm:text-base">Informations sur le test</strong>
          <div className="mt-2 space-y-1">
            <p><strong>Test :</strong> {testData.title}</p>
            <p><strong>Référentiel :</strong> {testData.referentiel}</p>
            <p><strong>Durée :</strong> {testData.duration} minutes</p>
            <p><strong>Nombre de questions :</strong> {testData.questions?.length || 0}</p>
          </div>
        </AlertDescription>
      </Alert>

      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:bg-orange-900/20">
        <h4 className="mb-2 text-sm font-semibold text-orange-900 dark:text-orange-100 sm:text-base">📋 Préparez-vous !</h4>
        <ul className="space-y-1 text-xs text-orange-800 dark:text-orange-200 sm:text-sm">
          <li>✓ Vérifiez votre connexion internet</li>
          <li>✓ Assurez-vous d&apos;avoir {testData.duration} minutes disponibles</li>
          <li>✓ Préparez vos informations (nom, email, téléphone)</li>
          <li>✓ Cette page se mettra à jour automatiquement</li>
        </ul>
      </div>

      <Button variant="outline" className="h-12 w-full touch-manipulation text-sm sm:h-10 sm:text-base" onClick={onReload}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Actualiser la page
      </Button>
    </StatusCard>
  )
}

export function TestExpiredState({ scheduledDateTime, testData }) {
  return (
    <StatusCard
      icon={XCircle}
      title={<span className="text-red-600">Test expiré</span>}
      description="Le créneau horaire pour passer ce test est terminé."
    >
      <p className="text-xs text-muted-foreground sm:text-sm">
        Ce test était disponible jusqu&apos;au{" "}
        {scheduledDateTime && new Date(scheduledDateTime.getTime() + testData.duration * 60000).toLocaleString("fr-FR")}
      </p>
      <Alert>
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <AlertDescription className="text-xs sm:text-sm">
          Veuillez contacter l&apos;administration pour plus d&apos;informations.
        </AlertDescription>
      </Alert>
    </StatusCard>
  )
}

export function TestInactiveState() {
  return (
    <StatusCard
      icon={Lock}
      title="Test non actif"
      description="Ce test n'est pas actif pour le moment."
    >
      <p className="mb-4 text-xs text-muted-foreground sm:text-sm">
        Veuillez contacter l&apos;administration pour plus d&apos;informations.
      </p>
    </StatusCard>
  )
}

export function TestAuthDialog({
  open,
  authData,
  authError,
  loading,
  resuming,
  onOpenChange,
  onChange,
  onAuthenticate,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4 sm:max-w-md">
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
              <Input id="name" className="pl-8" value={authData.name} onChange={(e) => onChange("name", e.target.value)} placeholder="Prénom Nom" />
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
                onChange={(e) => onChange("email", e.target.value)}
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
                onChange={(e) => onChange("phone", e.target.value)}
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

          {authError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          ) : null}
        </div>

        <DialogFooter>
          <Button onClick={onAuthenticate} className="w-full" disabled={loading || resuming}>
            {loading ? "Vérification..." : resuming ? "Reprise en cours..." : "Continuer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function TestIntroductionCard({ testData, authData, onStart }) {
  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <CardTitle className="text-xl sm:text-2xl">{testData.title}</CardTitle>
        <CardDescription className="text-sm text-orange-100 sm:text-base">{testData.referentiel}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <Clock className="h-6 w-6 flex-shrink-0 text-orange-500 sm:h-8 sm:w-8" />
            <div>
              <p className="text-xs text-muted-foreground sm:text-sm">Durée</p>
              <p className="text-base font-semibold sm:text-lg">{testData.duration} minutes</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <FileText className="h-6 w-6 flex-shrink-0 text-blue-500 sm:h-8 sm:w-8" />
            <div>
              <p className="text-xs text-muted-foreground sm:text-sm">Questions</p>
              <p className="text-base font-semibold sm:text-lg">{testData.questions.length}</p>
            </div>
          </div>
        </div>

        <Alert className="border-l-4 border-orange-500 bg-orange-50">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-orange-600" />
          <AlertDescription className="text-xs text-gray-800 sm:text-sm">
            <strong className="text-sm text-gray-900 sm:text-base">📌 Instructions importantes</strong>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Vous <span className="font-medium">ne pouvez pas mettre le test en pause</span>.</li>
              <li>Le test sera <span className="font-medium">automatiquement soumis</span> à l’expiration du temps.</li>
              <li>Assurez-vous d’avoir <span className="font-medium">une connexion stable</span>.</li>
              <li><span className="font-medium">Une seule tentative</span> est autorisée.</li>
              <li>Utilisation d&apos;ordinateur fortement recommandée.</li>
            </ul>
            <div className="my-4 border-t border-gray-300"></div>
            <strong className="block text-sm text-red-700 sm:text-base">⚠️ Avertissement anti-triche</strong>
            <p className="mt-2">Ce test est surveillé par un système avancé de détection.</p>
            <ul className="mt-3 list-inside list-disc space-y-1">
              <li><span className="font-medium text-gray-900">Blocage du copier/coller</span> et des raccourcis suspects.</li>
              <li><span className="font-medium text-gray-900">Désactivation du clic droit</span> et des outils de développement.</li>
              <li><span className="font-medium text-gray-900">Détection des captures d’écran</span>.</li>
              <li><span className="font-medium text-gray-900">Détection des changements d’onglet</span> ou perte de focus.</li>
              <li><span className="font-medium">Avertissements visuels</span> déclenchés automatiquement.</li>
              <li><span className="font-medium text-red-600">Avertissement sonore</span> en cas de comportement suspect.</li>
            </ul>
            <p className="mt-3 font-semibold text-red-700">
              Toute tentative de triche est enregistrée et transmise automatiquement à l’équipe d’évaluation.
              <br />
              Toute violation répétée ou grave entraînera une sanction pouvant aller jusqu’à l’invalidation du test.
            </p>
          </AlertDescription>
        </Alert>

        <div className="flex flex-col items-start justify-between gap-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium sm:text-base">Candidat : {authData.name}</p>
            <p className="truncate text-xs text-muted-foreground sm:text-sm">{authData.email}</p>
          </div>
          <Badge className="flex-shrink-0 bg-green-100 text-xs text-green-800 sm:text-sm">Prêt</Badge>
        </div>

        <Button onClick={onStart} className="h-12 w-full bg-orange-500 text-base touch-manipulation hover:bg-orange-600 sm:h-14 sm:text-lg">
          Commencer le test
        </Button>
      </CardContent>
    </Card>
  )
}

export function ActiveTestView({
  testData,
  currentQuestion,
  currentQuestionData,
  answers,
  timeRemaining,
  progress,
  answeredCount,
  onSingleAnswerChange,
  onMultipleAnswerChange,
  onTextAnswerChange,
  onPrevious,
  onNext,
  onJump,
  onSubmit,
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-muted-foreground">Question {currentQuestion + 1} sur {testData.questions.length}</p>
              <p className="text-sm">Répondues: {answeredCount} / {testData.questions.length}</p>
            </div>

            <div className={`flex w-full items-center justify-center space-x-2 rounded-lg px-4 py-2 sm:w-auto ${
              timeRemaining < 300 ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
            }`}>
              <Clock className="h-5 w-5" />
              <span className="text-lg font-bold">{timeRemaining}</span>
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <CardTitle className="text-lg sm:text-xl">Question {currentQuestion + 1}</CardTitle>
            <div className="flex flex-wrap items-center space-x-2">
              <Badge variant="secondary" className="text-xs sm:text-sm">{currentQuestionData.score} pts</Badge>
              {currentQuestionData.type === "qcm_multiple" ? (
                <Badge variant="outline" className="text-xs sm:text-sm">Choix multiples</Badge>
              ) : null}
            </div>
          </div>
          <CardDescription className="mt-2 text-sm sm:text-base">
            <RichTextDisplay content={currentQuestionData.question} />
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentQuestionData.image ? (
            <div className="mb-6">
              <img src={currentQuestionData.image} alt="Question" className="mx-auto h-auto max-h-48 w-full max-w-full rounded-lg border shadow-sm sm:max-h-64" />
            </div>
          ) : null}

          {!currentQuestionData.type || currentQuestionData.type === "qcm_simple" ? (
            <RadioGroup
              value={answers[currentQuestion] !== undefined && answers[currentQuestion] !== null ? answers[currentQuestion].toString() : ""}
              onValueChange={(value) => onSingleAnswerChange(parseInt(value, 10))}
            >
              {currentQuestionData.options.map((option, index) => (
                <div
                  key={index}
                  className="flex min-h-[56px] cursor-pointer items-center space-x-3 rounded-lg border p-4 touch-manipulation hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} className="h-5 w-5 flex-shrink-0" />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-sm sm:text-base">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : null}

          {currentQuestionData.type === "qcm_multiple" ? (
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
                  className="flex min-h-[56px] items-center space-x-3 rounded-lg border p-4 touch-manipulation hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Checkbox
                    id={`option-multiple-${index}`}
                    checked={answers[currentQuestion] ? Array.isArray(answers[currentQuestion]) && answers[currentQuestion].includes(index) : false}
                    onCheckedChange={(checked) => onMultipleAnswerChange(index, checked)}
                    className="h-5 w-5 flex-shrink-0"
                  />
                  <Label htmlFor={`option-multiple-${index}`} className="flex-1 cursor-pointer text-sm sm:text-base">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          ) : null}

          {currentQuestionData.type === "texte_libre" ? (
            <div className="space-y-3">
              <Textarea
                value={answers[currentQuestion] || ""}
                onChange={(e) => onTextAnswerChange(e.target.value)}
                placeholder="Saisissez votre réponse ici..."
                rows={6}
                className="min-h-[120px] resize-none text-sm sm:text-base"
              />
              <p className="text-xs text-muted-foreground sm:text-sm">
                Cette réponse sera évaluée manuellement par l&apos;équipe ODC.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:gap-0">
            <Button variant="outline" onClick={onPrevious} disabled={currentQuestion === 0} className="h-12 w-full touch-manipulation text-base sm:h-10 sm:w-auto sm:text-sm">
              Précédent
            </Button>

            {currentQuestion === testData.questions.length - 1 ? (
              <Button onClick={onSubmit} className="h-12 w-full bg-green-500 text-base touch-manipulation hover:bg-green-600 sm:h-10 sm:w-auto sm:text-sm">
                Soumettre le test
              </Button>
            ) : (
              <Button onClick={onNext} className="h-12 w-full touch-manipulation text-base sm:h-10 sm:w-auto sm:text-sm">
                Suivant
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm sm:text-base">Navigation rapide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
            {testData.questions.map((_, index) => (
              <Button
                key={index}
                variant={currentQuestion === index ? "default" : "outline"}
                size="sm"
                className={`min-h-[44px] touch-manipulation text-xs sm:text-sm ${
                  answers[index] !== undefined ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400" : ""
                }`}
                onClick={() => onJump(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function SubmitConfirmationDialog({ open, unansweredCount, onOpenChange, onCancel, onConfirm }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4 sm:max-w-md">
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
            <p>
              <strong>Attention !</strong> Il vous reste {unansweredCount} question(s) non répondue(s).
              Une fois soumis, vous ne pourrez plus modifier vos réponses.
            </p>
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Annuler</Button>
          <Button onClick={onConfirm} className="bg-orange-500 hover:bg-orange-600">Confirmer la soumission</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function SubmissionSuccessDialog({ open, onBackHome }) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onBackHome()}>
      <DialogContent className="mx-4 sm:max-w-md">
        <DialogHeader>
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-10 w-10 text-green-600 sm:h-12 sm:w-12" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl sm:text-2xl">Test soumis avec succès !</DialogTitle>
          <DialogDescription className="text-center">Votre test a été enregistré avec succès</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <p className="text-sm text-blue-900 dark:text-blue-100">
                Vos résultats ont été transmis à l&apos;équipe d&apos;Orange Digital Center.
              </p>
            </AlertDescription>
          </Alert>

          <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription>
              <p className="text-sm text-orange-900 dark:text-orange-100">
                <strong>Prochaine étape :</strong> Vous serez recontacté(e) une fois votre candidature évaluée pour la suite du processus de sélection.
              </p>
            </AlertDescription>
          </Alert>

          <div className="text-center text-sm text-muted-foreground">
            <p>Merci pour votre participation !</p>
            <p className="mt-1">L&apos;équipe Orange Digital Center vous contactera sous peu.</p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onBackHome} className="w-full bg-orange-500 hover:bg-orange-600">
            Retour à l&apos;accueil
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
