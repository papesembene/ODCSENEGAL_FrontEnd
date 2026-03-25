"use client"
import { motion } from "framer-motion"

const WavingHand = () => {
  return (
    <motion.span
      initial={{ rotate: 0 }}
      animate={{ rotate: [0, 20, -10, 20, 0] }}
      transition={{ duration: 1, repeat: Infinity }}
      className="text-2xl"
    >
      👋
    </motion.span>
  )
}

export default WavingHand
