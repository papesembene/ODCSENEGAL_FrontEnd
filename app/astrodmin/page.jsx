"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà authentifié
    const isAuthenticated = !!localStorage.getItem("admin_token")
    if (isAuthenticated) {
      const admin = JSON.parse(localStorage.getItem("admin_user") || "{}")
      const adminScope = admin?.profile_data?.admin_scope
      router.push(adminScope === "interview_member" ? "/astrodmin/mes-entretiens" : "/astrodmin/dashboard")
    }
  }, [router])

  const validateForm = () => {
    const errors = {}

    if (!email) {
      errors.email = "L'email est requis"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Format d'email invalide"
    }

    if (!password) {
      errors.password = "Le mot de passe est requis"
    } else if (password.length < 6) {
      errors.password = "Le mot de passe doit contenir au moins 6 caractères"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError("")

    try {
      // Appel à l'API backend pour l'authentification admin
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      // Gérer les réponses non-JSON (erreurs réseau, etc.)
      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        throw new Error("Erreur de communication avec le serveur. Veuillez réessayer.")
      }

      if (!response.ok) {
        // Extraire le message d'erreur de manière propre
        let errorMessage = "Identifiants invalides"
        
        if (data && data.error) {
          // Nettoyer le message d'erreur (retirer les codes HTTP, etc.)
          errorMessage = data.error
          // Retirer les préfixes HTTP comme "401 Unauthorized: "
          errorMessage = errorMessage.replace(/^\d+\s+\w+:\s*/i, "")
          // Si le message contient toujours des codes HTTP, utiliser un message par défaut
          if (errorMessage.match(/^\d+/)) {
            errorMessage = "Email ou mot de passe incorrect"
          }
        } else if (response.status === 401) {
          errorMessage = "Email ou mot de passe incorrect"
        } else if (response.status >= 500) {
          errorMessage = "Erreur serveur. Veuillez réessayer plus tard."
        }
        
        throw new Error(errorMessage)
      }

      if (!data.success) {
        const errorMessage = data.error ? data.error.replace(/^\d+\s+\w+:\s*/i, "") : "Échec de la connexion"
        throw new Error(errorMessage)
      }

      // Stocker le token JWT et les informations utilisateur
      localStorage.setItem("admin_token", data.token)
      localStorage.setItem("admin_email", data.user.email)
      localStorage.setItem("admin_type", data.user.admin_type || "startups")
      localStorage.setItem("admin_user", JSON.stringify(data.user))

      // Rediriger vers le tableau de bord approprié
      router.push(data.user?.profile_data?.admin_scope === "interview_member" ? "/astrodmin/mes-entretiens" : "/astrodmin/dashboard")
    } catch (err) {
      // Gérer différents types d'erreurs
      let errorMessage = "Une erreur est survenue lors de la connexion"
      
      if (err.message) {
        errorMessage = err.message
      } else if (err instanceof TypeError && err.message.includes("fetch")) {
        errorMessage = "Impossible de se connecter au serveur. Vérifiez votre connexion internet."
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Administration</CardTitle>
          <CardDescription className="text-center">Connectez-vous pour accéder au tableau de bord</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre.email@orange.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={validationErrors.email ? "border-red-500" : ""}
                />
                {validationErrors.email && <p className="text-sm text-red-500">{validationErrors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={validationErrors.password ? "border-red-500" : ""}
                />
                {validationErrors.password && <p className="text-sm text-red-500">{validationErrors.password}</p>}
              </div>
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
