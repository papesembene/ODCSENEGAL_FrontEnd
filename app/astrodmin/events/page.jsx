"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAdminApi } from "@/app/hooks/useAdminApi"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Calendar,
  Plus,
  Eye,
  Edit,
  Trash,
  Users,
  MapPin,
  Clock,
  RefreshCw,
  Search,
  AlertCircle,
  Image as ImageIcon
} from "lucide-react"
import { toast } from "sonner"

export default function EventsManagementPage() {
  const router = useRouter()
  const { events } = useAdminApi()
  
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  const [eventsData, setEventsData] = useState([])
  const [showDialog, setShowDialog] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "Orange Digital Center Dakar",
    category: "Workshop",
    maxParticipants: 30,
    description: "",
    image: ""
  })

  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    totalParticipants: 0
  })

  const fetchEvents = useCallback(async () => {
    try {
      setRefreshing(true)
      const result = await events.getAll()
      
      if (result.success) {
        const data = result.events || result.data || []
        setEventsData(data)
        setStats({
          total: data.length,
          upcoming: data.filter(e => e.status === "upcoming").length,
          completed: data.filter(e => e.status === "completed").length,
          totalParticipants: data.reduce((sum, e) => sum + (e.currentParticipants || 0), 0)
        })
      }
    } catch (error) {
      console.error("Erreur lors du chargement des événements:", error)
      toast.error("Erreur lors du chargement des événements")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [events])

  useEffect(() => {
    fetchEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const resetForm = () => {
    setFormData({
      title: "",
      date: "",
      time: "",
      location: "Orange Digital Center Dakar",
      category: "Workshop",
      maxParticipants: 30,
      description: "",
      image: ""
    })
    setEditingEvent(null)
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.date || !formData.time) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }

    try {
      let result
      if (editingEvent) {
        result = await events.update(editingEvent.id, formData)
      } else {
        result = await events.create(formData)
      }
      
      if (result.success) {
        toast.success(editingEvent ? "Événement modifié avec succès" : "Événement créé avec succès")
        setShowDialog(false)
        resetForm()
        fetchEvents()
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement de l'événement")
    }
  }

  const handleEdit = (event) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      category: event.category,
      maxParticipants: event.maxParticipants,
      description: event.description || "",
      image: event.image || ""
    })
    setShowDialog(true)
  }

  const handleDelete = async (eventId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) return
    
    try {
      const result = await events.delete(eventId)
      
      if (result.success) {
        toast.success("Événement supprimé avec succès")
        fetchEvents()
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression de l'événement")
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      Workshop: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      Masterclass: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      Conférence: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      Pitch: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
      Networking: "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400",
      Hackathon: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  const getStatusBadge = (status) => {
    if (status === "upcoming") {
      return <Badge className="bg-green-100 text-green-800">À venir</Badge>
    } else if (status === "completed") {
      return <Badge className="bg-gray-100 text-gray-800">Terminé</Badge>
    }
    return <Badge>En cours</Badge>
  }

  const filteredEvents = eventsData.filter(event => {
    const matchesSearch = searchTerm === "" || 
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === "all" || event.category === categoryFilter
    const matchesStatus = statusFilter === "all" || event.status === statusFilter
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Événements</h1>
          <p className="text-muted-foreground mt-1">
            Créez et gérez les événements de l'Orange Digital Center
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchEvents} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button onClick={() => {
            resetForm()
            setShowDialog(true)
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Créer un événement
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Événements</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">À venir</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcoming}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminés</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalParticipants}</div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des événements */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Liste des événements</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-8 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="Workshop">Workshop</SelectItem>
                  <SelectItem value="Masterclass">Masterclass</SelectItem>
                  <SelectItem value="Conférence">Conférence</SelectItem>
                  <SelectItem value="Pitch">Pitch</SelectItem>
                  <SelectItem value="Networking">Networking</SelectItem>
                  <SelectItem value="Hackathon">Hackathon</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="upcoming">À venir</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Événement</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Date & Heure</TableHead>
                  <TableHead>Lieu</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Aucun événement trouvé</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(event.category)}>
                          {event.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                          <span className="text-sm text-muted-foreground">{event.time}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-sm">{event.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {event.currentParticipants || 0} / {event.maxParticipants}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(event.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEdit(event)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(event.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de création/modification */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "Modifier l'événement" : "Créer un nouvel événement"}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations de l'événement
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Titre de l'événement *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Workshop Design Thinking"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="time">Heure *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Lieu *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Orange Digital Center Dakar"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Catégorie *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                    <SelectItem value="Masterclass">Masterclass</SelectItem>
                    <SelectItem value="Conférence">Conférence</SelectItem>
                    <SelectItem value="Pitch">Pitch</SelectItem>
                    <SelectItem value="Networking">Networking</SelectItem>
                    <SelectItem value="Hackathon">Hackathon</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="maxParticipants">Nombre de participants max *</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">URL de l'image (optionnel)</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de l'événement..."
                rows={4}
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Les informations de l'événement seront visibles par tous les utilisateurs de la plateforme.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDialog(false)
              resetForm()
            }}>
              Annuler
            </Button>
            <Button onClick={handleSubmit}>
              {editingEvent ? "Enregistrer les modifications" : "Créer l'événement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
