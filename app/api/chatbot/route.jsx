import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { message } = await request.json()

    // Simple rule-based responses
    let response
    const lowercaseMessage = message.toLowerCase()

    if (
      lowercaseMessage.includes("formation") ||
      lowercaseMessage.includes("apprendre") ||
      lowercaseMessage.includes("cours")
    ) {
      response =
        "Nous proposons plusieurs formations gratuites dans les métiers du numérique. Vous pouvez consulter notre catalogue de formations sur la page Développement des Compétences. Souhaitez-vous que je vous oriente vers une formation spécifique ?"
    } else if (
      lowercaseMessage.includes("startup") ||
      lowercaseMessage.includes("entreprendre") ||
      lowercaseMessage.includes("projet")
    ) {
      response =
        "Orange Startup Studio accompagne les startups à tous les stades de développement. Nous proposons des programmes d'accélération, du mentorat, et même des possibilités de financement. Vous pouvez en savoir plus dans la section Accompagnement Startups."
    } else if (
      lowercaseMessage.includes("adresse") ||
      lowercaseMessage.includes("où") ||
      lowercaseMessage.includes("localisation")
    ) {
      response =
        "Orange Digital Center Sénégal est situé à Dakar. Vous pouvez nous rendre visite du lundi au vendredi de 9h à 18h. N'hésitez pas à prendre rendez-vous via notre page Contact."
    } else if (
      lowercaseMessage.includes("événement") ||
      lowercaseMessage.includes("atelier") ||
      lowercaseMessage.includes("hackathon")
    ) {
      response =
        "Nous organisons régulièrement des événements comme des ateliers, des conférences et des hackathons. Consultez notre calendrier d'événements pour ne rien manquer !"
    } else {
      response =
        "Je ne sais pas encore répondre à cette question. Pourriez-vous reformuler ou me poser une question sur nos formations, nos programmes d'accompagnement pour startups, nos événements ou nos coordonnées ?"
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Error in chatbot API:", error)
    return NextResponse.json({ error: "Une erreur est survenue lors du traitement de votre demande." }, { status: 500 })
  }
}
