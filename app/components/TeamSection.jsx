'use client'

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export default function TeamSection({ team }) {
  return (
    <section className="bg-gray-50 py-16 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Notre Équipe</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Rencontrez l'équipe dédiée qui accompagne les startups dans leur développement.
          </p>
        </div>

        <div className="mt-12">
          <div className="relative overflow-hidden">
            <div className="flex animate-[scroll_30s_linear_infinite] hover:[animation-play-state:paused]">
              {[...team, ...team].map((member, index) => (
                <div 
                  key={index} 
                  className="flex-none w-[300px] px-4"
                >
                  <Card className="overflow-hidden h-full">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="relative h-32 w-32 overflow-hidden rounded-full">
                          <Image
                            src={member.image}
                            alt={member.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">{member.name}</h3>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 