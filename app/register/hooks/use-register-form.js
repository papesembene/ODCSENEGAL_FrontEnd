"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/contexts/AuthContext"
import {
  buildRegisterPayload,
  buildRegisterSummary,
  createInitialErrors,
  createInitialRegisterForm,
  validateAccountStep,
  validateProfileStep,
} from "../register-form-utils"

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")

function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`
}

export default function useRegisterForm() {
  const router = useRouter()
  const { loginWithGoogle, loginWithLinkedIn, isLoading: authLoading, error: authError } = useAuth()

  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState(createInitialRegisterForm)
  const [errors, setErrors] = useState(createInitialErrors)

  useEffect(() => {
    setErrors((prev) => ({
      ...prev,
      email: formData.email ? null : prev.email,
      password: formData.password ? null : prev.password,
      confirmPassword: formData.confirmPassword ? null : prev.confirmPassword,
      profileType: formData.profileType ? null : prev.profileType,
      acceptTerms: formData.acceptTerms ? null : prev.acceptTerms,
      form: prev.form,
    }))
    setError(null)
  }, [formData.acceptTerms, formData.confirmPassword, formData.email, formData.password, formData.profileType])

  useEffect(() => {
    if (authError) {
      setError(authError)
    }
  }, [authError])

  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleFileChange = useCallback((field, file) => {
    setFormData((prev) => ({ ...prev, [field]: file }))
  }, [])

  const goNext = useCallback(() => {
    if (currentStep === 1) {
      const result = validateAccountStep(formData)
      setErrors(result.errors)
      if (!result.isValid) {
        return
      }
    }

    if (currentStep === 2) {
      const result = validateProfileStep(formData)
      setErrors((prev) => ({ ...prev, form: result.errors }))
      if (!result.isValid) {
        return
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, 3))
    window.scrollTo(0, 0)
  }, [currentStep, formData])

  const goPrevious = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo(0, 0)
  }, [])

  const handleOAuthRegister = useCallback(
    async (provider) => {
      try {
        if (provider === "google") {
          await loginWithGoogle()
          return
        }

        if (provider === "linkedin") {
          await loginWithLinkedIn()
        }
      } catch (oauthError) {
        setError(oauthError?.message || `Erreur d'inscription avec ${provider}`)
      }
    },
    [loginWithGoogle, loginWithLinkedIn],
  )

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault()

      const result = validateProfileStep(formData)
      setErrors((prev) => ({ ...prev, form: result.errors }))

      if (!result.isValid) {
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(buildApiUrl("/api/auth/register"), {
          method: "POST",
          body: buildRegisterPayload(formData),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.message || "Erreur lors de l'inscription")
        }

        setSuccess(true)
        setTimeout(() => {
          router.push("/")
        }, 2000)
      } catch (submitError) {
        setError(submitError?.message || "Une erreur est survenue lors de l'inscription")
      } finally {
        setIsLoading(false)
      }
    },
    [formData, router],
  )

  const summary = useMemo(() => buildRegisterSummary(formData), [formData])

  return {
    currentStep,
    isLoading,
    authLoading,
    error,
    success,
    formData,
    errors,
    summary,
    setCurrentStep,
    updateField,
    handleFileChange,
    goNext,
    goPrevious,
    handleSubmit,
    handleOAuthRegister,
  }
}
