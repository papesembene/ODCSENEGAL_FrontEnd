export const STARTUP_DASHBOARD_DATA = {
  name: "TechInnovate",
  logo: "/placeholder.svg?height=100&width=100",
  program: "Startup Lab",
  status: "active",
  progress: 65,
  startDate: "15/01/2023",
  endDate: "15/07/2023",
  mentor: {
    name: "Fatou Ndiaye",
    role: "Mentor principal",
    avatar: "/placeholder.svg?height=50&width=50",
  },
  nextMilestone: {
    title: "Finalisation du MVP",
    date: "30/05/2023",
    description: "Présentation du prototype fonctionnel à l'équipe Orange Startup Studio.",
  },
  tasks: [
    {
      id: 1,
      title: "Finaliser le business model canvas",
      status: "completed",
      dueDate: "15/04/2023",
    },
    {
      id: 2,
      title: "Développer le prototype",
      status: "in-progress",
      dueDate: "25/05/2023",
    },
    {
      id: 3,
      title: "Préparer le pitch deck",
      status: "pending",
      dueDate: "10/06/2023",
    },
    {
      id: 4,
      title: "Réaliser les tests utilisateurs",
      status: "pending",
      dueDate: "20/06/2023",
    },
  ],
  events: [
    {
      id: 1,
      title: "Workshop: Growth Hacking",
      date: "29/05/2023",
      time: "14:00 - 17:00",
      location: "Orange Digital Center, Dakar",
      status: "upcoming",
    },
    {
      id: 2,
      title: "Mentorat individuel",
      date: "02/06/2023",
      time: "10:00 - 11:30",
      location: "En ligne",
      status: "upcoming",
    },
    {
      id: 3,
      title: "Masterclass: Levée de fonds",
      date: "22/06/2023",
      time: "10:00 - 12:00",
      location: "Orange Digital Center, Dakar",
      status: "upcoming",
    },
  ],
  resources: [
    {
      id: 1,
      title: "Guide du Business Model Canvas",
      type: "pdf",
      date: "20/01/2023",
      size: "2.4 MB",
    },
    {
      id: 2,
      title: "Template de Pitch Deck",
      type: "pptx",
      date: "05/02/2023",
      size: "3.1 MB",
    },
    {
      id: 3,
      title: "Méthodologie de test utilisateur",
      type: "pdf",
      date: "15/03/2023",
      size: "1.8 MB",
    },
  ],
  messages: [
    {
      id: 1,
      sender: "Fatou Ndiaye",
      avatar: "/placeholder.svg?height=40&width=40",
      date: "28/04/2023",
      content:
        "Bonjour, j'ai examiné votre business model canvas et j'ai quelques suggestions à vous faire. Pouvons-nous en discuter lors de notre prochaine session de mentorat ?",
      read: true,
    },
    {
      id: 2,
      sender: "Amadou Sow",
      avatar: "/placeholder.svg?height=40&width=40",
      date: "02/05/2023",
      content:
        "Je vous invite à participer au workshop sur le Growth Hacking le 29 mai. Ce sera très utile pour votre stratégie d'acquisition client.",
      read: false,
    },
  ],
}

export const STARTUP_DASHBOARD_STATS = [
  {
    label: "Tâches complétées",
    value: "4",
    icon: "checkCircle",
    iconClassName: "text-green-500",
  },
  {
    label: "Événements assistés",
    value: "8",
    icon: "calendar",
    iconClassName: "text-blue-500",
  },
  {
    label: "Mentors rencontrés",
    value: "5",
    icon: "users",
    iconClassName: "text-purple-500",
  },
  {
    label: "Progression globale",
    value: "65%",
    icon: "barChart",
    iconClassName: "text-orange-500",
  },
]

export const STARTUP_DASHBOARD_QUICK_LINKS = [
  {
    href: "/startups/programmes/startup-lab",
    label: "Programme Startup Lab",
  },
  {
    href: "/startups/evenements",
    label: "Calendrier des événements",
  },
  {
    href: "/startups/coworking",
    label: "Réserver un espace de travail",
  },
  {
    href: "/contact",
    label: "Contacter l'équipe OSS",
  },
]
