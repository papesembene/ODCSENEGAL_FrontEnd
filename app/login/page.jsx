"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "@/components/ui/interactive-link"
import { useAuth } from "@/app/contexts/AuthContext"
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react"

// Icônes SVG inline
export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading: authLoading, error: authError } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [emailError, setEmailError] = useState(null)
  const [passwordError, setPasswordError] = useState(null)

  // Reset errors when inputs change
  useEffect(() => {
    if (email) setEmailError(null)
    if (password) setPasswordError(null)
    if (email || password) setError(null)
  }, [email, password])

  // Afficher l'erreur d'authentification si elle existe
  useEffect(() => {
    if (authError) {
      setError(authError)
    }
  }, [authError])

  const validateForm = () => {
    let isValid = true

    // Email validation
    if (!email) {
      setEmailError("L'email est requis")
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Format d'email invalide")
      isValid = false
    }

    // Password validation
    if (!password) {
      setPasswordError("Le mot de passe est requis")
      isValid = false
    } else if (password.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères")
      isValid = false
    }

    // Terms validation
    if (!acceptTerms) {
      setError("Vous devez accepter les conditions générales et la politique de confidentialité")
      isValid = false
    }

    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setError(null)

    try {
      // Utiliser la fonction de login du contexte d'authentification
      await login(email, password)

      setSuccess(true)

      // Redirection après connexion réussie
      setTimeout(() => {
        router.push("/connect")
      }, 1000)
    } catch (err) {
      setError(err?.message || "Une erreur est survenue lors de la connexion")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      {/* Left column - Background image (même style que register) */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        {/* Arrière-plan white smoke */}
        <div className="absolute inset-0 bg-[#F5F5F5]" />

        {/* Accent de couleur orange (coins) */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff7900] opacity-10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#ff7900] opacity-10 rounded-full translate-y-1/2 -translate-x-1/2" />

        {/* Image avec fond transparent */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <img
            src="/images/background-login.jpg"
            alt="Connexion"
            className="w-auto h-auto max-w-full max-h-full object-contain"
            style={{ filter: "drop-shadow(0px 10px 15px rgba(0, 0, 0, 0.1))" }}
          />
        </div>

        {/* Overlay noir semi-transparent */}
        <div className="absolute inset-0 bg-black/40 z-10" />

        {/* Contenu texte avec accent orange */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center p-8">
            <h1 className="text-4xl font-bold mb-4 text-white">
              Bienvenue sur <span className="text-[#ff7900]">Espace Connect</span>
            </h1>
            <p className="text-xl max-w-md text-white">
              Connectez-vous pour accéder à votre espace personnel et profiter de tous nos services.
            </p>
          </div>
        </div>
      </div>
      {/* Right column - Login form */}
      <div className="w-full lg:w-1/2 bg-white min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fadeIn">
          {/* Mobile logo/header */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Bienvenue</h1>
            <p className="text-gray-600 mt-2">Connectez-vous pour continuer</p>
          </div>

          {/* Form container */}
          <div className="bg-white rounded-xl p-8 shadow-xl border border-gray-200">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
              <p className="text-gray-600 mt-1">Entrez vos identifiants pour vous connecter</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-3 rounded-md flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-3 rounded-md">
                <p>Connexion réussie! Redirection en cours...</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="exemple@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-hidden focus:ring-2 ${
                    emailError
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-[#ff7900] focus:border-[#ff7900]"
                  }`}
                  disabled={isLoading || success || authLoading}
                />
                {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Mot de passe
                  </label>
                  <Link href="/forgot-password" className="text-sm text-[#ff7900] hover:text-[#ff9a40] hover:underline">
                    Mot de passe oublié?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md pr-10 focus:outline-hidden focus:ring-2 ${
                      passwordError
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-[#ff7900] focus:border-[#ff7900]"
                    }`}
                    disabled={isLoading || success || authLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading || success || authLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    disabled={isLoading || success || authLoading}
                    className="h-4 w-4 text-[#ff7900] border-gray-300 rounded focus:ring-[#ff7900]"
                  />
                </div>
                <label htmlFor="terms" className="text-sm text-gray-700">
                  J'accepte les{" "}
                  <Link href="/terms" className="text-[#ff7900] hover:text-[#ff9a40] hover:underline">
                    conditions générales
                  </Link>{" "}
                  et la{" "}
                  <Link href="/privacy" className="text-[#ff7900] hover:text-[#ff9a40] hover:underline">
                    politique de confidentialité
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-[#ff7900] hover:bg-[#ff9a40] text-white font-medium py-2.5 px-4 rounded-md transition-colors disabled:opacity-50"
                disabled={isLoading || success || authLoading}
              >
                {isLoading || authLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connexion en cours...
                  </span>
                ) : (
                  "Se connecter"
                )}
              </button>

              <div className="text-center mt-6">
                <p className="text-gray-600 text-sm">
                  Vous n'avez pas de compte?{" "}
                  <Link href="/register" className="text-[#ff7900] hover:text-[#ff9a40] hover:underline font-medium">
                    Créer un compte
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
