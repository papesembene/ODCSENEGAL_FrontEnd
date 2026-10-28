"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "@/components/ui/interactive-link"
import { ArrowRight, Settings, ShieldCheck, UserCog, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const parameterModules = [
  {
    title: "Profils administrateurs",
    description:
      "Créez et gérez les accès internes : Community Manager, compétences, startups et super admin.",
    noteTitle: "Gestion des accès internes",
    noteDescription:
      "Créez les comptes administrateurs, activez ou désactivez les accès, sans mélanger avec les membres du jury.",
    href: "/astrodmin/parametres/profils-admin",
    badge: "Super admin",
    icon: UserCog,
    allowedTypes: ["super_admin"],
  },
  {
    title: "Inscription des rôles jury",
    description:
      "Préparez les personnes qui pourront être affectées aux créneaux d'entretien : filtre, validation et motivation.",
    noteTitle: "Membres du jury",
    noteDescription:
      "Enregistrez uniquement les personnes qui interviennent dans les entretiens : filtreur, validateur ou jury motivation.",
    href: "/astrodmin/parametres/inscription-roles-jury",
    badge: "Disponible",
    icon: Users,
    allowedTypes: ["competences", "super_admin"],
  },
]

export default function ParametresPage() {
  const [adminType, setAdminType] = useState("")

  useEffect(() => {
    setAdminType(localStorage.getItem("admin_type") || "")
  }, [])

  const visibleModules = useMemo(
    () => parameterModules.filter((module) => module.allowedTypes.includes(adminType)),
    [adminType],
  )

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Paramètres</h1>
            <p className="text-sm text-muted-foreground">
              Configurez les éléments d&apos;administration utiles au pilotage des entretiens et des campagnes.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {visibleModules.map((module) => {
          const Icon = module.icon

          return (
            <Card key={module.href} className="border-orange-100 dark:border-orange-950/40">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>{module.title}</CardTitle>
                      <CardDescription className="mt-1">{module.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">{module.badge}</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    {module.noteTitle}
                  </div>
                  <p className="mt-2">{module.noteDescription}</p>
                </div>

                <Button asChild className="w-full sm:w-auto">
                  <Link href={module.href}>
                    Ouvrir
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </section>
    </div>
  )
}
