"use client"

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function OAuthEmailRequestContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Récupérer les données OAuth de l'URL
  const oauthId = searchParams.get('oauth_id')
  const provider = searchParams.get('provider')
  const firstName = searchParams.get('first_name')
  const lastName = searchParams.get('last_name')
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validation simple de l'email
    if (!email || !email.includes('@')) {
      setError('Veuillez entrer une adresse email valide')
      return
    }
    
    setIsLoading(true)
    
    try {
      // Envoyer l'email au backend
      const response = await fetch('/api/auth/complete-oauth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          oauth_id: oauthId,
          provider,
          first_name: firstName,
          last_name: lastName
        })
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la complétion de l\'authentification')
      }
      
      const data = await response.json()
      
      // Stocker le token et rediriger
      localStorage.setItem('auth_token', data.token)
      router.push('/dashboard')
    } catch (err) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Une dernière étape</h1>
        <p className="text-gray-600 mb-6">
          Nous avons besoin de votre adresse email pour compléter votre inscription.
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Adresse email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7900]"
              placeholder="votre@email.com"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#ff7900] text-white py-2 px-4 rounded-md hover:bg-[#ff9a40] transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Traitement en cours...' : 'Continuer'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function OAuthEmailRequest() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-6">Chargement...</h1>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#ff7900]"></div>
          </div>
        </div>
      </div>
    }>
      <OAuthEmailRequestContent />
    </Suspense>
  )
}