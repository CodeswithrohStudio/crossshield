import { NextRequest, NextResponse } from 'next/server';
import { ASSETS } from '../../../lib/assets';

interface ChatRequest {
  message: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  walletAddress?: string;
}

function mockChatResponse(message: string): { reply: string; suggestedAction?: object } {
  const lower = message.toLowerCase();

  if (lower.includes('gold') || lower.includes('inflation')) {
    return {
      reply: "Gold Shield is the safest option for inflation protection. At 5x leverage with only 10% liquidation risk, you get 5.8% annualized returns while your principal stays 100% protected. The zero-coupon bond structure locks your deposit and uses only earned yield as margin.",
      suggestedAction: { type: 'OPEN_SHIELD', assetId: 0, leverage: 5, amount: 1000, assetName: 'Gold' },
    };
  }
  if (lower.includes('sol') || lower.includes('solana')) {
    return {
      reply: "SOL Shield at 1x is remarkable — 44.6% annualized return with zero liquidation risk (the yield margin comfortably covers 1x exposure). For higher upside, 5x SOL gives ~180% returns but with ~25% liquidation risk. Your principal is always safe either way.",
      suggestedAction: { type: 'OPEN_SHIELD', assetId: 6, leverage: 1, amount: 1000, assetName: 'Solana' },
    };
  }
  if (lower.includes('safe') || lower.includes('conservative') || lower.includes('beginner')) {
    return {
      reply: "For the safest exposure, I recommend:\n1. Gold 1x (1.6% return, near-zero liquidation risk)\n2. Nashville Real Estate 1x (10.2% return, 1% liq risk)\n3. Gold 2x (3.2% return, 3% liq risk)\n\nAll options protect 100% of your principal through CrossShield's zero-coupon bond vault.",
      suggestedAction: { type: 'OPEN_SHIELD', assetId: 0, leverage: 1, amount: 1000, assetName: 'Gold' },
    };
  }
  if (lower.includes('btc') || lower.includes('bitcoin')) {
    return {
      reply: "Bitcoin Shield: 1x gives ~62% annualized with zero liquidation risk. 5x gives ~250% with ~30% liquidation risk. Even if liquidated, your original deposit is returned in full.",
      suggestedAction: { type: 'OPEN_SHIELD', assetId: 4, leverage: 1, amount: 1000, assetName: 'Bitcoin' },
    };
  }

  return {
    reply: `I can help you find the right CrossShield strategy. Here's what I know:\n\n• **25 assets** available: commodities, crypto, and 17 US real estate markets\n• **Leverage**: 1x to 50x — higher leverage = more upside AND more yield burn risk\n• **Your principal is ALWAYS 100% protected** — the vault uses zero-coupon bond math\n\nWhat are you trying to achieve? Hedge against inflation? Maximize yield? Gain crypto exposure without downside risk?`,
  };
}

export async function POST(req: NextRequest) {
  const body: ChatRequest = await req.json();
  const { message, history, walletAddress } = body;

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(mockChatResponse(message));
  }

  const assetList = ASSETS.map(a => `${a.id}: ${a.name} (${a.symbol})`).join(', ');

  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey });

    const systemPrompt = `You are the CrossShield AI assistant — a friendly, knowledgeable DeFi advisor for CrossShield's principal-protected vault platform on Polkadot Hub.

CrossShield key facts:
- Users deposit USDC → principal is 100% protected via zero-coupon bond math (PV = FV/(1+r)^t at 5% APY)
- Only the yield generated is used as margin for leveraged positions
- 25 assets available: ${assetList}
- Leverage: 1x to 50x
- If position wins: user gets principal + leveraged profit
- If position loses: yield absorbs the loss, user gets 100% principal back

When user wants to take a position, respond with JSON:
{
  "reply": "your helpful explanation",
  "suggestedAction": {
    "type": "OPEN_SHIELD",
    "assetId": <number 0-24>,
    "leverage": <1-50>,
    "amount": <suggested USDC amount>,
    "assetName": "<name>"
  }
}

If no action needed, respond with just: {"reply": "your message"}

Keep replies concise, friendly, and educational. Always remind users their principal is protected.
User wallet: ${walletAddress ?? 'not connected'}`;

    const messages = [
      ...history.slice(-8).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user' as const, content: message },
    ];

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      system: systemPrompt,
      messages,
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    try {
      const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({ reply: text });
    }
  } catch (e) {
    console.error('Chat API error:', e);
    return NextResponse.json(mockChatResponse(message));
  }
}
