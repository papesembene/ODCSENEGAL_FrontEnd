import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormSubmissionError } from "@/components/ui/form-feedback"
import {
  StartupCandidatureSuccessState,
  StartupInfoTab,
  StartupProgressSteps,
} from "../ui-sections"

export default function StartupCandidatureFormShell({
  isSubmitted,
  submitError,
  step,
  onSubmit,
  children,
}) {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <Link href="/startups" className="flex items-center text-orange-500 hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'espace Startups
          </Link>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Candidature Startup Lab
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Postulez pour rejoindre notre programme d'accompagnement pour startups en phase d'idéation et de prototypage.
          </p>
        </div>

        <Tabs defaultValue="apply" className="mt-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="apply">Candidature</TabsTrigger>
            <TabsTrigger value="info">Informations</TabsTrigger>
          </TabsList>

          <TabsContent value="apply">
            {isSubmitted ? (
              <StartupCandidatureSuccessState />
            ) : (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Formulaire de candidature</CardTitle>
                  <CardDescription>
                    Veuillez remplir tous les champs obligatoires marqués d'un astérisque (*).
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormSubmissionError message={submitError} />
                  <StartupProgressSteps step={step} />
                  <form onSubmit={onSubmit}>{children}</form>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="info">
            <StartupInfoTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
