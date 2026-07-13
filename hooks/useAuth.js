"use client"

import { useContext } from "react"
import { AuthContext } from "@/contexts/AuthContext" // Change le chemin si nécessaire

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider")
  }
  return context
}


