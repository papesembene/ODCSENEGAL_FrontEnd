// "use client"

// import { useState, useRef, useEffect } from "react"
// import { GoogleGenerativeAI } from "@google/generative-ai"
// import Image from "next/image"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Send, X, Bot, BookOpen, Rocket, MapPin, Calendar, HelpCircle } from "lucide-react"


// // Initialisation de Gemini
// const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "")
// const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

// const ChatbotDialog = ({ onClose }) => {
//   const [messages, setMessages] = useState([
//     {
//       role: "assistant",
//       content: "Bonjour 👋! Je suis votre assistant ODC. Comment puis-je vous aider aujourd'hui ?",
//     },
//   ])
//   const [input, setInput] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const messagesEndRef = useRef(null)

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
//   }

//   useEffect(() => {
//     scrollToBottom()
//   }, [messages])

//   const generateResponse = async (userInput) => {
//     try {
//       // Prompt système pour guider Gemini
//       const systemPrompt = `
//         Tu es un assistant virtuel pour Orange Digital Center Sénégal. 
//         Ton rôle est de répondre aux questions sur:
//         - Les formations numériques gratuites
//         - L'accompagnement des startups
//         - Les événements et ateliers
//         - Les informations pratiques (localisation, contacts)
        
//         Réponds en français, de manière concise et professionnelle.
//         Si tu ne sais pas, dirige l'utilisateur vers la page contact.
//       `

//       const prompt = `${systemPrompt}\n\nUtilisateur: ${userInput}`

//       const result = await model.generateContent(prompt)
//       const response = await result.response
//       const text = response.text()

//       return {
//         content: text,
//         quickReplies: generateQuickReplies(text)
//       }
//     } catch (error) {
//       console.error("Erreur Gemini:", error)
//       return {
//         content: "Je rencontre une difficulté technique. Pouvez-vous reformuler ou contacter notre équipe ?",
//         quickReplies: ["Contactez l'équipe"]
//       }
//     }
//   }

//   const generateQuickReplies = (response) => {
//     if (response.includes("formation")) {
//       return ["Catalogue formations", "Processus d'inscription", "Prérequis"]
//     }
//     if (response.includes("startup")) {
//       return ["Programme d'accélération", "Financement", "Postuler"]
//     }
//     if (response.includes("événement")) {
//       return ["Calendrier", "S'inscrire", "Plus d'infos"]
//     }
//     return []
//   }

//   const handleSendMessage = async (e) => {
//     e.preventDefault()
//     if (!input.trim()) return

//     const userMessage = { role: "user", content: input }
//     setMessages(prev => [...prev, userMessage])
//     setInput("")
//     setIsLoading(true)

//     const response = await generateResponse(input)
//     setMessages(prev => [...prev, { role: "assistant", ...response }])
//     setIsLoading(false)
//   }

//   const handleQuickReply = (reply) => {
//     setInput(reply)
//     setTimeout(() => {
//       const fakeEvent = { preventDefault: () => {} }
//       handleSendMessage(fakeEvent)
//     }, 300)
//   }

//   return (
//     <div className="fixed bottom-20 right-4 z-50 flex h-[500px] w-[350px] flex-col overflow-hidden rounded-lg border bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900 md:right-8 md:h-[600px] md:w-[400px]">
//       {/* Header */}
//       <div className="flex items-center justify-between border-b bg-linear-to-r/srgb from-orange-500 to-orange-600 p-4 text-white">
//         <div className="flex items-center space-x-3">
//           <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
//             <Bot className="h-6 w-6 text-orange-500" />
//           </div>
//           <div>
//             <h3 className="font-semibold">ODC Assistant</h3>
//             <p className="text-xs">Powered by Gemini</p>
//           </div>
//         </div>
//         <Button 
//           variant="ghost" 
//           size="icon" 
//           onClick={onClose} 
//           className="text-white hover:bg-orange-700 hover:text-white"
//         >
//           <X className="h-5 w-5" />
//         </Button>
//       </div>

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto p-4">
//         {messages.map((message, index) => (
//           <div key={index} className={`mb-4 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
//             {message.role === "assistant" && (
//               <div className="mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
//                 <Bot className="h-5 w-5 text-orange-500 dark:text-orange-300" />
//               </div>
//             )}
//             <div
//               className={`max-w-[80%] rounded-lg px-4 py-3 ${
//                 message.role === "user"
//                   ? "bg-orange-500 text-white"
//                   : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
//               }`}
//             >
//               <p className="whitespace-pre-line text-sm">{message.content}</p>
              
//               {message.role === "assistant" && message.quickReplies && (
//                 <div className="mt-2 flex flex-wrap gap-2">
//                   {message.quickReplies.map((reply, i) => (
//                     <button
//                       key={i}
//                       onClick={() => handleQuickReply(reply)}
//                       className="mt-2 rounded-full bg-orange-100 px-3 py-1 text-xs text-orange-600 hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-200 dark:hover:bg-orange-800"
//                     >
//                       {reply}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>
//             {message.role === "user" && (
//               <div className="ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br/srgb from-orange-200 to-orange-300 dark:from-orange-700 dark:to-orange-800">
//                 <span className="font-semibold text-orange-600 dark:text-orange-200">VO</span>
//               </div>
//             )}
//           </div>
//         ))}
        
//         {isLoading && (
//           <div className="mb-4 flex justify-start">
//             <div className="mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
//               <Bot className="h-5 w-5 text-orange-500 dark:text-orange-300" />
//             </div>
//             <div className="flex max-w-[80%] flex-col rounded-lg bg-gray-100 px-4 py-3 dark:bg-gray-800">
//               <div className="flex space-x-1">
//                 <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500"></div>
//                 <div
//                   className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500"
//                   style={{ animationDelay: "0.2s" }}
//                 ></div>
//                 <div
//                   className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500"
//                   style={{ animationDelay: "0.4s" }}
//                 ></div>
//               </div>
//             </div>
//           </div>
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input avec suggestions */}
//       <form onSubmit={handleSendMessage} className="border-t p-3">
//         <div className="mb-2 flex space-x-2 overflow-x-auto pb-2">
//           {[
//             { icon: <BookOpen size={16} />, text: "Formations" },
//             { icon: <Rocket size={16} />, text: "Startups" },
//             { icon: <MapPin size={16} />, text: "Localisation" },
//             { icon: <Calendar size={16} />, text: "Événements" }
//           ].map((item, i) => (
//             <button
//               key={i}
//               type="button"
//               onClick={() => handleQuickReply(item.text)}
//               className="flex items-center space-x-1 whitespace-nowrap rounded-full bg-orange-100 px-3 py-1 text-xs text-orange-600 hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-200 dark:hover:bg-orange-800"
//             >
//               {item.icon}
//               <span>{item.text}</span>
//             </button>
//           ))}
//         </div>
//         <div className="flex items-center space-x-2">
//           <Input
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             placeholder="Posez votre question..."
//             className="flex-1 rounded-full"
//             disabled={isLoading}
//           />
//           <Button 
//             type="submit" 
//             size="icon" 
//             className="rounded-full bg-orange-500 hover:bg-orange-600" 
//             disabled={!input.trim() || isLoading}
//           >
//             <Send className="h-4 w-4" />
//           </Button>
//         </div>
//       </form>
//     </div>
//   )
// }

// export default ChatbotDialog
