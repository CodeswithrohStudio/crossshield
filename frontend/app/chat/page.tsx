'use client';

import { useAccount } from 'wagmi';
import { ChatInterface } from '../../components/ChatInterface';
import { MessageSquare } from 'lucide-react';

export default function ChatPage() {
  const { address, isConnected } = useAccount();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold">CrossShield AI</h1>
          <p className="text-xs text-muted-foreground">
            {isConnected ? 'Connected — AI can suggest and execute shields' : 'Connect wallet to execute suggestions'}
          </p>
        </div>
      </div>
      <div className="flex-1 bg-card border border-border rounded-2xl overflow-hidden flex flex-col min-h-0">
        <ChatInterface walletAddress={address} />
      </div>
    </div>
  );
}
