import { useState } from 'react'
import { useForm } from 'react-hook-form'
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
import { toast } from '@/components/ui/use-toast'

export default function EventForm({ onSuccess }) {
  const [date, setDate] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const categories = [
    { value: 'workshop', label: 'Workshop' },
    { value: 'masterclass', label: 'Masterclass' },
    { value: 'conference', label: 'Conférence' },
    { value: 'pitch', label: 'Session Pitch' },
    { value: 'networking', label: 'Networking' },
    { value: 'hackathon', label: 'Hackathon' },
  ]

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      
      const eventData = {
        ...data,
        date: date.toISOString(),
        attendees: parseInt(data.attendees) || 0
      }

      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa('admin:password')}` // À sécuriser en production
        },
        body: JSON.stringify(eventData)
      })

      if (!response.ok) throw new Error('Erreur lors de la création')

      toast({
        title: "Succès",
        description: "L'événement a été créé avec succès",
      })

      reset()
      onSuccess()
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
      <div>
        <label className="block text-sm font-medium mb-1">Titre *</label>
        <Input {...register('title', { required: true })} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date *</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Choisir une date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Heure</label>
          <Input type="time" {...register('time')} defaultValue="14:00" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Lieu</label>
        <Input {...register('location')} defaultValue="Orange Digital Center, Dakar" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Catégorie *</label>
          <Select {...register('category', { required: true })} defaultValue="workshop">
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Participants estimés</label>
          <Input type="number" {...register('attendees')} defaultValue="20" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Image (URL)</label>
        <Input {...register('image')} defaultValue="/images/event-default.jpg" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description *</label>
        <Textarea {...register('description', { required: true })} rows={4} />
      </div>

      <Button type="submit" className="mt-4" disabled={loading}>
        {loading ? "En cours..." : "Créer l'événement"}
      </Button>
    </form>
  )
}