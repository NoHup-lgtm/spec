import React, { useEffect, useState, useRef } from 'react'

const App: React.FC = () => {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsStreaming(true)

    try {
      // Placeholder for AI response logic
      const response = await window.ghost.sendMessage(userMessage)
      if (!response.success) {
        setMessages((prev) => [...prev, { role: 'assistant', content: `Erro: ${response.error}` }])
      }
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setIsStreaming(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="w-screen h-screen p-4 flex items-center justify-center bg-transparent">
      <div className="w-full max-w-2xl h-[500px] bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <span className="font-semibold text-white/80">Ghost Assistant</span>
          <button 
            onClick={() => window.ghost.hideWindow()}
            className="text-white/40 hover:text-white/80 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-xl ${
                msg.role === 'user' 
                  ? 'bg-blue-600/60 text-white' 
                  : 'bg-white/10 text-white/90 border border-white/10'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/5 border-t border-white/10">
          <textarea
            autoFocus
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte algo ao Ghost..."
            className="w-full bg-white/10 border border-white/10 rounded-xl p-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30 resize-none"
          />
        </div>
      </div>
    </div>
  )
}

export default App
