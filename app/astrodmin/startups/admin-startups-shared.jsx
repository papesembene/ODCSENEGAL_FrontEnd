"use client"

import { Calendar } from "lucide-react"
import { ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SummaryCard({ description, progressClassName, progressValue, title, value }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <div className="mt-4 h-1 w-full bg-gray-200 dark:bg-gray-700">
          <div className={`h-1 ${progressClassName}`} style={{ width: `${progressValue}%` }}></div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ChartContainer({ children }) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}

export function FilterSelect({ onValueChange, options, placeholder, value }) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[130px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function ProgramCard({ acceptanceRate, activeCount, description, pendingCount, title }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Startups actives</span>
            <span className="text-sm">{activeCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Candidatures en attente</span>
            <span className="text-sm">{pendingCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Taux d&apos;acceptation</span>
            <span className="text-sm">{acceptanceRate}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ProgramCalendarItem({ date, title, colorClassName }) {
  return (
    <div className="flex items-center space-x-4">
      <div className={`${colorClassName} rounded-md p-2`}>
        <Calendar className="h-5 w-5" />
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{date}</p>
      </div>
    </div>
  )
}

export function AdminGhostActionButton({ children }) {
  return (
    <Button variant="ghost" size="icon">
      {children}
    </Button>
  )
}
