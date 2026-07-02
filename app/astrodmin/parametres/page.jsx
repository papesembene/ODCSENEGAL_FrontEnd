"use client"

import Link from "next/link"
import { ArrowRight, Settings, ShieldCheck, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const parameterModules = [
  {
    title: "Inscription des rôles jury",
    description:
      "Préparez l'affectation des trois rôles requis pour compléter un créneau d'entretien : filtre, validation et motivation.",
    href: "/astrodmin/parametres/inscription-roles-jury",
    badge: "Disponible",
    icon: Users,
  },
]

export default function ParametresPage() {
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
        {parameterModules.map((module) => {
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
                    Gestion initiale des membres du jury
                  </div>
                  <p className="mt-2">
                    Cette section servira de point d&apos;entrée pour enregistrer les personnes pouvant occuper chaque
                    rôle dans les entretiens.
                  </p>
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
