"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/app/contexts/AuthContext"
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react"

// Icônes SVG inline
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
)

const LinkedInIcon = () => (
  <svg className="h-5 w-5 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
)

export default function LoginPage() {
  const router = useRouter()
  const { login, loginWithGoogle, loginWithLinkedIn, isLoading: authLoading, error: authError } = useAuth()

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

  const handleOAuthLogin = async (provider) => {
    try {
      if (provider === "google") {
        await loginWithGoogle()
      } else if (provider === "linkedin") {
        await loginWithLinkedIn()
      }
    } catch (err) {
      setError(err?.message || `Erreur de connexion avec ${provider}`)
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
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
                    className={`w-full px-3 py-2 border rounded-md pr-10 focus:outline-none focus:ring-2 ${
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

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Ou continuer avec</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleOAuthLogin("google")}
                  disabled={isLoading || success || authLoading}
                  className="flex items-center justify-center gap-2 py-2 px-4 bg-white border border-gray-300 rounded-md text-gray-800 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <GoogleIcon />
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuthLogin("linkedin")}
                  disabled={isLoading || success || authLoading}
                  className="flex items-center justify-center gap-2 py-2 px-4 bg-white border border-gray-300 rounded-md text-gray-800 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <LinkedInIcon />
                  LinkedIn
                </button>
              </div>

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
