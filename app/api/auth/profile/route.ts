import { type NextRequest, NextResponse } from "next/server"

// Mock data pour simuler une réponse du backend
const mockUserData = {
  id: "123456",
  email: "utilisateur@exemple.com",
  first_name: "Prénom",
  last_name: "Nom",
  profile_picture: "/placeholder.svg?height=200&width=200",
  oauth_provider: "google",
  profile_data: {
    phone: "0123456789",
    date_of_birth: "1990-01-01",
    place_of_birth: "Paris, France",
    gender: "male",
    nationality: "Française",
    region_of_residence: "Île-de-France",
    // Données spécifiques au type de profil
    profile_type: "student",
    institution: "Université de Paris",
    education_level: "bac+5",
    sector: "Informatique",
    motivations: "Développer mes compétences en programmation",
    interests: "Intelligence artificielle, développement web, cybersécurité",
  },
  files: {
    cv_file: "cv_exemple.pdf",
    cover_letter_file: "lettre_motivation_exemple.pdf",
  },
}

// Cette route API simule la récupération des données du profil
export async function GET(req: NextRequest) {
  try {
    // Simuler un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Vérifier l'authentification (simulation)
    const authHeader = req.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token d'authentification manquant ou invalide" }, { status: 401 })
    }

    // Retourner les données mock
    return NextResponse.json({
      success: true,
      profile: mockUserData,
    })
  } catch (error) {
    console.error("Erreur:", error)
    return NextResponse.json({ error: "Une erreur est survenue lors de la récupération du profil" }, { status: 500 })
  }
}

// Cette route API simule la mise à jour des données du profil
export async function PUT(req: NextRequest) {
  try {
    // Simuler un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Vérifier l'authentification (simulation)
    const authHeader = req.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token d'authentification manquant ou invalide" }, { status: 401 })
    }

    // Récupérer les données du formulaire (mais ne pas les traiter réellement)
    const formData = await req.formData()
    console.log("Données reçues:", Object.fromEntries(formData.entries()))

    // Retourner une réponse de succès avec les données mock mises à jour
    return NextResponse.json({
      success: true,
      message: "Profil mis à jour avec succès (simulation)",
      profile: {
        ...mockUserData,
        // Ajouter quelques données du formulaire pour simuler la mise à jour
        first_name: formData.get("first_name")?.toString() || mockUserData.first_name,
        last_name: formData.get("last_name")?.toString() || mockUserData.last_name,
      },
    })
  } catch (error) {
    console.error("Erreur:", error)
    return NextResponse.json({ error: "Une erreur est survenue lors de la mise à jour du profil" }, { status: 500 })
  }
}
