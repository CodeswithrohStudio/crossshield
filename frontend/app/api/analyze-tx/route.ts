import { NextRequest, NextResponse } from 'next/server';

interface AnalyzeRequest {
  to: string;
  calldata: string;
  value: string;
  assetName: string;
  leverage: number;
  amount?: number;
}

interface RiskAnalysis {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  summary: string;
  warnings: string[];
  recommendation: 'PROCEED' | 'CAUTION' | 'ABORT';
}

function mockAnalysis(assetName: string, leverage: number): RiskAnalysis {
  let riskScore = 15;
  const warnings: string[] = [];

  if (leverage >= 50) { riskScore = 85; warnings.push('50x leverage: yield may not cover losses in volatile markets.'); }
  else if (leverage >= 20) { riskScore = 65; warnings.push(`${leverage}x leverage significantly increases liquidation probability.`); }
  else if (leverage >= 10) { riskScore = 45; warnings.push(`${leverage}x leverage requires monitoring. Set alerts.`); }
  else if (leverage >= 5) { riskScore = 28; }
  else { riskScore = 15; }

  if (assetName.toLowerCase().includes('sol') || assetName.toLowerCase().includes('btc') || assetName.toLowerCase().includes('eth')) {
    riskScore = Math.min(100, riskScore + 10);
    warnings.push('Crypto assets are highly volatile; 24/7 price moves can exceed yield buffer.');
  }

  const riskLevel: RiskAnalysis['riskLevel'] =
    riskScore < 25 ? 'LOW' : riskScore < 50 ? 'MEDIUM' : riskScore < 75 ? 'HIGH' : 'CRITICAL';

  const recommendation: RiskAnalysis['recommendation'] =
    riskScore < 50 ? 'PROCEED' : riskScore < 75 ? 'CAUTION' : 'ABORT';

  const summary =
    riskLevel === 'LOW'
      ? `Opening a ${leverage}x long position on ${assetName}. Yield margin provides comfortable downside protection. Principal is 100% secured.`
      : riskLevel === 'MEDIUM'
      ? `This ${leverage}x ${assetName} shield carries moderate risk. Your yield margin may be consumed by adverse price moves, but your principal remains safe.`
      : `${leverage}x leverage on ${assetName} is aggressive. While your $${leverage > 20 ? 'principal' : 'principal'} is always protected, the likelihood of your entire yield margin being consumed is high.`;

  return { riskScore, riskLevel, summary, warnings, recommendation };
}

export async function POST(req: NextRequest) {
  const body: AnalyzeRequest = await req.json();
  const { assetName, leverage } = body;

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(mockAnalysis(assetName, leverage));
  }

  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `You are a Web3 security expert analyzing a CrossShield DeFi transaction.

Transaction details:
- Asset: ${assetName}
- Leverage: ${leverage}x
- Contract: CrossShieldVault (principal-protected vault)
- Principal is 100% protected by zero-coupon bond math
- Only yield (earned interest) is used as margin

Analyze this and return ONLY valid JSON (no markdown, no explanation):
{
  "riskScore": <0-100>,
  "riskLevel": "<LOW|MEDIUM|HIGH|CRITICAL>",
  "summary": "<2 sentences, plain English, mention principal protection>",
  "warnings": ["<warning1>", "<warning2>"],
  "recommendation": "<PROCEED|CAUTION|ABORT>"
}`,
        },
      ],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed);
  } catch (e) {
    console.error('Claude API error:', e);
    return NextResponse.json(mockAnalysis(assetName, leverage));
  }
}
