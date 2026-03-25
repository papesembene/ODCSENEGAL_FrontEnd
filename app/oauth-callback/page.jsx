"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function OAuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Récupérer le token de l'URL
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (token) {
      console.log("Token OAuth reçu, authentification réussie")
      
      // Stocker le token dans localStorage
      localStorage.setItem('auth_token', token)
      
      // Envoyer un message à la fenêtre parente (si c'est un popup)
      if (window.opener) {
        window.opener.postMessage({ type: 'oauth-success', token }, window.location.origin)
        window.close()
      } else {
        // Rediriger vers la page d'accueil ou dashboard
        router.push('/connect')
      }
    } else if (error) {
      console.error("Erreur OAuth:", error)
      
      // Gérer l'erreur
      if (window.opener) {
        window.opener.postMessage({ type: 'oauth-error', error }, window.location.origin)
        window.close()
      } else {
        router.push(`/login?error=${error}`)
      }
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Authentification en cours...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff7900] mx-auto"></div>
      </div>
    </div>
  )
}

export default function OAuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Chargement...</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff7900] mx-auto"></div>
        </div>
      </div>
    }>
      <OAuthCallbackContent />
    </Suspense>
  )
}