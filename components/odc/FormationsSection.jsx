"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Laptop, Globe, Database, Users, Cloud, Clock, UserCheck, Code, LineChart, ShieldCheck } from "lucide-react"
import FormationDetails from "@/components/odc/FormationDetails"
import odcFormations from "@/data/odcFormations"

export default function FormationsSection() {
  const [selectedFormation, setSelectedFormation] = useState(null)

  const handleFormationClick = (formation) => {
    setSelectedFormation(formation)
  }

  const handleCloseFormationDetails = () => {
    setSelectedFormation(null)
  }

  return (
    <>
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {odcFormations.map((formation, index) => (
          <Card
            key={index}
            className="flex flex-col h-full hover:shadow-lg transition-all overflow-hidden border-t-4 border-[#ff7900]"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-4 mb-2">
                <div className="min-w-14 min-h-14 w-14 h-14 rounded-full bg-[#ff7900] flex items-center justify-center text-white shadow-md">
                  {formation.id === 1 ? (
                    <Laptop className="h-6 w-6" />
                  ) : formation.id === 2 ? (
                    <Globe className="h-6 w-6" />
                  ) : formation.id === 3 ? (
                    <Database className="h-6 w-6" />
                  ) : formation.id === 4 ? (
                    <Users className="h-6 w-6" />
                  ) : (
                    <Cloud className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl font-bold text-gray-900 leading-snug">
                    {formation.title}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grow">
              <CardDescription className="text-base mb-4">{formation.description}</CardDescription>
              <div className="space-y-3 mt-4">
                <div className="flex items-center text-sm text-gray-800 dark:text-gray-400">
                  <Clock size={16} className="mr-2 text-[#ff7900]" />
                  <span>{formation.duration}</span>
                </div>
                <div className="flex items-center text-sm text-gray-800 dark:text-gray-400">
                  <UserCheck size={16} className="mr-2 text-[#ff7900]" />
                  <span>{formation.level}</span>
                </div>
                <div className="flex items-center text-sm text-gray-800 dark:text-gray-400">
                  {formation.id === 1 ? (
                    <Code size={16} className="mr-2 text-[#ff7900]" />
                  ) : formation.id === 2 ? (
                    <Globe size={16} className="mr-2 text-[#ff7900]" />
                  ) : formation.id === 3 ? (
                    <LineChart size={16} className="mr-2 text-[#ff7900]" />
                  ) : formation.id === 4 ? (
                    <Users size={16} className="mr-2 text-[#ff7900]" />
                  ) : (
                    <ShieldCheck size={16} className="mr-2 text-[#ff7900]" />
                  )}
                  <span className="line-clamp-1">{formation.careers.split(",")[0]}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2 pb-4">
              <Button
                className="w-full bg-[#ff7900] hover:bg-[#e56d00] text-white"
                onClick={() => handleFormationClick(formation)}
              >
                En savoir plus <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {selectedFormation && <FormationDetails formation={selectedFormation} onClose={handleCloseFormationDetails} />}
    </>
  )
}
