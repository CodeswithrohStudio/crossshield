'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Zap, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useRouter } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestedAction?: {
    type: 'OPEN_SHIELD';
    assetId: number;
    leverage: number;
    amount: number;
    assetName: string;
  };
}

const SUGGESTED_PROMPTS = [
  "What's the safest gold exposure?",
  "Go 5x on SOL",
  "Protect $1000 from inflation",
  "Best real estate shield for beginners",
  "Show me high-yield options under 20% liquidation risk",
];

export function ChatInterface({ walletAddress }: { walletAddress?: string }) {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('crossshield-chat') ?? '[]');
      } catch { return []; }
    }
    return [];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('crossshield-chat', JSON.stringify(messages));
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: newMessages.slice(-10),
          walletAddress,
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply,
        suggestedAction: data.suggestedAction,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I couldn't process that request. Make sure ANTHROPIC_API_KEY is configured.",
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">CrossShield AI</h2>
            <p className="text-muted-foreground text-sm max-w-sm">
              Ask me about shields, risk levels, or just tell me what you want to achieve.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
            {SUGGESTED_PROMPTS.map(prompt => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="text-left px-3 py-2.5 bg-card border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className={cn(
                'max-w-[80%] rounded-2xl px-4 py-3 text-sm',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-sm'
                  : 'bg-card border border-border rounded-tl-sm'
              )}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.suggestedAction && (
                  <div className="mt-3 p-3 bg-primary/10 rounded-xl border border-primary/20">
                    <p className="text-xs text-primary font-semibold mb-2">
                      Suggested: {msg.suggestedAction.assetName} {msg.suggestedAction.leverage}x Shield
                    </p>
                    <button
                      onClick={() => router.push(`/shield/new?assetId=${msg.suggestedAction!.assetId}&leverage=${msg.suggestedAction!.leverage}`)}
                      className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-medium"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Open Shield
                    </button>
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            placeholder="Ask about shields, risk, or say what you want..."
            className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-colors"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
