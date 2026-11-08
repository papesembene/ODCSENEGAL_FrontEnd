"use client"

import { Clock, Calendar, X, Laptop, Globe, Database, Users, Cloud } from "lucide-react"

const FormationDetails = ({ formation, sites = [], onClose }) => {
  const {
    legacyId: id,
    title,
    description,
    skills,
    careers,
    duration,
    startDate = "Prochainement",
    endDate = "À déterminer",
    level,
  } = formation

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center text-white ${
                id === 1
                  ? "bg-blue-500"
                  : id === 2
                    ? "bg-purple-500"
                    : id === 3
                      ? "bg-green-500"
                      : id === 4
                        ? "bg-pink-500"
                        : "bg-cyan-500"
              }`}
            >
              {id === 1 ? (
                <Laptop className="h-6 w-6" />
              ) : id === 2 ? (
                <Globe className="h-6 w-6" />
              ) : id === 3 ? (
                <Database className="h-6 w-6" />
              ) : id === 4 ? (
                <Users className="h-6 w-6" />
              ) : (
                <Cloud className="h-6 w-6" />
              )}
            </div>
            <div>
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700">{level}</span>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Clock size={16} className="mr-2 text-[#ff7900]" />
                <span>{duration}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Description</h4>
              <p className="text-gray-700">{description}</p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Objectifs de la formation</h4>
              <ul className="space-y-2">
                {skills.map((skill, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-[#ff7900] mr-2 font-bold">•</span>
                    <span className="text-gray-700">{skill}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Débouchés professionnels</h4>
              <p className="text-gray-700">{careers}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Informations pratiques</h4>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock size={16} className="mr-2 text-[#ff7900]" />
                  <span>{duration || "Durée inconnue"}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar size={16} className="mr-2 text-[#ff7900]" />
                  <span>Début : {startDate || "Inconnue"}</span>
                  <span className="ml-4">Fin : {endDate || "Inconnue"}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2 font-medium text-gray-700">Niveau requis :</span>
                  <span>{level}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2 font-medium text-gray-700">Sites de formation :</span>
                  <span>{sites.length ? sites.join(", ") : "Aucun site renseigné"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FormationDetails
