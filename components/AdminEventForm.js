"use client"

// components/AdminEventForm.js
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function AdminEventForm() {
  const [formData, setFormData] = useState({
    title: '',
    date: new Date(),
    time: '14:00',
    location: 'Orange Digital Center, Dakar',
    description: '',
    category: 'workshop',
    attendees: 0,
    image: '/images/event-default.jpg'
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('admin:votre-mot-de-passe-secret')
        },
        body: JSON.stringify({
          ...formData,
          date: formData.date.toISOString()
        })
      })

      if (!response.ok) throw new Error('Erreur lors de la création')
      
      setSuccess(true)
      setFormData({
        title: '',
        date: new Date(),
        time: '14:00',
        location: 'Orange Digital Center, Dakar',
        description: '',
        category: 'workshop',
        attendees: 0,
        image: '/images/event-default.jpg'
      })
      
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="text-2xl font-bold mb-6">Créer un nouvel événement</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Titre de l'événement *</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Date *</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(formData.date, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => setFormData({...formData, date})}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block mb-1">Heure</label>
            <Input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block mb-1">Lieu</label>
          <Input
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
          />
        </div>

        <div>
          <label className="block mb-1">Catégorie *</label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({...formData, category: value})}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionnez une catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="masterclass">Masterclass</SelectItem>
              <SelectItem value="pitch">Pitch</SelectItem>
              <SelectItem value="hackathon">Hackathon</SelectItem>
              <SelectItem value="conference">Conférence</SelectItem>
              <SelectItem value="networking">Networking</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block mb-1">Description *</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={4}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Nombre de participants estimé</label>
            <Input
              type="number"
              value={formData.attendees}
              onChange={(e) => setFormData({...formData, attendees: parseInt(e.target.value) || 0})}
            />
          </div>

          <div>
            <label className="block mb-1">Image (URL)</label>
            <Input
              value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
            />
          </div>
        </div>

        <Button type="submit" disabled={loading} className="mt-4">
          {loading ? "Création en cours..." : "Créer l'événement"}
        </Button>

        {success && (
          <div className="p-3 mt-4 bg-green-100 text-green-800 rounded-md">
            Événement créé avec succès!
          </div>
        )}
      </form>
    </div>
  )
}
