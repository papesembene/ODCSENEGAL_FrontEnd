"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Calendar, MapPin, Clock, Users, X, ChevronLeft, ChevronRight, Check, Filter, Upload, Image as ImageIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

  // import por le formulaire event
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Loader2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone';
import { EventDetails } from "./eventComponents/EventDetailsDialog";


export default function EvenementsPage() {
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "",
    image: null, // Ajout pour le fichier image
    imagePreview: '', // Prévisualisation
    details: "",
    agenda: "",
    speakers: ""
  })
  const [isUploading, setIsUploading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showRegistration, setShowRegistration] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: ""
  })
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [newsletterSuccess, setNewsletterSuccess] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  // fonction de gesion des images upload

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setNewEvent({
        ...newEvent,
        image: file,
        imagePreview: preview
      });
    }
  };
  
  const removeImage = () => {
    setNewEvent({
      ...newEvent,
      image: null,
      imagePreview: ''
    });
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1
  });

  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ]

  const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddEvent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      // Validation des champs obligatoires
      if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.location) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }
  
      // Création du FormData pour l'upload
      const formData = new FormData();
      formData.append('title', newEvent.title);
      formData.append('date', new Date(newEvent.date).toISOString());
      formData.append('time', newEvent.time);
      formData.append('location', newEvent.location);
      
      // Ajout des champs optionnels
      if (newEvent.description) formData.append('description', newEvent.description);
      if (newEvent.category) formData.append('category', newEvent.category);
      if (newEvent.details) formData.append('details', newEvent.details);
      if (newEvent.agenda) {
        formData.append('agenda', JSON.stringify(
          newEvent.agenda.split('\n').filter(item => item.trim() !== '')
        ));
      }
      if (newEvent.speakers) {
        formData.append('speakers', JSON.stringify(
          newEvent.speakers.split('\n').map(speaker => {
            const [name, role] = speaker.split('|').map(item => item.trim());
            return { name, role };
          })
        ));
      }
      if (newEvent.image) {
        formData.append('image', newEvent.image);
      }
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/events/`, {
        method: 'POST',
        body: formData,
        // Note: Ne pas mettre le header 'Content-Type' pour FormData,
        // le navigateur le fera automatiquement avec le bon boundary
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erreur backend:", errorData);
        throw new Error(errorData.error || "Erreur lors de l'ajout de l'événement");
      }

      const data = await response.json();
      
      // Update events list
      setUpcomingEvents(prev => [...prev, data.event]);
      
      // Reset form
      setNewEvent({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        category: "",
        image: "",
        details: "",
        agenda: "",
        speakers: ""
      });
      
      setShowAddEvent(false);
      toast.success('Événement ajouté avec succès');
    } catch (err) {
      console.error("Erreur lors de l'ajout:", err);
      toast.error(err.message || "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };


  // const handleSubmit = async (e) => {
  //   e.preventDefault()
    
  //   try {
  //     const response = await fetch('${process.env.NEXT_PUBLIC_API_URL}api/events/${selectedEvent._id}/register', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(formData),
  //     })
      
  //     if (!response.ok) {
  //       throw new Error('Erreur lors de l\'inscription')
  //     }
      
  //     setRegistrationSuccess(true)
  //     setFormData({
  //       name: "",
  //       email: "",
  //       phone: "",
  //       company: "",
  //       message: ""
  //     })
      
  //     setTimeout(() => {
  //       setShowRegistration(false)
  //       setRegistrationSuccess(false)
  //       setSelectedEvent(null)
  //     }, 3000)
  //   } catch (err) {
  //     console.error("Erreur d'inscription:", err)
  //     // Afficher un message d'erreur à l'utilisateur
  //     "erreur lors de l'envoie des donnees du formulaire"
  //   }
  // }

  const handleSubmitRegistrationEvent = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/events/${selectedEvent.id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'inscription')
      }
      
      setRegistrationSuccess(true)
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        message: ""
      })

      // 🔄 Recharge les événements
      await fetchEvents()
      
      setTimeout(() => {
        setShowRegistration(false)
        setRegistrationSuccess(false)
        setSelectedEvent(null)
      }, 3000)
    } catch (err) {
      console.error("Erreur d'inscription:", err)
      // Afficher un message d'erreur à l'utilisateur
      "erreur lors de l'envoie des donnees du formulaire"
    }
  }

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newsletterEmail }),
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'inscription à la newsletter')
      }
      
      setNewsletterSuccess(true)
      setNewsletterEmail("")
      setTimeout(() => setNewsletterSuccess(false), 5000)
    } catch (err) {
      console.error("Erreur newsletter:", err)
      // Afficher un message d'erreur à l'utilisateur
      "erreur lors de l'envoie des donnees du formulaire"
    }
  }

    //pour le backend
    const [upcomingEvents, setUpcomingEvents] = useState([])
    const [pastEvents, setPastEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const formatDate = (dateObj) => {
      // Si la date est déjà une string, la retourner telle quelle
      if (typeof dateObj === 'string') return dateObj
      
      // Gérer le format MongoDB
      if (dateObj && dateObj.$date) {
        const date = new Date(dateObj.$date)
        return date.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      }
      
      // Gérer les autres formats de date
      try {
        const date = new Date(dateObj)
        return isNaN(date.getTime()) 
          ? 'Date inconnue' 
          : date.toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })
      } catch {
        return 'Date inconnue'
      }
    }

    const fetchEvents = async () => {
      try {
        setLoading(true)
        const [upcomingRes, pastRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}api/events/upcoming`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}api/events/past`)
        ])
        
        if (!upcomingRes.ok || !pastRes.ok) {
          throw new Error('Erreur lors de la récupération des événements')
        }
        
        const upcomingData = await upcomingRes.json()
        const pastData = await pastRes.json()
    
        const transformEventDates = (events) => {
          return events.map(event => ({
            ...event,
            date: formatDate(event.date),
            rawDate: event.date
          }))
        }
    
        setUpcomingEvents(transformEventDates(upcomingData.events))
        setPastEvents(transformEventDates(pastData.events))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    

    useEffect(() => {
      fetchEvents()
    }, [])


  const getCategoryColor = (category) => {
    switch(category.toLowerCase()) {
      case "pitch": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "formation": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "workshop": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "hackathon": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "conférence": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "networking": return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth)
    const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth)
    const days = []
    
    // Ajouter les jours vides du début
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 border border-gray-200 dark:border-gray-800" />)
    }

    // Ajouter les jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = [...upcomingEvents, ...pastEvents].filter(event => 
        event.year === selectedYear && 
        event.month === selectedMonth && 
        event.day === day
      )

      days.push(
        <div 
          key={day} 
          className={cn(
            "h-8 border border-gray-200 dark:border-gray-800 p-1 text-xs",
            dayEvents.length > 0 && "bg-orange-50 dark:bg-orange-950"
          )}
        >
          {day}
        </div>
      )
    }

    return days
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Événements
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Découvrez les événements organisés par Orange Startup Studio pour les entrepreneurs et les startups.
        </p>
      </div>

      {/* Upcoming Events Section */}
      <section className="mt-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Événements à venir</h2>
          <div className="flex items-center gap-4">
                  {/* Bouton Ajouter un événement */}
            <Button 
              variant="outline" 
              onClick={() => setShowAddEvent(true)}
              className="bg-green-500 text-white hover:bg-green-600"
            >
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
                <DropdownMenuItem
                  className={cn(
                    "cursor-pointer",
                    selectedCategory === "all" && "bg-orange-50 dark:bg-orange-900"
                  )}
                  onClick={() => setSelectedCategory("all")}
                >
                  Tous les événements
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={cn(
                    "cursor-pointer",
                    selectedCategory === "Hackathon" && "bg-orange-50 dark:bg-orange-900"
                  )}
                  onClick={() => setSelectedCategory("Hackathon")}
                >
                  Hackathon
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={cn(
                    "cursor-pointer",
                    selectedCategory === "Masterclass" && "bg-orange-50 dark:bg-orange-900"
                  )}
                  onClick={() => setSelectedCategory("Masterclass")}
                >
                  Masterclass
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={cn(
                    "cursor-pointer",
                    selectedCategory === "Workshop" && "bg-orange-50 dark:bg-orange-900"
                  )}
                  onClick={() => setSelectedCategory("Workshop")}
                >
                  Workshop
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Calendrier
          </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents
            .filter(event => selectedCategory === "all" || event.category === selectedCategory)
            .length > 0 ? (
            upcomingEvents
              .filter(event => selectedCategory === "all" || event.category === selectedCategory)
              .map((event) => (
            <Card key={`${event.id}-${event.title}`} className="overflow-hidden transition-all hover:shadow-lg">
              <div className="relative h-48">
                <img src={`http://localhost:5000${event.image}`} alt="Image événement" className="w-full h-48 object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <Badge className={getCategoryColor(event.category)}>
                    {event.category}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                <CardDescription className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{formatDate(event.date)}</span>
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
                    <Button 
                      variant="outline"
                      onClick={() => setSelectedEvent(event)}
                    >
                    Détails <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button onClick={() => {
                      setSelectedEvent(event)
                      setShowRegistration(true)
                    }}>
                      S'inscrire
                </Button>
              </CardFooter>
            </Card>
              ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                Aucun événement {selectedCategory !== "all" ? `de type ${selectedCategory}` : ""} prévu pour le moment.
              </p>
            </div>
          )}
        </div>

      </section>


        {/* Add event dialog form */}
        <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
            <DialogHeader>
              <DialogTitle>Ajouter un nouvel événement</DialogTitle>
              <DialogDescription>
                Remplissez les détails du nouvel événement ci-dessous.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddEvent} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Input
                    id="category"
                    name="category"
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Heure *</Label>
                  <Input
                    id="time"
                    name="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    placeholder="14:00 - 18:00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Lieu *</Label>
                  <Input
                    id="location"
                    name="location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    required
                  />
                </div>
              </div>

                {/* uploader une image pour l'evenement */}
              <div className="space-y-2">
                <Label>Image de l'événement</Label>
                
                {newEvent.imagePreview ? (
                  <div className="relative group">
                    <img 
                      src={newEvent.imagePreview} 
                      alt="Preview" 
                      className="rounded-lg w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div 
                    {...getRootProps()} 
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition ${
                      isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        {isDragActive ? (
                          'Déposez l\'image ici...'
                        ) : (
                          <>
                            Glissez-déposez une image, ou <span className="text-blue-500">cliquez pour sélectionner</span>
                          </>
                        )}
                      </p>
                      <p className="text-xs text-gray-400">
                        Formats supportés: JPG, PNG, WEBP (max 5MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">Détails</Label>
                <Textarea
                  id="details"
                  name="details"
                  value={newEvent.details}
                  onChange={(e) => setNewEvent({ ...newEvent, details: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agenda">Agenda (un élément par ligne)</Label>
                <Textarea
                  id="agenda"
                  name="agenda"
                  value={newEvent.agenda}
                  onChange={(e) => setNewEvent({ ...newEvent, agenda: e.target.value })}
                  placeholder="14:00 - Accueil des participants\n14:30 - Mot d'ouverture"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="speakers">Intervenants (format: Nom | Rôle, un par ligne)</Label>
                <Textarea
                  id="speakers"
                  name="speakers"
                  value={newEvent.speakers}
                  onChange={(e) => setNewEvent({ ...newEvent, speakers: e.target.value })}
                  placeholder="Jean Dupont | Directeur\nMarie Martin | Investisseur"
                  rows={4}
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddEvent(false)} type="button">
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




      {/* Calendar Popup */}
      <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
        <DialogContent className="max-w-xs p-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (selectedMonth === 0) {
                    setSelectedMonth(11)
                    setSelectedYear(prev => prev - 1)
                  } else {
                    setSelectedMonth(prev => prev - 1)
                  }
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium text-sm">
                {months[selectedMonth]} {selectedYear}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (selectedMonth === 11) {
                    setSelectedMonth(0)
                    setSelectedYear(prev => prev + 1)
                  } else {
                    setSelectedMonth(prev => prev + 1)
                  }
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {days.map(day => (
              <div key={day} className="text-center text-xs font-medium py-1">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Past Events Section 
      <section className="mt-16">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Événements passés</h2>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pastEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden transition-all hover:shadow-lg">
              <div className="relative h-48">
                <Image src={event.image} alt={event.title} fill className="object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <Badge className={getCategoryColor(event.category)}>
                    {event.category}
                  </Badge>
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
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{event.location}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">{event.description}</p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setSelectedEvent(event)}
                >
                    Voir le récap <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link href="/startups/evenements/archives">
              Voir tous les événements passés <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>*/}

      {/* Newsletter Section */}
      <section className="mt-16 rounded-lg bg-orange-500 p-8 dark:bg-black">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Restez informé des événements à venir
            </h2>
            <p className="mt-4 text-white/90">
              Inscrivez-vous à notre newsletter pour recevoir les dernières informations sur nos événements.
            </p>
            {newsletterSuccess ? (
              <div className="mt-6 p-4 bg-white/10 rounded-lg">
                <p className="text-white">
                  Merci pour votre inscription ! Vous recevrez bientôt nos prochaines actualités.
                </p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="mt-6 flex gap-4">
                <Input
                  type="email"
                  placeholder="Votre adresse email"
                  className="max-w-sm bg-white border-white/20 text-black-500 placeholder:text-black-500/60"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
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
              src={"/images/oss.png" || "Image newsletter"}
              alt="Newsletter des événements"
              width={500}
              height={300}
              className="rounded-lg object-cover"
            />
          </div>
        </div>
      </section>

     {/* Event Details Modal */}

     <EventDetails
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRegister={() => setShowRegistration(true)}
        showRegisterButton={selectedEvent?.id <= 3} // ou votre condition personnalisée
      />

      {/* Registration Modal */}
      <Dialog open={showRegistration} onOpenChange={setShowRegistration}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inscription à l'événement</DialogTitle>
            <DialogDescription>
              Remplissez le formulaire ci-dessous pour vous inscrire à l'événement.
            </DialogDescription>
          </DialogHeader>
          {registrationSuccess ? (
            <div className="p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                Inscription réussie !
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Merci pour votre inscription. Vous recevrez bientôt un email de confirmation avec les détails de l'événement.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitRegistrationEvent} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
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
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message (optionnel)</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRegistration(false)}>
                  Annuler
                </Button>
                <Button type="submit">S'inscrire</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
