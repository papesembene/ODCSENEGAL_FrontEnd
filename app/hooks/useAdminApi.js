"use client"

export const useAdminApi = () => {
  const makeRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('admin_token')

    if (!token) {
      throw new Error('Token non trouvé')
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      credentials: 'include',
    })

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('admin_token')
        window.location.href = '/astrodmin'
        throw new Error('Token expiré')
      }
      throw new Error('Erreur de requête')
    }

    return response.json()
  }

  return { makeRequest }
}
