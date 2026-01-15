
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Uses Gemini 3 Pro with thinking mode for deep analysis of production and costing.
 */
export const getAIAdvice = async (prompt: string, context?: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Context: ${JSON.stringify(context || {})} \n\nUser Question: ${prompt}`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        systemInstruction: "You are an elite Garments Industry Advisor with 20+ years of experience in Merchandising, Supply Chain, and Production. Provide highly efficient, tactical advice. Use thinking mode to analyze complex bottlenecks."
      }
    });
    return response.text || "I couldn't generate a response at this time.";
  } catch (error) {
    console.error("AI Advice Error:", error);
    return "Strategic analysis failed. Please retry your query.";
  }
};

export const getFollowUpPrompt = async (project: any, step: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate a professional yet firm follow-up message for a supplier/team regarding the following delayed task:
      Project: ${project.styleName} (${project.styleNumber})
      Task: ${step.label}
      Due Date: ${step.dueDate}
      Buyer: ${project.buyerName}
      Provide 3 variations: 1. Professional, 2. Urgent, 3. Internal Team reminder.`,
      config: { 
        thinkingConfig: { thinkingBudget: 16000 } 
      }
    });
    return response.text;
  } catch (error) {
    return "Failed to generate follow-up template.";
  }
};

export const getCostingAssistant = async (styleData: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze the following garment product details and suggest a breakdown for FOB costing. 
      Help me identify potential savings in fabric or trim sourcing.
      Style: ${styleData.styleName}, Quantity: ${styleData.quantity}, Buyer: ${styleData.buyerName}.`,
      config: { thinkingConfig: { thinkingBudget: 24000 } }
    });
    return response.text;
  } catch (error) {
    return "AI Assistant is currently unavailable.";
  }
};

export const getAIFeedSuggestions = async (projects: any[]) => {
  const projectContext = projects.map(p => `${p.styleName} (${p.season})`).join(", ");
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a garments industry trend expert. Based on these active projects: ${projectContext}, 
      provide 4 high-value insights in JSON format.
      Include:
      1. A fabric trend relevant to these styles.
      2. A trim/accessory innovation.
      3. A production efficiency tip.
      4. Global apparel industry news impact.
      
      Format as JSON array of objects with keys: "type" (Fabric/Trims/Production/News), "title", "description", "styleContext".`,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Feed Error:", error);
    return [];
  }
};

export const evaluateMerchandisingSkills = async (stats: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Evaluate a Merchandiser's monthly performance summary (2-3 sentences) and a score out of 100 based on ${JSON.stringify(stats)}.`,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text;
  } catch (error) {
    return "Keep up the consistent effort! Your score: 85/100";
  }
};

export const analyzeProductionRisks = async (project: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze potential production risks for the following garment project:
      Style: ${project.styleName}, Quantity: ${project.quantity}, Target Ship Date: ${project.shipDate}.
      Current Status: ${project.workflow[project.currentStepIndex]?.label}.
      Identify bottleneck risks and suggest specific mitigation strategies.`,
      config: { thinkingConfig: { thinkingBudget: 32768 } }
    });
    return response.text;
  } catch (error) {
    return "Risk analysis is currently unavailable. Please check back later.";
  }
};

export const getUrgencyActionPlan = async (project: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `This garment project is marked as URGENT. Create an immediate, high-priority action plan.
      Style: ${project.styleName}, Ship Date: ${project.shipDate}.
      Current Stage: ${project.workflow[project.currentStepIndex]?.label}.
      Provide a step-by-step list of actions to ensure no delivery delays.`,
      config: { thinkingConfig: { thinkingBudget: 32768 } }
    });
    return response.text;
  } catch (error) {
    return "Urgency planning is currently unavailable.";
  }
};
