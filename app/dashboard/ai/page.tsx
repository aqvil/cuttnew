'use client'

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, UIMessage } from "ai"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparkles, Send, User, Bot, Loader2 } from "lucide-react"
import { useState } from "react"

const suggestions = [
  "Write a catchy bio description for a content creator",
  "Generate SEO-friendly title for my portfolio page",
  "Create a compelling call-to-action for newsletter signup",
  "Suggest link titles for my social media profiles",
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
    <div className="flex h-[calc(100vh-10rem)] flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">AI Assistant</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate bio descriptions, titles, and SEO content
        </p>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card">
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <Sparkles className="size-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-sm font-medium">How can I help you?</h3>
              <p className="mt-1 max-w-sm text-center text-xs text-muted-foreground">
                I can help you write bio descriptions, generate catchy titles, 
                and create SEO-optimized content for your pages.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestion(suggestion)}
                    disabled={isLoading}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs transition-colors hover:bg-accent disabled:opacity-50"
                  >
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
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
                      <Bot className="size-4 text-muted-foreground" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      message.role === "user"
                        ? "bg-foreground text-background"
                        : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm">{getUIMessageText(message)}</p>
                  </div>
                  {message.role === "user" && (
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-foreground">
                      <User className="size-4 text-background" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex items-start gap-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Bot className="size-4 text-muted-foreground" />
                  </div>
                  <div className="rounded-lg bg-muted px-3 py-2">
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
        
        <div className="shrink-0 border-t border-border p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your bio pages or links..."
              disabled={isLoading}
              className="flex-1 bg-background"
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
