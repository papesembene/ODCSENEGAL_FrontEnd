"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { BrainCircuit, Compass, FileText, Lightbulb, MessageSquare, PlusCircle, Rocket, Star } from "lucide-react"
 
const menuItems = [
  {
    title: "Vue d'ensemble",
    href: "/open-innovation",
    icon: <Compass className="h-5 w-5" />,
    exact: true,
  },
  {
    title: "Défis d'innovation",
    href: "/open-innovation/challenges",
    icon: <Lightbulb className="h-5 w-5" />,
  },
  {
    title: "Propositions",
    href: "/open-innovation/solutions",
    icon: <BrainCircuit className="h-5 w-5" />,
  },
  {
    title: "Réseau d'experts",
    href: "/open-innovation/experts",
    icon: <Star className="h-5 w-5" />,
  },
  {
    title: "Projets collaboratifs",
    href: "/open-innovation/projects",
    icon: <Rocket className="h-5 w-5" />,
  },
  {
    title: "Ressources",
    href: "/open-innovation/resources",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Forum d'échange",
    href: "/open-innovation/forum",
    icon: <MessageSquare className="h-5 w-5" />,
  },
]
 
export default function OpenInnovationSidebar() {
  const pathname = usePathname()
 
  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br/srgb from-blue-500 to-purple-600 text-white">
            <Rocket className="h-4 w-4" />
          </div>
          <span className="font-semibold">Espace Connect</span>
        </div>
        <SidebarTrigger />
      </SidebarHeader>
 
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
 
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                  <Link href={item.href} className="relative">
                    {item.icon}
                    <span>{item.title}</span>
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-indicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
 
      <SidebarFooter className="p-4">
        <Button className="w-full gap-2 bg-linear-to-r/srgb from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <PlusCircle className="h-4 w-4" />
          <span>Publier un défi</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
