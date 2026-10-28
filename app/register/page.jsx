"use client"

import Link from "@/components/ui/interactive-link"
import useRegisterForm from "./hooks/use-register-form"
import {
  AccountStep,
  ProfileStep,
  RegisterFeedback,
  RegisterNavigation,
  RegisterStepHeader,
  SummaryStep,
} from "./register-steps"

export default function RegisterPage() {
  const registerForm = useRegisterForm()

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      <div className="relative hidden overflow-hidden lg:block lg:w-1/2">
        <div className="absolute inset-0 bg-[#F5F5F5]" />
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff7900] opacity-10" />
        <div className="absolute bottom-0 left-0 h-40 w-40 -translate-x-1/2 translate-y-1/2 rounded-full bg-[#ff7900] opacity-10" />
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <img
            src="/images/background-register.png?height=600&width=800"
            alt="Illustration"
            className="h-auto max-h-full w-auto max-w-full object-contain"
            style={{ filter: "drop-shadow(0px 10px 15px rgba(0, 0, 0, 0.1))" }}
          />
        </div>
        <div className="absolute inset-0 z-10 bg-black/40" />
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="p-8 text-center">
            <h1 className="mb-4 text-4xl font-bold text-white">
              Rejoignez notre <span className="text-[#ff7900]">écosystème</span>
            </h1>
            <p className="max-w-md text-xl text-white">
              Créez votre compte pour accéder à toutes les opportunités d&apos;accompagnement, de formation et de collaboration.
            </p>
          </div>
        </div>
      </div>

      <div className="flex min-h-screen w-full items-center justify-center bg-white p-6 lg:w-1/2">
        <div className="w-full max-w-2xl animate-fadeIn">
          <div className="mb-8 text-center lg:hidden">
            <h1 className="text-3xl font-bold text-gray-900">Créer un compte</h1>
            <p className="mt-2 text-gray-600">Rejoignez notre écosystème d&apos;innovation</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-xl">
            <RegisterStepHeader currentStep={registerForm.currentStep} />
            <RegisterFeedback error={registerForm.error} success={registerForm.success} />

            <form onSubmit={registerForm.handleSubmit}>
              {registerForm.currentStep === 1 ? (
                <AccountStep
                  formData={registerForm.formData}
                  errors={registerForm.errors}
                  onFieldChange={registerForm.updateField}
                  onOAuthRegister={registerForm.handleOAuthRegister}
                  isDisabled={registerForm.isLoading || registerForm.success || registerForm.authLoading}
                />
              ) : null}

              {registerForm.currentStep === 2 ? (
                <ProfileStep
                  formData={registerForm.formData}
                  formErrors={registerForm.errors.form}
                  onFieldChange={registerForm.updateField}
                  onFileChange={registerForm.handleFileChange}
                />
              ) : null}

              {registerForm.currentStep === 3 ? (
                <SummaryStep formData={registerForm.formData} summary={registerForm.summary} />
              ) : null}

              <RegisterNavigation
                currentStep={registerForm.currentStep}
                isLoading={registerForm.isLoading}
                authLoading={registerForm.authLoading}
                onPrevious={registerForm.goPrevious}
                onNext={registerForm.goNext}
              />
            </form>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Vous avez déjà un compte?{" "}
              <Link href="/login" className="font-medium text-[#ff7900] hover:text-[#ff9a40] hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
