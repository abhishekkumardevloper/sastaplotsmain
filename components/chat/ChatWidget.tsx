'use client'
import React, { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Bot, Sparkles, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ChatMessage {
  id: string
  role: 'bot' | 'user'
  text: string
  time: string
}

const initialMessages: ChatMessage[] = [
  {
    id: 'm1',
    role: 'bot',
    text: 'Namaste! 🙏 I am your Sasta Plots Property Assistant. Looking for residential plots, agricultural land, or commercial properties?',
    time: 'Just now',
  },
]

const quickPrompts = [
  'Plots under ₹20 Lakhs',
  'Agricultural land in UP',
  'Commercial plots',
  'How to post a property?',
]

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSend = (textToSend?: string) => {
    const messageContent = (textToSend || input).trim()
    if (!messageContent) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: messageContent,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Simulate smart bot response
    setTimeout(() => {
      let botResponse = 'I can help you find verified properties matching that criteria! Check our latest listings or tell me your preferred city and budget.'
      const lower = messageContent.toLowerCase()
      if (lower.includes('20 lakh') || lower.includes('budget') || lower.includes('cheap')) {
        botResponse = 'We have multiple verified residential plots under ₹20 Lakhs in developing corridors with Pucca road connectivity and clear titles.'
      } else if (lower.includes('agri') || lower.includes('farm') || lower.includes('land')) {
        botResponse = 'Agricultural lands with fertile soil, borewell access, and clear registry are listed under our Agricultural Land category!'
      } else if (lower.includes('post') || lower.includes('sell') || lower.includes('list')) {
        botResponse = 'You can list your property for free! Click the orange "Post Property" button in the top menu to submit your listing in just 2 minutes.'
      }

      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        role: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false)
    }, 900)
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 select-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[92vw] sm:w-[380px] h-[520px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden mb-3"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#F47B20] to-[#E96512] p-4 text-white flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30 text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sm">
                    <span>Sasta Plots AI</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-[11px] text-white/80">Always active • Instant property advice</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
                aria-label="Close Chat"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FFF8F2]/30 scrollbar-thin">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex flex-col',
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  )}
                >
                  <div
                    className={
                      msg.role === 'user'
                        ? 'chat-bubble-user text-xs sm:text-sm'
                        : 'chat-bubble-bot text-xs sm:text-sm'
                    }
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 chat-bubble-bot text-xs text-gray-500 py-2 px-3">
                  <Bot className="w-3.5 h-3.5 text-[#F47B20]" />
                  <span>Thinking...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-3 py-2 bg-white border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <Sparkles className="w-3.5 h-3.5 text-[#F47B20] shrink-0 ml-1" />
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="shrink-0 text-[11px] px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-[#F47B20] rounded-full border border-orange-200/60 font-medium transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="p-3 bg-white border-t border-gray-100 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about plots, areas, prices..."
                className="flex-1 input-field py-2 text-xs"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-9 h-9 rounded-xl bg-[#F47B20] hover:bg-[#E96512] text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Launcher Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close assistant' : 'Open property assistant'}
        className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#F47B20] to-[#E96512] text-white flex items-center justify-center shadow-lg shadow-[#F47B20]/30 hover:shadow-[#F47B20]/40 transition-all cursor-pointer relative"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
          </>
        )}
      </motion.button>
    </div>
  )
}

export default ChatWidget
