import { GoogleGenAI } from "@google/genai";
import { Transaction, Goal } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export async function getFinancialAdvice(
  userProfile: { displayName: string },
  transactions: Transaction[],
  goals: Goal[],
  userMessage: string
) {
  const model = "gemini-3-flash-preview";
  
  const financialSummary = transactions.map(t => ({
    type: t.type,
    amount: t.amount,
    category: t.category,
    date: t.date.split('T')[0]
  }));

  const systemInstruction = `
    Você é o Finanza AI, um consultor financeiro pessoal amigável, motivador e realista.
    Seu objetivo é ajudar usuários leigos e desorganizados a terem controle sobre o dinheiro.
    Use linguagem simples, direta e evite termos técnicos complicados.
    
    Contexto do usuário (${userProfile.displayName}):
    - Histórico recente de transações: ${JSON.stringify(financialSummary.slice(0, 20))}
    - Metas atuais: ${JSON.stringify(goals)}
    
    Diretrizes:
    1. Se o usuário estiver gastando muito em uma categoria, aponte isso de forma gentil.
    2. Sugira economias práticas (ex: "tente economizar R$10 por dia").
    3. Identifique padrões de gastos.
    4. Mantenha as respostas curtas e focadas em ação.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: userMessage,
      config: {
        systemInstruction,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Desculpe, tive um problema ao analisar seus dados agora. Pode tentar novamente em instantes?";
  }
}
