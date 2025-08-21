"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, User, LogIn, UserPlus, Key, LogOut, Menu, Moon, Sun, Search } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { MarkdownMessage } from "@/components/markdown-message"
import { AuthModal } from "@/components/auth-modal"
import { ApiKeysModal } from "@/components/api-keys-modal"
import { ChatSidebar } from "@/components/chat-sidebar"
import { LanguageSelector } from "@/components/language-selector"

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface ChatUser {
  id: number
  username: string
  email: string
}

const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  if (targetLanguage === "en") return text

  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`,
    )
    const data = await response.json()
    return data[0][0][0] || text
  } catch (error) {
    console.error("Translation failed:", error)
    return text
  }
}

export default function PutinGPT() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<ChatUser | null>(null)
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showApiKeysModal, setShowApiKeysModal] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState("en")
  const [webSearchEnabled, setWebSearchEnabled] = useState(false)
  const { theme, setTheme } = useTheme()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      }
    }
    checkAuth()
  }, [])

  useEffect(() => {
    const translateMessages = async () => {
      if (currentLanguage === "en") return

      const translatedMessages = await Promise.all(
        messages.map(async (message) => {
          const translatedContent = await translateText(message.content, currentLanguage)
          return { ...message, content: translatedContent }
        }),
      )
      setMessages(translatedMessages)
    }

    if (currentLanguage !== "en" && messages.length > 0) {
      translateMessages()
    }
  }, [currentLanguage])

  const loadChatHistory = async (sessionId: number) => {
    try {
      const response = await fetch(`/api/chat/history?sessionId=${sessionId}`)
      if (response.ok) {
        const history = await response.json()
        if (history.length > 0) {
          const formattedHistory = history.map((msg: any) => ({
            id: msg.message_id,
            content: msg.content,
            role: msg.role,
            timestamp: new Date(msg.timestamp),
          }))
          setMessages(formattedHistory)
        } else {
          setMessages([])
        }
      }
    } catch (error) {
      console.error("Failed to load chat history:", error)
    }
  }

  const handleSessionSelect = (sessionId: number) => {
    setCurrentSessionId(sessionId)
    loadChatHistory(sessionId)
    setIsSidebarOpen(false)
  }

  const handleNewChat = () => {
    setCurrentSessionId(null)
    setMessages([])
    setIsSidebarOpen(false)
  }

  const handleLogin = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message)
    }

    const userData = await response.json()
    setUser(userData)
  }

  const handleRegister = async (username: string, email: string, password: string) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message)
    }

    const userData = await response.json()
    setUser(userData)
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    setCurrentSessionId(null)
    setMessages([])
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          userId: user?.id,
          messageId: userMessage.id,
          sessionId: currentSessionId,
          webSearchEnabled: webSearchEnabled,
          language: currentLanguage,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        let assistantContent = data.response || "I'm sorry, I couldn't process your request right now."

        if (currentLanguage !== "en") {
          assistantContent = await translateText(assistantContent, currentLanguage)
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: assistantContent,
          role: "assistant",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])

        if (data.sessionId && !currentSessionId) {
          setCurrentSessionId(data.sessionId)
        }
      } else {
        throw new Error("Failed to get response")
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm experiencing some technical difficulties. Please try again later.",
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="h-screen bg-background text-foreground flex">
      <AnimatePresence>
        {user && (isSidebarOpen || window.innerWidth >= 1024) && (
          <motion.div
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-y-0 left-0 z-40 w-64 bg-muted/30 backdrop-blur-sm border-r border-border/50 lg:static lg:translate-x-0"
          >
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto">
                <ChatSidebar
                  userId={user.id}
                  currentSessionId={currentSessionId}
                  onSessionSelect={handleSessionSelect}
                  onNewChat={handleNewChat}
                />
              </div>

              <div className="p-3 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span className="truncate">{user.username}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col relative">
        <header className="flex items-center justify-between p-3 border-b border-border/50 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {user && (
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                <Menu className="w-4 h-4" />
              </Button>
            )}

            <div className="flex items-center gap-2">
              <img src="/imagine-gpt-logo.png" alt="PutinGPT" className="w-6 h-6 rounded" />
              <span className="font-semibold">FredGPT</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSelector currentLanguage={currentLanguage} onLanguageChange={setCurrentLanguage} />

            <Button variant="ghost" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open("https://x.com/FredGPTSolana", "_blank")}
              title="Follow us on X.com"
              className="hover:bg-accent hover:text-accent-foreground"
            >
              <XIcon className="w-4 h-4" />
            </Button>

            {user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => setShowApiKeysModal(true)}>
                  <Key className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => setShowAuthModal(true)}>
                  <LogIn className="w-4 h-4 mr-1" />
                  Login
                </Button>
                <Button variant="default" size="sm" onClick={() => setShowAuthModal(true)}>
                  <UserPlus className="w-4 h-4 mr-1" />
                  Sign up
                </Button>
              </>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="mb-8">
                <img src="/imagine-gpt-logo.png" alt="PutinGPT" className="w-16 h-16 mx-auto mb-4 rounded-xl" />
                <h1 className="text-3xl font-bold mb-2">How can I help you today?</h1>
                <p className="text-muted-foreground">I'm FredGPT, your AI assistant. Ask me anything!</p>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-6 ${message.role === "user" ? "ml-auto max-w-[80%]" : ""}`}
                  >
                    <div className="flex gap-3">
                      {message.role === "assistant" && (
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className="bg-primary text-primary-foreground p-0">
                            <img
                              src="/imagine-gpt-logo.png"
                              alt="AI"
                              className="w-full h-full object-cover rounded-full"
                            />
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div className={`flex-1 ${message.role === "user" ? "text-right" : ""}`}>
                        <div
                          className={`inline-block ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground rounded-2xl px-4 py-2 max-w-full"
                              : "text-foreground"
                          }`}
                        >
                          {message.role === "assistant" ? (
                            <MarkdownMessage content={message.content} />
                          ) : (
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          )}
                        </div>
                      </div>

                      {message.role === "user" && (
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className="bg-muted">
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground p-0">
                        <img src="/imagine-gpt-logo.png" alt="AI" className="w-full h-full object-cover rounded-full" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex gap-1 p-3">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: i * 0.2 }}
                            className="w-2 h-2 bg-muted-foreground/50 rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto p-4">
            <div className="relative">
              <div className="flex items-center gap-2 bg-background rounded-3xl border border-border shadow-sm p-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                  className={`rounded-full p-2 h-8 w-8 ${
                    webSearchEnabled
                      ? "bg-foreground text-background hover:bg-foreground/90"
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                  title={webSearchEnabled ? "Web search enabled" : "Enable web search"}
                >
                  <Search className="w-4 h-4" />
                </Button>

                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Message FredGPT..."
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70 text-base"
                  disabled={isLoading}
                />

                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  size="sm"
                  className="rounded-full p-2 h-8 w-8 bg-foreground hover:bg-foreground/90 text-background disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {webSearchEnabled && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2 px-3">
                  <Search className="w-3 h-3" />
                  <span>Searching the web</span>
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground text-center mt-3">
              FredGPT can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      <ApiKeysModal isOpen={showApiKeysModal} onClose={() => setShowApiKeysModal(false)} userId={user?.id || null} />
    </div>
  )
}
