"use client"
 
import { useState, useEffect, useRef, useCallback } from "react"
import { X, User, Send, Bot, ExternalLink, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { GoogleGenerativeAI } from "@google/generative-ai"
import Markdown from 'react-markdown'
import { useRouter } from "next/navigation"
import {
  PLATFORM_ROUTES,
  DEFAULT_SUGGESTED_ACTIONS,
  WELCOME_MESSAGE,
  getPrompt
} from "./prompts"
 
 
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "")
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

const ChatbotButton = () => {
  const router = useRouter()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(true)
  const [isPulsing, setIsPulsing] = useState(false)
  const [hasWelcomed, setHasWelcomed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const inputRef = useRef(null)
  const messagesEndRef = useRef(null)
  const chatRef = useRef(null)
  const [wasManuallyClosed, setWasManuallyClosed] = useState(true)
 
 
 
  // Détection de la taille de l'écran et du clavier
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile && !wasManuallyClosed) setIsOpen(true)
 
    }
 
    const handleResize = () => {
      checkIfMobile()
      // Détection approximative du clavier (pour Android)
      const isKeyboardVisible = window.innerHeight < window.visualViewport?.height * 0.7
      setKeyboardVisible(isKeyboardVisible)
    }
 
    checkIfMobile()
    window.addEventListener('resize', handleResize)
    window.visualViewport?.addEventListener('resize', handleResize)
   
    return () => {
      window.removeEventListener('resize', handleResize)
      window.visualViewport?.removeEventListener('resize', handleResize)
    }
  }, [])
 
  // Fermeture quand on clique en dehors (version améliorée)
  useEffect(() => {
    const handlePointerDown = (event) => {
      // Ne pas fermer si :
      // - Le clic est dans le chat
      // - C'est un élément interactif (input, bouton, etc.)
      // - Le clavier est visible sur mobile
      if (
        (chatRef.current && chatRef.current.contains(event.target)) ||
        event.target.closest('button, input, a, select, textarea') ||
        (isMobile && keyboardVisible)
      ) {
        return
      }
     
      setIsOpen(false)
     
    }
 
    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [isMobile, keyboardVisible])
 
  // Gestion de l'ouverture et du focus
  useEffect(() => {
    if (isOpen) {
      welcomeUser()
      // Délai légèrement augmenté pour mobile
      setTimeout(() => inputRef.current?.focus(), isMobile ? 300 : 100)
    }
  }, [isOpen])
 
  // Scroll vers le bas des messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])
 
  const welcomeUser = useCallback(() => {
    if (hasWelcomed || messages.length > 0) return
    setHasWelcomed(true)
    setMessages([{
      role: 'assistant',
      content: WELCOME_MESSAGE,
      quickActions: DEFAULT_SUGGESTED_ACTIONS
    }])
  }, [hasWelcomed, messages.length])
 
  const toggleChatbot = useCallback(() => {
    setIsOpen(prev => {
      const newState = !prev
      setWasManuallyClosed(!newState) // si on ferme, on note que c'est manuel
      return newState
    })
  }, [])
 
  const navigateTo = useCallback((path) => {
    const routeKey = Object.keys(PLATFORM_ROUTES).find(
      key => PLATFORM_ROUTES[key] === path
    )
 
    if (routeKey) {
      router.push(path)
      return {
        content: `Je vous ai dirigé vers la page "${routeKey}". Vous pouvez continuer à me poser des questions ici même.`,
        quickActions: DEFAULT_SUGGESTED_ACTIONS
      }
    } else {
      return {
        content: `Désolé, je n'ai pas trouvé la page correspondante. Voici les pages disponibles : ${Object.keys(PLATFORM_ROUTES).join(', ')}`,
        quickActions: DEFAULT_SUGGESTED_ACTIONS
      }
    }
  }, [router])
 
  const generateResponse = async (userInput) => {
    if (userInput.startsWith("navigate:")) {
      const path = userInput.replace("navigate:", "").trim()
      return navigateTo(path)
    }
 
    try {
      const prompt = getPrompt(messages, userInput)
      const result = await model.generateContent(prompt)
      const response = await result.response
      let text = response.text()
 
      const navRegex = /\[([^\]]+)\]\(navigate:([^)]+)\)/g
      const actions = []
      let match
     
      while ((match = navRegex.exec(text)) !== null) {
        actions.push({
          text: match[1],
          action: `navigate:${match[2]}`
        })
      }
 
      text = text.replace(/\[([^\]]+)\]\(navigate:([^)]+)\)/g, '$1')
 
      return {
        content: text,
        quickActions: actions.length > 0 ? actions : DEFAULT_SUGGESTED_ACTIONS
      }
    } catch (error) {
      console.error("Erreur Gemini:", error)
      return {
        content: "Je rencontre une difficulté technique. Veuillez réessayer.",
        quickActions: DEFAULT_SUGGESTED_ACTIONS
      }
    }
  }
 
  const handleSendMessage = async (e) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return
 
    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
 
    const response = await generateResponse(input)
    setMessages(prev => [...prev, {
      role: 'assistant',
      ...response
    }])
    setIsLoading(false)
   
    setTimeout(() => inputRef.current?.focus(), 100)
  }
 
  const handleQuickAction = (action) => {
    if (action.startsWith("navigate:")) {
      const path = action.replace("navigate:", "")
      setMessages(prev => [...prev, {
        role: 'user',
        content: `Aller à la page: ${path}`
      }])
     
      setTimeout(() => {
        generateResponse(action).then(response => {
          setMessages(prev => [...prev, {
            role: 'assistant',
            ...response
          }])
        })
      }, 300)
    } else {
      setInput(action)
      setTimeout(() => {
        handleSendMessage()
      }, 300)
    }
  }
 
  const handleInputFocus = () => {
    if (!isMobile || wasManuallyClosed) return
    setIsOpen(true)
  }
 
 
  return (
    <div
      className={cn(
        "fixed z-50 max-w-full max-h-full",
        isMobile ? "bottom-4 right-4" : "bottom-8 right-8"
      )}
      style={{ overflow: 'hidden' }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden flex flex-col",
              // Taille réduite sur mobile
              isMobile ? "w-[80vw] h-[55vh] mx-auto" : "w-[400px] max-h-[80vh]"
            )}
            style={{
              border: 'none',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            {/* En-tête */}
            <div className="bg-linear-to-r/srgb from-amber-500 to-orange-600 p-3 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="relative h-8 w-8">
                  <Image
                    src="/thaloob.png"
                    alt="Assistant ODC"
                    fill
                    className="rounded-full object-cover"
                    priority
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Thaloob</h3>
                  <p className="text-xs opacity-80">Assistant ODC</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isMobile && (
                  <button
                    onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
                    className="text-white hover:text-orange-200 transition-colors"
                    aria-label="Aller en bas"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={toggleChatbot}
                  className="text-white hover:text-orange-200 transition-colors"
                  aria-label="Fermer le chat"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
 
            {/* Corps du chat */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((message, index) => (
                <div key={index} className={`flex items-start gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' && (
                    <div className="shrink-0">
                      <div className="relative h-8 w-8">
                        <Image
                          src="/thaloob.png"
                          alt="Assistant ODC"
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                 
                  <div className={`runded-lg px-3 py-2 max-w-[85%] ${
                    message.role === 'user'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <div className="prose dark:prose-invert prose-sm">
                      <Markdown>
                        {message.content}
                      </Markdown>
                    </div>
                   
                    {message.role === 'assistant' && message.quickActions && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {message.quickActions.map((action, i) => (
                          <button
                            key={i}
                            onClick={() => handleQuickAction(action.action)}
                            className="rounded-full bg-orange-50 dark:bg-orange-900/50 px-2 py-1 text-xs text-orange-600 dark:text-orange-200 hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors flex items-center"
                          >
                            {action.text}
                            {action.action.startsWith("navigate:") && (
                              <ExternalLink className="h-3 w-3 ml-1" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                 
                  {message.role === 'user' && (
                    <div className="shrink-0">
                      <div className="relative h-8 w-8">
                        <Image
                          src="/avatar_user.png"
                          alt="Utilisateur"
                          fill
                          className="rounded-full object-cover bg-gray-200"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
 
              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="bg-orange-100 dark:bg-orange-900 p-1.5 rounded-full shrink-0">
                    <Bot className="h-4 w-4 text-orange-500 dark:text-orange-300" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 max-w-[80%]">
                    <div className="flex space-x-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce"></div>
                      <div className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce delay-100"></div>
                      <div className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
 
            {/* Zone de saisie */}
            <form onSubmit={handleSendMessage} className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900">
              <div className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={handleInputFocus}
                  placeholder="Posez votre question..."
                  className="flex-1 rounded-full border border-gray-300 dark:border-gray-600 py-2 pl-3 pr-10 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(e)}
                  disabled={isLoading}
                  autoFocus={isOpen}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-1 bg-orange-500 text-white p-1.5 rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Envoyer le message"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
 
      {/* Bouton flottant */}
      {!isOpen && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          <button
            onClick={toggleChatbot}
            aria-label="Ouvrir l'assistant"
            className={cn(
              "rounded-full bg-transparent hover:bg-transparent",
              "focus:outline-hidden focus:ring-2 focus:ring-orange-500",
              "relative overflow-hidden border-none shadow-none",
              isMobile ? "h-16 w-16" : "h-40 w-36"
            )}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src="/thaloob.png"
                alt="Assistant"
                width={isMobile ? 160 : 400}
                height={isMobile ? 160 : 400}
                className="rounded-full object-cover"
                priority
              />
            </div>
            {isPulsing && (
              <motion.div
                className="absolute inset-0 rounded-full bg-orange-400/40"
                initial={{ scale: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </button>
        </motion.div>
      )}
    </div>
  )
}
 
export default ChatbotButton
