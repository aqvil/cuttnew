'use client'

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, UIMessage } from "ai"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparkles, Send, User, Bot, Loader2, Lightbulb } from "lucide-react"
import { useState } from "react"

const suggestions = [
  "Write a catchy bio description for a content creator",
  "Generate SEO-friendly title for my portfolio page",
  "Create a compelling call-to-action for newsletter signup",
  "Suggest link titles for my social media profiles",
  "Write a professional bio for a freelance developer",
]

function getUIMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ''
  return msg.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('')
}

export default function AIAssistantPage() {
  const [input, setInput] = useState("")
  
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai/chat",
    }),
  })

  const isLoading = status === "streaming" || status === "submitted"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    const message = input
    setInput("")
    await sendMessage({ text: message })
  }

  const handleSuggestion = async (suggestion: string) => {
    setInput("")
    await sendMessage({ text: suggestion })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-8 w-8" />
          AI Assistant
        </h1>
        <p className="text-muted-foreground">
          Get help with bio descriptions, link titles, and SEO content
        </p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b shrink-0">
          <CardTitle className="text-base">Chat with AI</CardTitle>
          <CardDescription>
            Powered by Groq - fast AI responses to help you create better content
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">How can I help you?</h3>
                <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
                  I can help you write bio descriptions, generate catchy titles, 
                  and create SEO-optimized content for your pages.
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestion(suggestion)}
                      disabled={isLoading}
                      className="text-xs px-3 py-2 rounded-full border bg-background hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      <Lightbulb className="inline h-3 w-3 mr-1" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.role === "user" ? "justify-end" : ""
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        message.role === "user"
                          ? "bg-foreground text-background"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{getUIMessageText(message)}</p>
                    </div>
                    {message.role === "user" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground">
                        <User className="h-4 w-4 text-background" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="rounded-lg px-4 py-2 bg-muted">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
          <div className="border-t p-4 shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your bio pages or links..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
