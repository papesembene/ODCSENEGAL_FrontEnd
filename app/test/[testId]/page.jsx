"use client"

import { useParams, useRouter } from "next/navigation"
import { Toaster } from "sonner"
import useTestCandidateSession from "./hooks/use-test-candidate-session"
import {
  ActiveTestView,
  SubmissionSuccessDialog,
  SubmitConfirmationDialog,
  TestAuthDialog,
  TestExpiredState,
  TestInactiveState,
  TestIntroductionCard,
  TestLoadingState,
  TestNotFoundState,
  TestTooEarlyState,
} from "./test-candidate-views"

export default function TestCandidatePage() {
  const params = useParams()
  const router = useRouter()
  const session = useTestCandidateSession({ testId: params?.testId })

  if (session.loading) {
    return <TestLoadingState />
  }

  if (!session.testData) {
    return <TestNotFoundState onBackHome={() => router.push("/")} />
  }

  if (session.testAccessStatus === "too_early") {
    return (
      <TestTooEarlyState
        scheduledDateTime={session.scheduledDateTime}
        countdown={session.countdown}
        testData={session.testData}
        onReload={() => window.location.reload()}
      />
    )
  }

  if (session.testAccessStatus === "expired") {
    return <TestExpiredState scheduledDateTime={session.scheduledDateTime} testData={session.testData} />
  }

  if (session.testAccessStatus === "inactive") {
    return <TestInactiveState />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 dark:bg-gray-900 sm:py-8">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6">
        <TestAuthDialog
          open={session.showAuthDialog && !session.isAuthenticated && session.testAccessStatus === "available"}
          authData={session.authData}
          authError={session.authError}
          loading={session.loading}
          resuming={session.resuming}
          onOpenChange={session.setShowAuthDialog}
          onChange={session.updateAuthField}
          onAuthenticate={() => session.performAuthentication(session.authData)}
        />

        {session.isAuthenticated && !session.testStarted ? (
          <TestIntroductionCard testData={session.testData} authData={session.authData} onStart={session.handleStartTest} />
        ) : null}

        {session.testStarted && !session.testCompleted && session.currentQuestionData ? (
          <ActiveTestView
            testData={session.testData}
            currentQuestion={session.currentQuestion}
            currentQuestionData={session.currentQuestionData}
            answers={session.answers}
            timeRemaining={session.formattedTimeRemaining}
            progress={session.progress}
            answeredCount={session.answeredCount}
            onSingleAnswerChange={session.handleSingleAnswerChange}
            onMultipleAnswerChange={session.handleMultipleAnswerChange}
            onTextAnswerChange={session.handleTextAnswerChange}
            onPrevious={() => session.setCurrentQuestion((prev) => Math.max(0, prev - 1))}
            onNext={() => session.setCurrentQuestion((prev) => Math.min(session.testData.questions.length - 1, prev + 1))}
            onJump={session.setCurrentQuestion}
            onSubmit={() => session.handleSubmitTest(false)}
          />
        ) : null}

        <SubmitConfirmationDialog
          open={session.showConfirmSubmit}
          unansweredCount={session.unansweredCount}
          onOpenChange={session.setShowConfirmSubmit}
          onCancel={() => session.setShowConfirmSubmit(false)}
          onConfirm={() => session.confirmSubmitTest(false)}
        />

        <SubmissionSuccessDialog open={session.showSuccessModal} onBackHome={() => router.push("/")} />
      </div>
      <Toaster position="top-right" richColors />
    </div>
  )
}
