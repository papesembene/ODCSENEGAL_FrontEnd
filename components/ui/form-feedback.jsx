import Link from "@/components/ui/interactive-link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, CheckCircle } from "lucide-react"
import { FORM_FEEDBACK_MESSAGES } from "@/lib/form-feedback"

export function FormFieldError({ message, className = "mt-2 py-2" }) {
  if (!message) {
    return null
  }

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

export function FormCheckingMessage({
  message = FORM_FEEDBACK_MESSAGES.checking,
  className = "mt-1 text-sm text-gray-500",
  as: Component = "p",
}) {
  return <Component className={className}>{message}</Component>
}

export function FormSubmissionError({ message, className = "mb-4" }) {
  if (!message) {
    return null
  }

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

export function PublicFormSuccessState({
  title = FORM_FEEDBACK_MESSAGES.successTitle,
  descriptions,
  actionHref,
  actionLabel,
  className = "mt-6",
}) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
        {descriptions.map((description) => (
          <p key={description} className="text-gray-600 dark:text-gray-300">
            {description}
          </p>
        ))}
        <div className="mt-6">
          <Button asChild>
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
