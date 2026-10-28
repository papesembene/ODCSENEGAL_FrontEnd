'use client';

import React, { useState } from 'react';
import Link from "@/components/ui/interactive-link"
import PublicPageHero from "@/components/public-page-hero"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, CheckCircle, Calendar, Clock, Users, Target, Code, Paintbrush, Building2, Users2, MessageSquare, CreditCard, Store, Handshake, Star } from "lucide-react"

const successStories = [
  {
    name: "Talibi",
    description: "Plateforme de mise en relation entre étudiants et professeurs particuliers",
    image: "/images/talibi.png",
    achievement: "Levée de fonds de 100M FCFA et plus de 10 000 utilisateurs actifs"
  },
  {
    name: "Maad",
    description: "Solution de distribution pour les commerçants informels",
    image: "/images/maad.jpg",
    achievement: "Plus de 5 000 commerçants actifs et expansion dans 3 pays"
  },
  {
    name: "Bay Seddo",
    description: "Service de paiement mobile et de transfert d'argent",
    image: "/images/bayseedo.png",
    achievement: "Plus de 1 million d'utilisateurs et intégration avec Orange Money"
  }
];

const benefits = [
  {
    title: "Ressources matérielles et financières",
    description: "Bénéficier d'un soutien financier mensuel afin de vous permettre d'être focus sur votre projet et vous procurer les premiers matériels pour réaliser votre prototype",
    icon: <Building2 className="h-10 w-10 text-orange-1" />
  },
  {
    title: "Coaching UX/UI design",
    description: "Bénéficier de l'expertise de nos coaches UX/UI pour mieux étudier les attentes et besoins de vos futurs clients. Vous prendrez en compte le ressenti des utilisateurs et ainsi améliorerez le parcours de vos utilisateurs pour le rendre plus agréable et instinctif.",
    icon: <Paintbrush className="h-10 w-10 text-orange-1" />
  },
  {
    title: "Coaching technique",
    description: "Support et conseil sur les technologies les plus adaptées à votre projet. Bénéficier du support des experts de SONATEL et des ressources mises à disposition jusqu'au niveau groupe.",
    icon: <Code className="h-10 w-10 text-orange-1" />
  }
];

const sonatelAdvantages = [
  {
    title: "Large clientèle",
    description: "La clientèle à travers les segments identifiés et une bonne connaissance de base",
    icon: <Users2 className="h-8 w-8 text-orange-1" />
  },
  {
    title: "Canaux de communication universels",
    description: "Voix mobile, SMS, USSD, etc... (via des API)",
    icon: <MessageSquare className="h-8 w-8 text-orange-1" />
  },
  {
    title: "Canaux de paiement de masse",
    description: "Services d'argent mobile et facturation par opérateurs. Processus de recouvrement des paiements faciles",
    icon: <CreditCard className="h-8 w-8 text-orange-1" />
  },
  {
    title: "Accès aux points de contact client",
    description: "Points de ventes physiques/en ligne, point de ramassage et de livraison",
    icon: <Store className="h-8 w-8 text-orange-1" />
  },
  {
    title: "Conseil et mentorat",
    description: "Support technique et commercial, courtage relationnel",
    icon: <Handshake className="h-8 w-8 text-orange-1" />
  },
  {
    title: "Exposition à la marque de confiance",
    description: "Visibilité et crédibilité",
    icon: <Star className="h-8 w-8 text-orange-1" />
  }
];

export default function StartupLabPage() {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <PublicPageHero eyebrow="De l'idée au projet" title="Startup Lab" image="/images/startupLabhome.jpeg"
        description="Diriger une startup peut être l'une des expériences les plus enrichissantes de votre carrière personnelle et professionnelle. Ce n'est bien sûr pas facile, mais nous vous fournissons les outils, les ressources, les connaissances et le réseau de soutien nécessaires pour vous aider à bâtir une startup réussie.">
              <Button asChild size="lg" className="bg-orange-1 hover:bg-orange-600 transition-colors duration-300">
                <Link href="/candidatures/fermees">
                   Rejoignez-nous <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
      </PublicPageHero>

      {/* About Section */}
      <section className="bg-white py-20 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div className="flex flex-col justify-center space-y-6">
              <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                À propos du programme
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                L'objectif du Startup Lab est de créer un environnement où les entrepreneurs ont les outils nécessaires et le temps pour se concentrer sur leur idée, développer un prototype, un MVP, un business model et trouver un Produit Market Fit.
              </p>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-3 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-1" />
                  <span className="font-medium">9 mois</span>
                </div>
                <div className="flex items-center space-x-3 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-1" />
                  <span className="font-medium">À Définir</span>
                </div>
                <div className="flex items-center space-x-3 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-orange-1" />
                  <span className="font-medium">À Définir</span>
                </div>
              </div>
            </div>
            <div className="relative h-[400px] w-full">
              <Image 
                src="/images/startuplab.png" 
                alt="Cycle de formation" 
                fill 
                className="object-contain transform hover:scale-105 transition-transform duration-500"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 py-20 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
              Les avantages du Startup Lab
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
            {benefits.map((benefit, index) => (
              <Card 
                key={index} 
                className="group bg-white dark:bg-gray-900 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 rounded-3xl overflow-hidden border-0"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl w-fit group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-colors duration-300">
                      {benefit.icon}
                    </div>
                    <CardTitle className="text-xl group-hover:text-orange-1 transition-colors duration-300">
                      {benefit.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {benefit.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SONATEL Advantages Section */}
      <section className="bg-white py-20 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
              Cadre de synergie
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
            {sonatelAdvantages.map((advantage, index) => (
              <div 
                key={index}
                className="group bg-white dark:bg-gray-900 p-6 rounded-3xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl w-fit group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-colors duration-300">
                    {advantage.icon}
                  </div>
                  <h3 className="text-xl font-semibold group-hover:text-orange-1 transition-colors duration-300">
                    {advantage.title}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {advantage.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cycle de formation Section */}
      {/* <section className="bg-white py-16 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Cycle de formation
            </h2>
          </div>
          <div className="mt-12 relative h-[400px] w-full max-w-4xl mx-auto">
            <Image 
              src="/images/startuplab.png" 
              alt="Cycle de formation montrant l'accord de valeur de l'accompagnement, le prototypage et le product market fit" 
              fill 
              className="object-contain"
              priority
            />
          </div>
        </div>
      </section> */}

      {/* Success Stories Section */}
      <section className="bg-white py-16 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Porte Feuille startup Lab
            </h2>
          </div>

          <div className="max-w-3xl mx-auto" role="region" aria-label="Startups accompagnées" aria-roledescription="carrousel">
            <div className="overflow-hidden rounded-xl shadow-lg">
              <div className="flex transition-transform duration-500 ease-out motion-reduce:transition-none" style={{ transform: `translateX(-${currentStoryIndex * 100}%)` }}>
                {successStories.map((story, index) => (
                  <div key={index} className="min-w-full" aria-hidden={currentStoryIndex !== index}>
                    <div className="grid md:grid-cols-2">
                      <div className="relative h-60">
                        <Image
                          src={story.image}
                          alt={story.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-6 bg-white dark:bg-gray-900 flex flex-col justify-center">
                        <h3 className="text-xl font-bold mb-2">{story.name}</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{story.description}</p>
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                          <p className="text-green-800 dark:text-green-200 text-sm">{story.achievement}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center mt-4 gap-2">
              {successStories.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStoryIndex(index)}
                  aria-label={`Afficher ${successStories[index].name}`}
                  aria-current={currentStoryIndex === index ? "true" : undefined}
                  className="flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-orange-500"
                >
                  <span aria-hidden="true" className={`h-2 rounded-full transition-all duration-300 motion-reduce:transition-none ${
                    currentStoryIndex === index 
                      ? 'bg-orange-1 w-4' 
                      : 'bg-gray-300 w-2'
                  }`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-linear-to-r/srgb from-orange-1 to-orange-600 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center text-white">
            <h2 className="text-4xl font-bold mb-6">Prêt à lancer votre startup ?</h2>
            <p className="text-xl mb-8">
              Rejoignez le Startup Lab et bénéficiez de tous les avantages pour faire décoller votre projet
            </p>
            <div>
              <Button asChild size="lg" variant="secondary" className="bg-[#0F172A] text-[#F1F5F9] hover:bg-[#0F172A] hover:text-[#F1F5F9] transition-colors duration-300">
                <Link href="/candidatures/fermees">
                  Postuler maintenant <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
