"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import WavingHand from "./WavingHand"

const FloatingChatbotButton = ({ toggleChatbot, isMobile }: any) => {
  const pathname = usePathname()
  const [isBouncing, setIsBouncing] = useState(false)
  const [showHand, setShowHand] = useState(false)

  useEffect(() => {
    setIsBouncing(true)
    setShowHand(true)

    const timer = setTimeout(() => {
      setIsBouncing(false)
      setShowHand(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <motion.div
      animate={isBouncing ? { y: [0, -20, 0] } : {}}
      transition={isBouncing ? { duration: 0.4, repeat: 2, ease: "easeInOut" } : {}}
      className="fixed bottom-6 right-6 z-50 flex items-center space-x-2"
    >
      {showHand && <WavingHand />}
      <button
        onClick={toggleChatbot}
        className={`rounded-full bg-transparent focus:outline-none ${
          isMobile ? "h-16 w-16" : "h-24 w-24"
        }`}
      >
        <Image
          src="/avatar_bot.png"
          alt="Assistant"
          width={isMobile ? 64 : 96}
          height={isMobile ? 64 : 96}
          className="rounded-full object-cover"
        />
      </button>
    </motion.div>
  )
}

export default FloatingChatbotButton
