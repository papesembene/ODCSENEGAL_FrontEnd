"use client"

import Image from "next/image"
import Link from "next/link"
import { useDropzone } from "react-dropzone"
import { ArrowRight, Calendar, Check, ChevronLeft, ChevronRight, Clock, Filter, Loader2, MapPin, Upload, Users, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { EventDetails } from "./eventComponents/EventDetailsDialog"
import {
  getCategoryColor,
  getDaysInMonth,
  getFirstDayOfMonth,
  MONTHS,
  WEEK_DAYS,
} from "./events-page-utils"

function EventCard({ event, onOpenDetails, onOpenRegistration }) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="relative h-48">
        <img
          src={event.image?.startsWith("http") ? event.image : `${process.env.NEXT_PUBLIC_API_URL}${event.image}`}
          alt="Image événement"
          className="h-48 w-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t/srgb from-black/70 to-transparent p-4">
          <Badge className={getCategoryColor(event.category)}>{event.category}</Badge>
        </div>
      </div>
      <CardHeader>
        <CardTitle>{event.title}</CardTitle>
        <CardDescription className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span>{event.registration_count ?? 0} participant(s)</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 dark:text-gray-300">{event.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => onOpenDetails(event)}>
          Détails <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button onClick={() => onOpenRegistration(event)}>S'inscrire</Button>
      </CardFooter>
    </Card>
  )
}

export function EventsHero() {
  return (
    <div className="mx-auto max-w-4xl text-center">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Événements</h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
        Découvrez les événements organisés par Orange Startup Studio pour les entrepreneurs et les startups.
      </p>
    </div>
  )
}

export function UpcomingEventsSection({
  events,
  selectedCategory,
  filterOptions,
  showCalendar,
  onToggleCalendar,
  onSelectCategory,
  onShowAddEvent,
  onOpenDetails,
  onOpenRegistration,
}) {
  return (
    <section className="mt-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Événements à venir</h2>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onShowAddEvent} className="bg-green-500 text-white hover:bg-green-600">
            Ajouter un événement
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filtres
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {filterOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  className={cn("cursor-pointer", selectedCategory === option.value && "bg-orange-50 dark:bg-orange-900")}
                  onClick={() => onSelectCategory(option.value)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" onClick={onToggleCalendar}>
            <Calendar className="mr-2 h-4 w-4" />
            Calendrier
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.length > 0 ? (
          events.map((event) => (
            <EventCard
              key={`${event.id}-${event.title}`}
              event={event}
              onOpenDetails={onOpenDetails}
              onOpenRegistration={onOpenRegistration}
            />
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Aucun événement {selectedCategory !== "all" ? `de type ${selectedCategory}` : ""} prévu pour le moment.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export function AddEventDialog({ open, eventForm, isSubmitting, onOpenChange, onFieldChange, onImageChange, onRemoveImage, onSubmit }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => onImageChange(acceptedFiles[0] || null),
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    maxFiles: 1,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-x-hidden overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un nouvel événement</DialogTitle>
          <DialogDescription>Remplissez les détails du nouvel événement ci-dessous.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input id="title" value={eventForm.title} onChange={(e) => onFieldChange("title", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Input id="category" value={eventForm.category} onChange={(e) => onFieldChange("category", e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={eventForm.description} onChange={(e) => onFieldChange("description", e.target.value)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" value={eventForm.date} onChange={(e) => onFieldChange("date", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Heure *</Label>
              <Input id="time" value={eventForm.time} onChange={(e) => onFieldChange("time", e.target.value)} placeholder="14:00 - 18:00" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Lieu *</Label>
              <Input id="location" value={eventForm.location} onChange={(e) => onFieldChange("location", e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Image de l'événement</Label>
            {eventForm.imagePreview ? (
              <div className="group relative">
                <img src={eventForm.imagePreview} alt="Preview" className="h-48 w-full rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={onRemoveImage}
                  className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white transition hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition hover:bg-gray-50 ${
                  isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center gap-2">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    {isDragActive ? "Déposez l'image ici..." : <>Glissez-déposez une image, ou <span className="text-blue-500">cliquez pour sélectionner</span></>}
                  </p>
                  <p className="text-xs text-gray-400">Formats supportés: JPG, PNG, WEBP (max 5MB)</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Détails</Label>
            <Textarea id="details" value={eventForm.details} onChange={(e) => onFieldChange("details", e.target.value)} rows={4} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agenda">Agenda (un élément par ligne)</Label>
            <Textarea
              id="agenda"
              value={eventForm.agenda}
              onChange={(e) => onFieldChange("agenda", e.target.value)}
              placeholder={"14:00 - Accueil des participants\n14:30 - Mot d'ouverture"}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="speakers">Intervenants (format: Nom | Rôle, un par ligne)</Label>
            <Textarea
              id="speakers"
              value={eventForm.speakers}
              onChange={(e) => onFieldChange("speakers", e.target.value)}
              placeholder={"Jean Dupont | Directeur\nMarie Martin | Investisseur"}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  En cours...
                </>
              ) : (
                "Ajouter l'événement"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function EventsCalendarDialog({ open, selectedMonth, selectedYear, allEvents, onOpenChange, onPreviousMonth, onNextMonth }) {
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth)
  const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth)
  const cells = []

  for (let index = 0; index < firstDay; index += 1) {
    cells.push(<div key={`empty-${index}`} className="h-8 border border-gray-200 dark:border-gray-800" />)
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dayEvents = allEvents.filter(
      (event) => event.year === selectedYear && event.month === selectedMonth && event.day === day,
    )

    cells.push(
      <div
        key={day}
        className={cn(
          "h-8 border border-gray-200 p-1 text-xs dark:border-gray-800",
          dayEvents.length > 0 && "bg-orange-50 dark:bg-orange-950",
        )}
      >
        {day}
      </div>,
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs p-2">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={onPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {MONTHS[selectedMonth]} {selectedYear}
            </span>
            <Button variant="ghost" size="sm" onClick={onNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mb-1 grid grid-cols-7 gap-1">
          {WEEK_DAYS.map((day) => (
            <div key={day} className="py-1 text-center text-xs font-medium">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{cells}</div>
      </DialogContent>
    </Dialog>
  )
}

export function NewsletterSection({ email, success, onChange, onSubmit }) {
  return (
    <section className="mt-16 rounded-lg bg-orange-500 p-8 dark:bg-black">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Restez informé des événements à venir</h2>
          <p className="mt-4 text-white/90">
            Inscrivez-vous à notre newsletter pour recevoir les dernières informations sur nos événements.
          </p>
          {success ? (
            <div className="mt-6 rounded-lg bg-white/10 p-4">
              <p className="text-white">
                Merci pour votre inscription ! Vous recevrez bientôt nos prochaines actualités.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 flex gap-4">
              <Input
                type="email"
                placeholder="Votre adresse email"
                className="max-w-sm border-white/20 bg-white text-black-500 placeholder:text-black-500/60"
                value={email}
                onChange={(e) => onChange(e.target.value)}
                required
              />
              <Button type="submit" className="bg-black text-orange-500 hover:bg-white/90">
                S'inscrire <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}
        </div>
        <div className="relative hidden md:block">
          <Image
            src="/images/oss.png"
            alt="Newsletter des événements"
            width={500}
            height={300}
            className="rounded-lg object-cover"
          />
        </div>
      </div>
    </section>
  )
}

export function EventRegistrationDialog({
  open,
  event,
  formData,
  success,
  onOpenChange,
  onFieldChange,
  onSubmit,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Inscription à l'événement</DialogTitle>
          <DialogDescription>
            Remplissez le formulaire ci-dessous pour vous inscrire à l&apos;événement.
          </DialogDescription>
        </DialogHeader>
        {success ? (
          <div className="p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Inscription réussie !</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Merci pour votre inscription. Vous recevrez bientôt un email de confirmation avec les détails de l&apos;événement.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet *</Label>
                <Input id="name" value={formData.name} onChange={(e) => onFieldChange("name", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => onFieldChange("email", e.target.value)} required />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone *</Label>
                <Input id="phone" type="tel" value={formData.phone} onChange={(e) => onFieldChange("phone", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Entreprise</Label>
                <Input id="company" value={formData.company} onChange={(e) => onFieldChange("company", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message (optionnel)</Label>
              <Textarea id="message" value={formData.message} onChange={(e) => onFieldChange("message", e.target.value)} rows={4} />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit">S'inscrire</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function EventDetailsModal({ event, onClose, onRegister }) {
  return (
    <EventDetails
      event={event}
      selectedEvent={event}
      onClose={onClose}
      onRegister={onRegister}
      showRegisterButton={event?.id <= 3}
    />
  )
}

export function EventsArchiveLink() {
  return (
    <div className="mt-8 text-center">
      <Button asChild variant="outline">
        <Link href="/startups/evenements/archives">
          Voir tous les événements passés <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}
