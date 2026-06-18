export function sanitizeAuthPayload({ name, email, phone }) {
  return {
    cleanedName: (name || "").trim(),
    cleanedEmail: (email || "").trim().toLowerCase(),
    cleanedPhone: (phone || "").replace(/\s/g, ""),
    rawPhone: (phone || "").trim(),
  }
}

export function validateAuthPayload({ cleanedName, cleanedEmail, cleanedPhone, skipValidation = false }) {
  if (!skipValidation) {
    if (!cleanedName || !cleanedEmail || !cleanedPhone) {
      return "❌ Veuillez remplir tous les champs"
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(cleanedEmail)) {
      return "❌ Format d'email invalide. Exemple: exemple@email.com"
    }

    if (!/\d/.test(cleanedPhone)) {
      return "❌ Veuillez entrer un numéro de téléphone valide"
    }

    return null
  }

  if (!cleanedEmail || !cleanedPhone) {
    return "missing_required_fields"
  }

  return null
}

export function buildAuthenticatedCandidate({ cleanedName, cleanedEmail, cleanedPhone, candidate }) {
  const candidateName = cleanedName || [candidate?.firstName, candidate?.lastName].filter(Boolean).join(" ").trim()

  return {
    name: candidateName,
    email: cleanedEmail,
    phone: cleanedPhone,
  }
}

export function parseStoredAuthData(storedAuth) {
  if (!storedAuth) {
    return null
  }

  try {
    const parsed = JSON.parse(storedAuth)
    return {
      name: parsed?.name || "",
      email: parsed?.email || "",
      phone: parsed?.phone || "",
    }
  } catch (error) {
    console.warn("Impossible de relire les informations d'authentification locales:", error)
    return null
  }
}
