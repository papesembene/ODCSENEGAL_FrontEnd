import Link from "@/components/ui/interactive-link"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormSubmissionError } from "@/components/ui/form-feedback"
import { OrangeFabInfoTab, OrangeFabProgressSteps, OrangeFabSuccessState } from "../ui-sections"

export default function OrangeFabFormShell({
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
            Candidature Orange Fab
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Postulez pour rejoindre notre programme d'accompagnement pour startups en phase d'idéation et de
            prototypage.
          </p>
        </div>

        <Tabs defaultValue="apply" className="mt-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="apply">Candidature</TabsTrigger>
            <TabsTrigger value="info">Informations</TabsTrigger>
          </TabsList>

          <TabsContent value="apply">
            {isSubmitted ? (
              <OrangeFabSuccessState />
            ) : (
              <section className="py-16 bg-gray-50 dark:bg-gray-800">
                <div className="container mx-auto px-4">
                  <Card className="max-w-4xl mx-auto">
                    <CardHeader>
                      <CardTitle>Formulaire de candidature</CardTitle>
                      <CardDescription>
                        Veuillez remplir ce formulaire pour postuler au programme Orange Fab. Les champs marqués d'un
                        astérisque (<span className="text-red-500">*</span>) sont obligatoires.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormSubmissionError message={submitError} />
                      <OrangeFabProgressSteps step={step} />
                      <form onSubmit={onSubmit}>{children}</form>
                    </CardContent>
                  </Card>
                </div>
              </section>
            )}
          </TabsContent>

          <TabsContent value="info">
            <OrangeFabInfoTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
