"use client"

import Image from "next/image"
import { ArrowRight, Clock, Cloud, Code, Database, Globe, Laptop, ShieldCheck, UserCheck, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getPublicMediaUrl } from "@/lib/public-api"

const ICONS = { 1: Laptop, 2: Database, 3: Globe, 4: Users, 5: Cloud, 6: Code, 7: ShieldCheck }

export default function TrainingCards({ items, onSelect }) {
  return <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
    {items.map((training) => {
      const Icon = ICONS[training.legacyId] || Laptop
      return <Card key={training.code} className="flex h-full flex-col overflow-hidden border-t-4 border-[#ff7900] transition-all hover:shadow-lg">
        {training.imageUrl && <div className="relative h-44"><Image src={getPublicMediaUrl(training.imageUrl)} alt={training.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /></div>}
        <CardHeader className="pb-2">
          <div className="mb-2 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#ff7900] text-white"><Icon className="h-6 w-6" /></div>
            <CardTitle role="heading" aria-level={3} className="text-2xl font-bold leading-snug text-gray-900">{training.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grow">
          <CardDescription className="mb-4 text-base">{training.description}</CardDescription>
          <div className="mt-4 space-y-3 text-sm text-gray-800 dark:text-gray-400">
            <div className="flex items-center"><Clock size={16} className="mr-2 shrink-0 text-[#ff7900]" />{training.duration}</div>
            {training.level && <div className="flex items-center"><UserCheck size={16} className="mr-2 shrink-0 text-[#ff7900]" />{training.level}</div>}
            {training.careers && <div className="flex items-center"><Icon size={16} className="mr-2 shrink-0 text-[#ff7900]" /><span className="line-clamp-1">{training.careers.split(",")[0]}</span></div>}
          </div>
        </CardContent>
        <CardFooter className="pb-4 pt-2"><Button className="w-full bg-[#ff7900] text-white hover:bg-[#e56d00]" onClick={() => onSelect(training)}>
          En savoir plus <ArrowRight className="ml-2 h-4 w-4" />
        </Button></CardFooter>
      </Card>
    })}
  </div>
}
