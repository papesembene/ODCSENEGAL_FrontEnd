"use client"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const ProgrammeCard = ({ programme }) => {
  const { id, title, description, icon, link } = programme
  const [showDetails, setShowDetails] = useState(false)

  // Charger dynamiquement le composant approprié en fonction de l'ID
  const handleShowDetails = () => {
    setShowDetails(true)
    // Rediriger vers la page détaillée
    window.location.href = link
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="h-2 bg-[#ff7900]"></div>
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-[#ff7900]/10 flex items-center justify-center text-[#ff7900]">
            {icon}
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6 line-clamp-3">{description}</p>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <Button onClick={handleShowDetails} className="bg-[#ff7900] hover:bg-[#e66f00] w-full md:w-auto">
            En savoir plus <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ProgrammeCard
