"use client"

import Link from "@/components/ui/interactive-link"
import Image from "next/image"
import { Calendar, ExternalLink, MessageSquare } from "lucide-react"
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Separator,
} from "@/components/ui"

export function StartupDashboardSidebar({ messages, mentor, quickLinks }) {
  return (
    <div className="space-y-6">
      <MentorCard mentor={mentor} />
      <RecentMessagesCard messages={messages} />
      <QuickLinksCard quickLinks={quickLinks} />
    </div>
  )
}

function MentorCard({ mentor }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mon mentor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <Image src={mentor.avatar || "/placeholder.svg"} alt={mentor.name} fill className="object-cover" />
          </Avatar>
          <div>
            <h3 className="font-semibold">{mentor.name}</h3>
            <p className="text-sm text-orange-500">{mentor.role}</p>
          </div>
        </div>
        <div className="mt-4 flex justify-between">
          <Button variant="outline" size="sm">
            <MessageSquare className="mr-2 h-4 w-4" />
            Message
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Rendez-vous
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function RecentMessagesCard({ messages }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages récents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <Image src={message.avatar || "/placeholder.svg"} alt={message.sender} fill className="object-cover" />
                  </Avatar>
                  <span className="font-medium">{message.sender}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{message.date}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{message.content}</p>
              {!message.read ? (
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Non lu</Badge>
              ) : null}
              <Separator className="my-2" />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" className="w-full">
          Voir tous les messages
        </Button>
      </CardFooter>
    </Card>
  )
}

function QuickLinksCard({ quickLinks }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Liens rapides</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {quickLinks.map((link) => (
            <li key={link.href}>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href={link.href}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {link.label}
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
