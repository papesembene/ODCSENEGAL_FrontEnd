"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "@/components/ui/interactive-link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, Calendar, Clock, MapPin, Check } from "lucide-react"
import { EventDetails } from "@/app/startups/evenements/eventComponents/EventDetailsDialog"

export default function HomeEventsSection({ upcomingEvents }) {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showRegistration, setShowRegistration] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  })
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case "pitch":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "formation":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "workshop":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "hackathon":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "conférence":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "networking":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Form data:", formData)
    setRegistrationSuccess(true)
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      message: "",
    })
    setTimeout(() => {
      setShowRegistration(false)
      setRegistrationSuccess(false)
      setSelectedEvent(null)
    }, 3000)
  }

  if (!upcomingEvents || upcomingEvents.length === 0) {
    return null
  }

  return (
    <section className="bg-white py-16 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Événements à Venir
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Participez à nos événements pour développer vos compétences et élargir votre réseau.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/startups/evenements">
              Tous les événements <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {upcomingEvents.slice(0, 3).map((event) => (
            <Card key={event.id} className="overflow-hidden transition-all hover:shadow-lg">
              <div className="relative h-48">
                <Image
                  src={event.image || "/placeholder-event.jpg"}
                  alt={event.title || "Image de l'événement"}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder-event.jpg"
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t/srgb from-black/70 to-transparent p-4">
                  <Badge className={getCategoryColor(event?.category)}>
                    {event?.category || "Événement"}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                <CardDescription className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>
                      {event.date
                        ? new Date(event.date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "Date à confirmer"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{event.time || "Heure à confirmer"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{event.location || "Lieu à préciser"}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 line-clamp-3">{event.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setSelectedEvent(event)}>
                  Détails <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={() => {
                    setSelectedEvent(event)
                    setShowRegistration(true)
                  }}
                >
                  S'inscrire
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Event Details Dialog */}
      <EventDetails
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRegister={() => setShowRegistration(true)}
        showRegisterButton={true}
      />

      {/* Registration Dialog */}
      <Dialog open={showRegistration} onOpenChange={setShowRegistration}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inscription à l'événement</DialogTitle>
            <DialogDescription>Remplissez le formulaire ci-dessous pour vous inscrire à l'événement.</DialogDescription>
          </DialogHeader>
          {registrationSuccess ? (
            <div className="p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Inscription réussie !</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Merci pour votre inscription. Vous recevrez bientôt un email de confirmation.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Entreprise</Label>
                  <Input id="company" name="company" value={formData.company} onChange={handleInputChange} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message (optionnel)</Label>
                <Textarea id="message" name="message" value={formData.message} onChange={handleInputChange} rows={4} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRegistration(false)}>
                  Annuler
                </Button>
                <Button type="submit">S&apos;inscrire</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
