// src/contexts/AuthContext.jsx
"use client"

import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
    isLoading: true,
    error: null
  })

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")

  // Initial auth check
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("auth_token")
      
      if (storedToken) {
        try {
          // D'abord vérifier le token
          await verifyToken(storedToken)
          // Puis récupérer le profil complet
          const user = await fetchFullProfile(storedToken)
          
          setAuthState(prev => ({
            ...prev,
            user,
            token: storedToken,
            isLoading: false
          }))
        } catch (error) {
          localStorage.removeItem("auth_token")
          setAuthState(prev => ({ ...prev, isLoading: false }))
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }))
      }
    }

    initializeAuth()
  }, [])

  const verifyToken = async (token) => {
    const response = await fetch(`${API_URL}/api/auth/verify-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.message || "Invalid token")
    return data.user
  }

  const handleAuthResponse = async (response) => {
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || "Authentication failed")
    
    localStorage.setItem("auth_token", data.token)
    const user = await fetchFullProfile(data.token)
    
    setAuthState({
      user,
      token: data.token,
      isLoading: false,
      error: null
    })
    
    return { user, token: data.token }
  }

 // Fonction pour récupérer le profil complet
const fetchFullProfile = async (token) => {
  const authToken = token || authState.token
  if (!authToken) return null

  const response = await fetch(`${API_URL}/api/auth/get-profile`, {
    headers: {
      "Authorization": `Bearer ${authToken}`,
      "Content-Type": "application/json"
    }
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.message || "Failed to fetch profile")
  
  setAuthState(prev => ({
    ...prev,
    user: data.user,
    isLoading: false
  }))

  return data.user
}
  const login = async (email, password) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })

      return await handleAuthResponse(response)
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }))
      throw error
    }
  }
// Dans votre AuthContext
// Dans votre AuthContext, ajoutez ce useEffect
useEffect(() => {
  const handleMessage = (event) => {
    // Vérification cruciale de l'origine
    if (event.origin !== window.location.origin) {
      console.warn('Message reçu depuis une origine non autorisée:', event.origin)
      return
    }

    if (event.data.type === 'oauth-success') {
      console.log('Connexion OAuth réussie', event.data)
      localStorage.setItem('auth_token', event.data.token)
      // Forcez un rechargement si nécessaire
      window.location.href = '/connect'
    }
  }

  window.addEventListener('message', handleMessage)
  return () => window.removeEventListener('message', handleMessage)
}, [])
  const register = async (formData) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        body: formData
      })

      return await handleAuthResponse(response)
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }))
      throw error
    }
  }
  const updateProfile = async (profileData, files = {}) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const formData = new FormData()
      
      // Ajouter les données du profil
      Object.entries(profileData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value)
        }
      })
      
      // Ajouter les fichiers
      Object.entries(files).forEach(([fieldName, file]) => {
        if (file) formData.append(fieldName, file)
      })
  
      const response = await fetch(`${API_URL}/api/auth/update-profile`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authState.token}`
        },
        body: formData
      })
  
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Échec de la mise à jour")
      }
  
      // Mettre à jour l'état avec les nouvelles données
      setAuthState(prev => ({
        ...prev,
        user: {
          ...prev.user,
          ...data.user,
          profile_data: {
            ...prev.user?.profile_data,
            ...data.user?.profile_data
          }
        },
        isLoading: false
      }))
      
      return data.user
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }))
      throw error
    }
  }
  // Modification de la fonction handleOAuth dans AuthContext.jsx
// Ajoutez cette fonction à votre AuthContext.jsx
const handleOAuth = (provider) => {
  const width = 600, height = 600;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;
  
  setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
  
  // Ouvrir la fenêtre popup
  const popup = window.open(
    `${API_URL}/api/auth/${provider}/authorize`,
    'oauthPopup',
    `width=${width},height=${height},top=${top},left=${left}`
  );
  
  // Fonction pour vérifier si la popup est fermée
  const checkPopup = setInterval(() => {
    if (!popup || popup.closed) {
      clearInterval(checkPopup);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, 1000);

  // Écouter les messages du popup
  const messageHandler = (event) => {
    // Vérification cruciale de l'origine
    if (event.origin !== window.location.origin) {
      console.warn('Message reçu depuis une origine non autorisée:', event.origin);
      return;
    }

    if (event.data.type === 'oauth-success') {
      clearInterval(checkPopup);
      
      const { token } = event.data;
      localStorage.setItem("auth_token", token);
      
      fetchFullProfile(token).then(user => {
        setAuthState({
          user,
          token,
          isLoading: false,
          error: null
        });
        
        // Rediriger vers le dashboard après connexion réussie
        window.location.href = '/connect';
      });
    } else if (event.data.type === 'oauth-error') {
      clearInterval(checkPopup);
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: event.data.error || "Échec de l'authentification"
      }));
    }
  };

  window.addEventListener('message', messageHandler);
  return () => {
    clearInterval(checkPopup);
    window.removeEventListener('message', messageHandler);
  };
};
  const logout = () => {
    localStorage.removeItem("auth_token")
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      error: null
    })
  }

  const value = {
    ...authState,
    API_URL,
    isAuthenticated: !!authState.user,
    login,
    fetchFullProfile,
    register,
    updateProfile,
    loginWithGoogle: () => handleOAuth("google"),
    loginWithLinkedIn: () => handleOAuth("linkedin"),
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
