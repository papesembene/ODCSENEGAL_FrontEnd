"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, Laptop, Globe, Database, Users, Cloud } from "lucide-react"

const FormationCard = ({ formation, onClick }) => {
  // Descriptions courtes pour les cartes
  const shortDescriptions = {
    1: "Formation complète pour concevoir et développer des applications web et mobiles modernes.",
    2: "Devenez un expert de la transformation numérique et de la stratégie digitale en entreprise.",
    3: "Maîtrisez l'analyse, le traitement et la visualisation des données pour créer de la valeur.",
    4: "Formation 100% féminine pour acquérir des compétences digitales essentielles et créatives.",
    5: "Apprenez à concevoir, déployer et gérer des infrastructures cloud avec AWS.",
  }

  return (
    <Card
      className="overflow-hidden transition-all hover:shadow-lg border-t-4"
      style={{
        borderTopColor:
          formation.id === 1
            ? "#ff7900"
            : formation.id === 2
              ? "#ff7900"
              : formation.id === 3
                ? "#ff7900"
                : formation.id === 4
                  ? "#ff7900"
                  : "#ff7900",
      }}
    >
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
              formation.id === 1
                ? "bg-blue-500"
                : formation.id === 2
                  ? "bg-purple-500"
                  : formation.id === 3
                    ? "bg-green-500"
                    : formation.id === 4
                      ? "bg-pink-500"
                      : "bg-cyan-500"
            }`}
          >
            {formation.id === 1 ? (
              <Laptop className="h-5 w-5" />
            ) : formation.id === 2 ? (
              <Globe className="h-5 w-5" />
            ) : formation.id === 3 ? (
              <Database className="h-5 w-5" />
            ) : formation.id === 4 ? (
              <Users className="h-5 w-5" />
            ) : (
              <Cloud className="h-5 w-5" />
            )}
          </div>
          <CardTitle>{formation.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{shortDescriptions[formation.id]}</CardDescription>
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <Clock size={16} className="mr-2 text-orange-500" />
          <span>{formation.duration}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={() => onClick && onClick(formation)}>
          En savoir plus <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

export default FormationCard
