import { NextRequest, NextResponse } from 'next/server';
import { BACKTEST_DATA } from '../../../lib/backtest-data';
import { ASSETS } from '../../../lib/assets';

interface RecommendRequest {
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  amount: number;
}

function mockRecommendations(riskTolerance: string, amount: number) {
  let filtered = BACKTEST_DATA;

  if (riskTolerance === 'conservative') {
    filtered = BACKTEST_DATA.filter(e => e.liquidationRisk < 10 && e.leverage <= 5);
  } else if (riskTolerance === 'moderate') {
    filtered = BACKTEST_DATA.filter(e => e.liquidationRisk < 30 && e.leverage <= 20);
  } else {
    filtered = BACKTEST_DATA.filter(e => e.leverage >= 5);
  }

  const sorted = filtered
    .sort((a, b) => b.avgAnnualizedReturn - a.avgAnnualizedReturn)
    .slice(0, 3);

  return {
    recommendations: sorted.map(e => ({
      assetId: e.assetId,
      assetName: e.assetName,
      leverage: e.leverage,
      expectedReturn: e.avgAnnualizedReturn,
      liquidationRisk: e.liquidationRisk,
      estimatedProfit: (amount * e.avgAnnualizedReturn) / 100,
      reasoning: `${e.assetName} at ${e.leverage}x offers ${e.avgAnnualizedReturn}% annualized return with ${e.liquidationRisk}% liquidation risk. Your $${amount} deposit is fully protected.`,
    })),
  };
}

export async function POST(req: NextRequest) {
  const body: RecommendRequest = await req.json();
  const { riskTolerance, amount } = body;

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(mockRecommendations(riskTolerance, amount));
  }

  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey });

    const topData = BACKTEST_DATA
      .filter(e => riskTolerance === 'conservative' ? e.liquidationRisk < 15
        : riskTolerance === 'moderate' ? e.liquidationRisk < 35
        : true)
      .sort((a, b) => b.avgAnnualizedReturn - a.avgAnnualizedReturn)
      .slice(0, 15);

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `You are a DeFi advisor for CrossShield. A user with ${riskTolerance} risk tolerance wants to invest $${amount} USDC.

Top backtested options:
${topData.map(e => `${e.assetName} ${e.leverage}x: ${e.avgAnnualizedReturn}% return, ${e.liquidationRisk}% liq risk`).join('\n')}

Recommend the top 3 and return ONLY this JSON (no markdown):
{
  "recommendations": [
    {
      "assetId": <number>,
      "assetName": "<name>",
      "leverage": <number>,
      "expectedReturn": <number>,
      "liquidationRisk": <number>,
      "estimatedProfit": <number>,
      "reasoning": "<1-2 sentences>"
    }
  ]
}`,
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
    return NextResponse.json(parsed);
  } catch (e) {
    console.error('Recommend API error:', e);
    return NextResponse.json(mockRecommendations(riskTolerance, amount));
  }
}
