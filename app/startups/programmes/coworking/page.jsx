"use client";

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowRight, CheckCircle, Wifi, Coffee, Monitor, Users, Clock, Calendar, Check, AlertCircle } from 'lucide-react'

export default function CoworkingPage() {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")
  const spaces = [
    {
      id: 1,
      name: "Espace de Coworking",
      description:
        "Un espace de travail partagé pour les startups accompagnées, avec des postes de travail dédiés, des salles de réunion et un accès Internet haut débit.",
      image: "/images/even4.jpg",
      features: [
        "Postes de travail dédiés",
        "Salles de réunion équipées",
        "Internet haut débit",
        "Espace détente",
        "Accès 24/7",
        "Imprimante et scanner",
      ],
      capacity: "30 postes de travail",
      hours: "24/7 pour les startups accompagnées",
    },
    {
      id: 2,
      name: "5G Lab",
      description:
        "Un laboratoire dédié à l'expérimentation et au test de solutions utilisant la technologie 5G, avec des équipements spécialisés et une expertise technique.",
      image: "/images/5g.webp",
      features: [
        "Équipements 5G",
        "Environnement de test",
        "Expertise technique",
        "Accompagnement spécialisé",
        "Démonstration de cas d'usage",
        "Partenariats industriels",
      ],
      capacity: "10 postes de travail",
      hours: "9h-18h du lundi au vendredi",
    },
  ]

  const services = [
    {
      id: 1,
      name: "Mentorat",
      description:
        "Bénéficiez d'un accompagnement personnalisé par des experts du secteur numérique pour vous aider à développer votre projet.",
      image: "/images/mentorat.jpg",
      link: "/startups/services/mentorat",
    },
    {
      id: 2,
      name: "Expertise technique",
      description:
        "Accédez à des experts techniques dans différents domaines (développement, UX/UI, marketing digital, etc.) pour vous aider à résoudre des problèmes spécifiques.",
      image: "/images/design.jpg",
      link: "/startups/services/expertise",
    },
    {
      id: 3,
      name: "Mise en relation",
      description:
        "Nous vous mettons en relation avec des partenaires, clients potentiels, investisseurs et autres acteurs de l'écosystème.",
      image: "/images/relation.jpg",
      link: "/startups/services/mise-en-relation",
    },
    {
      id: 4,
      name: "Communication",
      description:
        "Bénéficiez de notre support en communication pour augmenter la visibilité de votre startup (réseaux sociaux, presse, événements).",
      image: "/images/com.webp",
      link: "/startups/services/communication",
    },
  ]
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    phone: "",
    resource: "",
    date: "",
    time: "",
    details: "",
    terms: false
  });

  // Fonction de validation d'email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Fonction pour filtrer les caractères non-numériques du téléphone
  const handlePhoneInput = (e) => {
    const allowedKeys = ["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight"]
    if (allowedKeys.includes(e.key) || (e.key >= "0" && e.key <= "9")) {
      return true
    }
    e.preventDefault()
    return false
  }

  // Fonction pour nettoyer la valeur du téléphone
  const cleanPhoneValue = (value) => {
    return value.replace(/[^0-9]/g, "")
  }

  // Fonction pour gérer les changements de champs
  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target
    let processedValue = value

    // Nettoyer la valeur du téléphone
    if (id === "phone") {
      processedValue = cleanPhoneValue(value)
    }

    // Validation email en temps réel
    if (id === "email") {
      if (value.trim() !== "" && !validateEmail(value)) {
        setEmailError("Veuillez saisir une adresse email valide (ex: nom@domaine.com)")
      } else {
        setEmailError("")
      }
    }

    setFormData(prev => ({
      ...prev,
      [id]: type === "checkbox" ? checked : processedValue
    }))
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation finale avant soumission
    if (!validateEmail(formData.email)) {
      setEmailError("Veuillez saisir une adresse email valide")
      return
    }

    const payload = {
      startupName: formData.name,
      contactPerson: formData.contact,
      email: formData.email,
      phone: formData.phone,
      resource: formData.resource,
      requestedDate: formData.date,
      requestedTime: formData.time,
      details: formData.details,
      acceptTerms: formData.terms,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/resources/request-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        // Reset form data
        setFormData({
          name: "",
          contact: "",
          email: "",
          phone: "",
          resource: "",
          date: "",
          time: "",
          details: "",
          terms: false
        });
        setEmailError("");
      } else {
        alert("Erreur : " + data.error);
      }
    } catch (err) {
      alert("Erreur de soumission : " + err.message);
    }
  };
  
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        <Image
          src="/images/even5.jpg"
          alt="Espace Coworking"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="container relative z-10 mx-auto flex h-full items-center px-4">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">Espaces et Ressources</h1>
            <p className="mt-4 text-lg sm:text-xl">
              Accédez à nos espaces de travail et ressources pour développer votre startup dans les meilleures
              conditions.
            </p>
            <div className="mt-8">
              
            </div>
          </div>
        </div>
      </section>

      {/* Spaces Section */}
      <section className="bg-white py-16 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Nos Espaces</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Découvrez nos différents espaces de travail et de prototypage mis à disposition des startups accompagnées.
            </p>
          </div>

          <div className="mt-12">
            <Tabs defaultValue={spaces[0].id.toString()} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                {spaces.map((space) => (
                  <TabsTrigger key={space.id} value={space.id.toString()}>
                    {space.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              {spaces.map((space) => (
                <TabsContent key={space.id} value={space.id.toString()} className="mt-6">
                  <Card>
                    <div className="grid md:grid-cols-2">
                      <div className="relative h-64 md:h-auto">
                        <Image src={space.image || "/placeholder.svg"} alt={space.name} fill className="object-cover" />
                      </div>
                      <div className="p-6">
                        <h3 className="text-2xl font-bold">{space.name}</h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">{space.description}</p>

                        <div className="mt-6 grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Users className="h-5 w-5 text-orange-1" />
                            <span>{space.capacity}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-5 w-5 text-orange-1" />
                            <span>{space.hours}</span>
                          </div>
                        </div>

                        <h4 className="mt-6 font-semibold">Équipements et services</h4>
                        <ul className="mt-2 grid grid-cols-2 gap-2">
                          {space.features.map((feature, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-8">
                          
                        </div>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="bg-gray-50 py-16 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Équipements et Services
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Tous nos espaces sont équipés pour vous offrir un environnement de travail optimal.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-4">
            <Card className="flex flex-col items-center text-center">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Wifi className="h-12 w-12 text-orange-1" />
                  <CardTitle>Internet Haut Débit</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Connexion fibre optique ultra-rapide et sécurisée dans tous nos espaces.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="flex flex-col items-center text-center">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Monitor className="h-12 w-12 text-orange-1" />
                  <CardTitle className="mt-4">Équipements Modernes</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Postes de travail ergonomiques, écrans, imprimantes et matériel de visioconférence.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="flex flex-col items-center text-center">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Users className="h-12 w-12 text-orange-1" />
                  <CardTitle className="mt-4">Salles de Réunion</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Espaces dédiés pour vos réunions d'équipe, rendez-vous clients ou sessions de brainstorming.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="flex flex-col items-center text-center">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Coffee className="h-12 w-12 text-orange-1" />
                  <CardTitle className="mt-4">Espace Détente</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Zone de pause avec café, thé et snacks pour vous ressourcer entre deux sessions de travail.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-white py-16 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Services Additionnels
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              En plus des espaces physiques, nous proposons une gamme de services pour vous accompagner dans le
              développement de votre startup.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <Card key={service.id} className="overflow-hidden transition-all hover:shadow-lg">
                <div className="relative h-48">
                  <Image src={service.image || "/placeholder.svg"} alt={service.name} fill className="object-cover" />
                </div>
                <CardHeader>
                  <CardTitle>{service.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{service.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="bg-white py-16 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              FAQ
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Vous avez des questions sur nos espaces et ressources ? Consultez notre FAQ.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Qui peut accéder aux espaces ?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Les espaces sont réservés aux startups accompagnées par Orange Startup Studio. Si vous n'êtes pas
                  encore accompagné, vous pouvez postuler à l'un de nos programmes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Les espaces sont-ils gratuits ?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Oui, l'accès aux espaces est gratuit pour les startups accompagnées par Orange Startup Studio, dans la
                  limite des places disponibles.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comment réserver une salle de réunion ?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Vous pouvez réserver une salle de réunion via le formulaire de demande d'accès ou directement depuis
                  votre tableau de bord si vous êtes déjà une startup accompagnée.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Puis-je utiliser l'adresse pour mon entreprise ?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Oui, les startups accompagnées peuvent utiliser l'adresse d'Orange Digital Center comme adresse
                  professionnelle pendant la durée de l'accompagnement.
                </p>
              </CardContent>
            </Card>
          </div>
          {/* <div className="mt-12 text-center">
            <Button asChild variant="outline">
              <Link href="/startups/faq">
                Voir toutes les questions <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div> */}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-orange-1 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Prêt à rejoindre notre communauté ?</h2>
            <p className="mt-4 text-lg">
              Postulez à l'un de nos programmes d'accompagnement et bénéficiez de l'accès à nos espaces et ressources.
            </p>
            <div className="mt-8">
              <Button asChild variant="secondary" size="lg">
                <Link href="/candidatures/fermees">
                  Postuler maintenant <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
