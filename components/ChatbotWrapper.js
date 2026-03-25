// components/ChatbotWrapper.js
"use client"

import { usePathname } from 'next/navigation'
import ChatbotButton from './chatbot/chatbot-button'


const EXCLUDED_PAGES = [
  '/login',
  '/register',
  '/astrodmin',
  '/astrodmin/*',
  '/odc/candidatures',
  '/startups/candidature/*',
  '/startups/candidature',
  '/competences',
  '/competences/*',
  '/startups',
  '/startups/*',
  '/',
  '/*',
  
  // ...
]

export default function ChatbotWrapper() {
  // DÉSACTIVATION TEMPORAIRE : Le chatbot est désactivé sur toutes les pages
  return null
  
  // Code commenté pour réactivation ultérieure
  /*
  const pathname = usePathname()

  const shouldDisplay = !EXCLUDED_PAGES.some(page => {
    if (page.endsWith('/*')) {
      return pathname.startsWith(page.replace('/*', ''))
    }
    return pathname === page
  })

  if (!shouldDisplay) return null

  return <ChatbotButton />
  */
}