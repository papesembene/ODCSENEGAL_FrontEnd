"use client"

import Link from "@/components/ui/interactive-link"
import Image from "next/image"
import PublicPageHero from "@/components/public-page-hero"
import {
  ArrowRight,
  Award,
  BookMarked,
  BookOpen,
  Building,
  Cloud,
  Code,
  Database,
  Globe,
  GraduationCap,
  Laptop,
  Lightbulb,
  LineChart,
  Rocket,
  ShieldCheck,
  UserCheck,
  Users,
  Clock,
  PenToolIcon as Tool,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import CandidatureButton from "@/components/candidatures/candidature-button"
import { useCandidatureStatus } from "@/components/candidatures/candidature-status-provider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const ICONS = {
  award: Award,
  bookMarked: BookMarked,
  bookOpen: BookOpen,
  building: Building,
  cloud: Cloud,
  code: Code,
  database: Database,
  globe: Globe,
  graduationCap: GraduationCap,
  laptop: Laptop,
  lightbulb: Lightbulb,
  lineChart: LineChart,
  rocket: Rocket,
  shieldCheck: ShieldCheck,
  tool: Tool,
  userCheck: UserCheck,
  users: Users,
}

export function CompetencesHeroSection() {
  return (
    <PublicPageHero eyebrow="Apprendre et se révéler" title="Développement des Compétences Numériques"
      image="/hero.jpg?height=400&width=1200"
      description="Des formations gratuites et de qualité dans les métiers du numérique pour favoriser l'employabilité des jeunes Sénégalais et Etrangers.">
            <CandidatureButton label="Postuler maintenant" className={buttonVariants({ size: "lg", className: "bg-[#ff7900] text-white hover:bg-[#e56d00]" })} />
    </PublicPageHero>
  )
}

export function CompetencesMissionSection({ missionCards }) {
  return (
    <section className="bg-white py-16 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white sm:text-4xl">Notre Mission</h2>
          <p className="mt-6 text-lg leading-8 text-gray-800 dark:text-gray-300">
            Offrir aux jeunes Sénégalais des formations gratuites et de qualité dans les métiers du numérique,
            favorisant ainsi leur employabilité et leur insertion professionnelle.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {missionCards.map((card) => (
            <MissionCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function CompetencesImpactSection({ impactStats }) {
  return (
    <section className="bg-[#ff7900] py-16 text-white">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-4">
          {impactStats.map((stat) => (
            <ImpactCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function CodeSchoolSection({ benefits }) {
  return (
    <section className="bg-gray-50 py-16 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="relative h-64 overflow-hidden rounded-lg md:h-auto">
            <Image src="/code.jpg?height=400&width=600" alt="École du Code Sonatel Academy" fill className="object-cover" />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white">École du Code Sonatel Academy</h2>
            <p className="mt-4 text-lg text-gray-800 dark:text-gray-300">
              Première école de codage gratuite en Afrique de l'Ouest, l'École du Code Sonatel Academy forme les
              jeunes talents aux métiers du numérique à travers des programmes intensifs et pratiques.
            </p>
            <ul className="mt-6 space-y-4">
              {benefits.map((benefit) => (
                <CheckListItem key={benefit}>{benefit}</CheckListItem>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export function CompetencesFormationsSection({ formations, onFormationClick }) {
  return (
    <section className="bg-white py-16 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white sm:text-4xl">Nos Formations</h2>
          <p className="mt-4 text-lg text-gray-800 dark:text-gray-300">
            Découvrez notre catalogue de formations dans les métiers du numérique.
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {formations.map((formation) => (
            <FormationCard key={formation.id} formation={formation} onClick={() => onFormationClick(formation)} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function CompetencesValueChainSection({ programs }) {
  return (
    <section className="bg-gray-50 py-16 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white sm:text-4xl">Notre chaîne de valeur</h2>
          <p className="mt-4 text-lg text-gray-800 dark:text-gray-300">
            Découvrez nos différents programmes d'accompagnement et de formation.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {programs.map((program) => (
            <ValueChainCard key={program.title} program={program} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <div>
            <Button asChild size="lg" className="bg-orange-1 text-white hover:bg-orange-1 hover:text-white">
              <Link href="/odc/programmes">
                Découvrir nos programmes <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export function CompetencesCtaSection() {
  const availability = useCandidatureStatus()
  return (
    <section className="bg-[#ff7900] py-16 text-white">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Prêt à développer vos compétences ?</h2>
          <p className="mt-4 text-lg">
            {availability.canApply
              ? "Postulez dès maintenant à nos formations gratuites et lancez votre carrière dans le numérique."
              : availability.message}
          </p>
          <div className="mt-8">
            <div>
              <CandidatureButton label="Déposer ma candidature" className={buttonVariants({ size: "lg", className: "bg-black text-white hover:bg-black hover:text-white" })} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function MissionCard({ description, icon, title }) {
  const Icon = ICONS[icon]

  return (
    <Card>
      <div className="flex gap-4 p-6">
        <Icon className="h-12 w-12 shrink-0 text-[#ff7900]" />
        <div className="flex-1 overflow-hidden">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="pe-4">
            <p className="mt-2 text-base text-gray-600">{description}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}

function ImpactCard({ icon, label, value }) {
  const Icon = ICONS[icon]

  return (
    <div className="flex flex-col items-center rounded-lg bg-white/10 p-6 text-center backdrop-blur-sm">
      <div className="mb-4 rounded-full bg-white/30 p-3">
        <Icon className="h-8 w-8" />
      </div>
      <div className="text-4xl font-bold">{value}</div>
      <div className="mt-2">{label}</div>
    </div>
  )
}

function CheckListItem({ children }) {
  return (
    <li className="flex items-start space-x-3">
      <div className="rounded-full bg-orange-100 p-1 dark:bg-orange-900">
        <svg className="h-4 w-4 text-[#ff7900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span className="text-gray-800 dark:text-gray-300">{children}</span>
    </li>
  )
}

function FormationCard({ formation, onClick }) {
  const FormationIcon = getFormationIcon(formation.id, "lg")
  const CareerIcon = getCareerIcon(formation.id)

  return (
    <Card className="flex h-full flex-col overflow-hidden border-t-4 border-[#ff7900] transition-all hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="mb-2 flex items-center gap-4">
          <div className="flex h-14 w-14 min-h-14 min-w-14 items-center justify-center rounded-full bg-[#ff7900] text-white shadow-md">
            <FormationIcon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-2xl font-bold leading-snug text-gray-900">{formation.title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grow">
        <CardDescription className="mb-4 text-base">{formation.description}</CardDescription>
        <div className="mt-4 space-y-3">
          <div className="flex items-center text-sm text-gray-800 dark:text-gray-400">
            <Clock size={16} className="mr-2 text-[#ff7900]" />
            <span>{formation.duration}</span>
          </div>
          <div className="flex items-center text-sm text-gray-800 dark:text-gray-400">
            <UserCheck size={16} className="mr-2 text-[#ff7900]" />
            <span>{formation.level}</span>
          </div>
          <div className="flex items-center text-sm text-gray-800 dark:text-gray-400">
            <CareerIcon size={16} className="mr-2 text-[#ff7900]" />
            <span className="line-clamp-1">{formation.careers.split(",")[0]}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pb-4 pt-2">
        <Button className="w-full bg-[#ff7900] text-white hover:bg-[#e56d00]" onClick={onClick}>
          En savoir plus <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

function ValueChainCard({ program }) {
  const Icon = ICONS[program.icon]

  return (
    <Card className="overflow-hidden border-t-4 border-[#ff7900] transition-all hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="mb-2 flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff7900] text-white">
            <Icon size={24} />
          </div>
          <div className="flex-1">
            <CardTitle className="text-2xl font-bold leading-snug text-gray-900">{program.title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{program.description}</CardDescription>
        <div className="mt-4 border-t border-gray-100 pt-4">
          <ul className="space-y-2">
            {program.bullets.map((bullet) => (
              <li key={bullet} className="flex items-center text-sm text-gray-800">
                <div className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-100">
                  <span className="text-xs font-bold text-[#ff7900]">✓</span>
                </div>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

function getFormationIcon(id, size = "sm") {
  const iconMap = {
    1: Laptop,
    2: Globe,
    3: Database,
    4: Users,
    5: Cloud,
  }

  return iconMap[id] || Laptop
}

function getCareerIcon(id) {
  const iconMap = {
    1: Code,
    2: Globe,
    3: LineChart,
    4: Users,
    5: ShieldCheck,
  }

  return iconMap[id] || Code
}
