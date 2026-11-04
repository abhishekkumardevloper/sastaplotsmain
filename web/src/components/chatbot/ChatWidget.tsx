import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  MessageSquare,
  X,
  Send,
  Bot,
  MapPin,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Maximize2,
  ChevronDown,
} from 'lucide-react'
import api from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import type { Property } from '@/types'

interface MessageItem {
  id: string
  role: 'user' | 'assistant'
  content: string
  properties?: Property[]
  timestamp: string
}

const SUGGESTED_QUESTIONS = [
  'Help me find a plot',
  'Properties under ₹10 lakh',
  'How to post property?',
  'How long does approval take?',
  'Contact a seller',
  'Why was my listing rejected?',
]

const WELCOME_MESSAGE: MessageItem = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Namaste! 🙏 I am your Sasta Plots Assistant. I can help you discover verified plots, explain the listing and buying process, or answer any real estate questions. What are you looking for today?',
  timestamp: new Date().toISOString(),
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<MessageItem[]>([WELCOME_MESSAGE])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const [unreadCount, setUnreadCount] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const shouldReduceMotion = useReducedMotion()

  // Initialize or restore session ID
  useEffect(() => {
    let savedId = sessionStorage.getItem('sastaplots_chat_session')
    if (!savedId) {
      savedId = 'session_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now()
      sessionStorage.setItem('sastaplots_chat_session', savedId)
    }
    setSessionId(savedId)
  }, [])

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      setUnreadCount(0)
      setTimeout(() => inputRef.current?.focus(), 250)
    }
  }, [isOpen, messages, isLoading])

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? inputValue).trim()
    if (!text || isLoading) return

    const userMsg: MessageItem = {
      id: 'msg_user_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await api.post('/chatbot/message', {
        message: text,
        sessionId: sessionId || 'default_session',
      })

      const data = response.data?.data || response.data || {}
      const botReply =
        data.reply ||
        data.message ||
        data.content ||
        'Thank you for your question. You can explore verified listings directly on our search page or reach our support team anytime!'

      const botProperties = data.properties || []

      const botMsg: MessageItem = {
        id: 'msg_bot_' + Date.now(),
        role: 'assistant',
        content: botReply,
        properties: botProperties,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, botMsg])
      if (!isOpen) {
        setUnreadCount((c) => c + 1)
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { status?: number; data?: { message?: string } } }
      let errorMessage =
        'I am having trouble connecting to the server. Please check your internet connection or try again later.'

      if (errorObj?.response?.status === 429) {
        errorMessage =
          "You've sent too many messages in a short time. Please take a quick breath and try again in a minute."
      } else if (errorObj?.response?.data?.message) {
        errorMessage = errorObj.response.data.message
      } else {
        // Fallback intelligent response for common queries when offline
        const lower = text.toLowerCase()
        if (lower.includes('approval') || lower.includes('how long')) {
          errorMessage =
            'Listings are reviewed by our moderation team within 24–48 hours on business days. You will receive an instant in-app notification once approved!'
        } else if (lower.includes('post') || lower.includes('sell')) {
          errorMessage =
            'To post a property, click "Post Property" in the top navigation, fill out the property details, upload title deeds/photos, and submit for verification.'
        } else if (lower.includes('contact') || lower.includes('seller')) {
          errorMessage =
            'You can contact sellers directly via the phone or WhatsApp button on any property listing detail page.'
        } else if (lower.includes('rejected')) {
          errorMessage =
            'Listings are typically rejected due to incomplete address details, unclear documents, or pricing mismatches. Check your Notifications page for specific feedback.'
        }
      }

      const botMsg: MessageItem = {
        id: 'msg_bot_err_' + Date.now(),
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, botMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleResetChat = () => {
    setMessages([WELCOME_MESSAGE])
    const newId = 'session_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now()
    sessionStorage.setItem('sastaplots_chat_session', newId)
    setSessionId(newId)
  }

  const panelVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20, scale: shouldReduceMotion ? 1 : 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: shouldReduceMotion ? 0 : 20, scale: shouldReduceMotion ? 1 : 0.95 },
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {/* Launcher Button */}
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
          whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
          className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#F47B20] hover:bg-[#E96512] text-white shadow-xl hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-orange-300"
          aria-label="Open Sasta Plots Assistant"
        >
          <MessageSquare className="w-6 h-6 text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
              {unreadCount}
            </span>
          )}
          <span className="absolute -top-10 right-0 bg-[#202124] text-white text-xs px-2.5 py-1 rounded-md shadow-md opacity-0 hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden sm:block">
            Chat with us
          </span>
        </motion.button>
      )}

      {/* Floating Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 sm:inset-auto sm:bottom-0 sm:right-0 w-full sm:w-[370px] h-full sm:h-[500px] max-h-full sm:max-h-[500px] bg-white sm:rounded-2xl shadow-2xl flex flex-col border border-[#EAEAEA] overflow-hidden z-50"
            role="dialog"
            aria-label="Sasta Plots Assistant Chat Window"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#F47B20] to-[#E96512] text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30 text-white shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-tight flex items-center gap-1.5 text-white">
                    Sasta Plots Assistant
                    <Sparkles className="w-3 h-3 text-amber-200 fill-amber-200" />
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[11px] text-white/90 font-medium">Online • Instant Help</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetChat}
                  title="Reset conversation"
                  aria-label="Reset conversation"
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  aria-label="Close chat"
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FFFDFB] scrollbar-thin">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={
                      msg.role === 'user'
                        ? 'chat-bubble-user text-sm shadow-sm'
                        : 'chat-bubble-bot text-sm shadow-xs'
                    }
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>

                  {/* Inline property results cards if returned */}
                  {msg.properties && msg.properties.length > 0 && (
                    <div className="mt-2.5 w-full max-w-[280px] space-y-2">
                      <p className="text-[11px] font-semibold text-[#727272] uppercase tracking-wider px-1">
                        Matching Listings:
                      </p>
                      {msg.properties.slice(0, 3).map((prop) => (
                        <Link
                          key={prop.id}
                          to={`/properties/${prop.slug || prop.id}`}
                          onClick={() => {
                            if (window.innerWidth < 640) setIsOpen(false)
                          }}
                          className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-[#EAEAEA] hover:border-[#F47B20] shadow-xs hover:shadow-sm transition-all group"
                        >
                          <img
                            src={
                              prop.images?.[0]?.url ||
                              'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=200&q=80'
                            }
                            alt={prop.title}
                            className="w-14 h-14 rounded-lg object-cover shrink-0 bg-gray-100"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-semibold text-[#202124] group-hover:text-[#F47B20] truncate">
                              {prop.title}
                            </h4>
                            <p className="text-xs font-bold text-[#F47B20]">
                              {formatPrice(prop.price)}
                            </p>
                            <p className="text-[11px] text-[#727272] truncate flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5 shrink-0" />
                              {prop.city?.name || prop.address || 'India'}
                            </p>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-[#727272] group-hover:text-[#F47B20] shrink-0 mr-1" />
                        </Link>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-gray-400 mt-1 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex items-start">
                  <div className="chat-bubble-bot flex items-center gap-1.5 py-3 px-4">
                    <span className="w-2 h-2 rounded-full bg-[#F47B20] animate-bounce" />
                    <span
                      className="w-2 h-2 rounded-full bg-[#F47B20] animate-bounce"
                      style={{ animationDelay: '0.15s' }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-[#F47B20] animate-bounce"
                      style={{ animationDelay: '0.3s' }}
                    />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Chips (visible when only 1 or 2 messages) */}
            {messages.length <= 2 && !isLoading && (
              <div className="p-2.5 border-t border-[#EAEAEA] bg-white overflow-x-auto no-scrollbar">
                <div className="flex gap-1.5 flex-nowrap whitespace-nowrap">
                  {SUGGESTED_QUESTIONS.map((question) => (
                    <button
                      key={question}
                      onClick={() => handleSendMessage(question)}
                      className="text-xs bg-[#FFF8F2] hover:bg-[#FFE4CC] text-[#F47B20] font-medium px-3 py-1.5 rounded-full border border-[#FCD2B2] transition-colors shrink-0 shadow-2xs"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-[#EAEAEA] flex items-center gap-2 shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about plots, approval, or pricing..."
                disabled={isLoading}
                className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-[#202124] focus:outline-none focus:border-[#F47B20] focus:bg-white transition-all disabled:opacity-50"
                maxLength={400}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputValue.trim()}
                className="w-10 h-10 rounded-xl bg-[#F47B20] hover:bg-[#E96512] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 transition-colors shadow-sm"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ChatWidget
