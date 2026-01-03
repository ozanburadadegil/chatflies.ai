import { GoogleGenAI, Tool } from "@google/genai";
import { AnalysisReport, ChatMessage, UserProfile, ApiResponse } from "../types";
import { MOCK_DATABASE, SYSTEM_PROMPT } from "../constants";

// --- Cloud Function Configuration ---
// In a real app, these would be separate files/Environment Variables
const MODELS = {
  free: "gemini-3-flash-preview",
  pro: "gemini-3-pro-preview"
};

// --- Tool Logic (Server Side) ---

const fetchChatMessagesTool = (args: any): { messages: ChatMessage[] } => {
  console.log("☁️ [Server] fetch_chat_messages", args);
  const { source, channel_or_thread_id, participants, query, time_range, limit = 50 } = args;

  let filtered = MOCK_DATABASE.filter(msg => {
    if (source && source !== 'all' && msg.source !== source) return false;
    if (channel_or_thread_id && !msg.channel_or_thread_id.includes(channel_or_thread_id)) return false;
    if (participants && participants.length > 0) {
      const senderMatch = participants.some((p: string) => msg.sender.toLowerCase().includes(p.toLowerCase()));
      if (!senderMatch) return false;
    }
    if (time_range) {
      const msgDate = new Date(msg.timestamp_iso).getTime();
      const startDate = new Date(time_range.start_iso).getTime();
      const endDate = new Date(time_range.end_iso).getTime();
      if (msgDate < startDate || msgDate > endDate) return false;
    }
    if (query) {
      const textMatch = msg.text.toLowerCase().includes(query.toLowerCase());
      if (!textMatch) return false;
    }
    return true;
  });

  filtered = filtered.slice(0, limit);
  return { messages: filtered };
};

// --- Main Endpoint Handler ---

export const callAnalyzeEndpoint = async (
  user: UserProfile,
  message: string,
  history: any[]
): Promise<ApiResponse> => {
  console.log(`☁️ [Server] Request from ${user.tier} user. Credits: ${user.credits}`);

  // 1. Credit Check
  if (user.credits <= 0) {
    return {
      text: "",
      remainingCredits: 0,
      error: {
        code: "INSUFFICIENT_CREDITS",
        message: "You have run out of credits. Please upgrade to Pro or wait for refill."
      }
    };
  }

  // 2. Initialize Gemini (Server-Side only)
  // Note: API Key is accessed via process.env.API_KEY
  if (!process.env.API_KEY) {
    return {
      text: "",
      remainingCredits: user.credits,
      error: { code: "SERVER_ERROR", message: "Server configuration error: API Key missing." }
    };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = MODELS[user.tier];
  console.log(`☁️ [Server] Using model: ${modelName}`);

  const tools: Tool[] = [
    {
      functionDeclarations: [
        {
          name: "fetch_chat_messages",
          description: "Retrieve chat messages previously ingested into chatflies.ai based on filters.",
          parameters: {
            type: "OBJECT",
            properties: {
              workspace_id: { type: "STRING" },
              source: { type: "STRING", enum: ["slack", "telegram", "import", "all"] },
              channel_or_thread_id: { type: "STRING", nullable: true },
              participants: { type: "ARRAY", items: { type: "STRING" } },
              query: { type: "STRING", nullable: true },
              time_range: {
                type: "OBJECT",
                properties: {
                  start_iso: { type: "STRING" },
                  end_iso: { type: "STRING" }
                }
              },
              limit: { type: "NUMBER" }
            },
            required: ["workspace_id", "time_range"]
          }
        },
        {
          name: "save_report",
          description: "Save the generated chatflies.ai report and return a details URL.",
          parameters: {
            type: "OBJECT",
            properties: {
              workspace_id: { type: "STRING" },
              report: {
                type: "OBJECT",
                properties: {
                  whatsapp_reply: { type: "STRING" },
                  workspace_id: { type: "STRING" },
                  request: { type: "OBJECT" },
                  summary_bullets: { type: "ARRAY", items: { type: "STRING" } },
                  action_items: { type: "ARRAY", items: { type: "OBJECT" } },
                  decisions: { type: "ARRAY", items: { type: "STRING" } },
                  risks: { type: "ARRAY", items: { type: "STRING" } },
                  participants: { type: "ARRAY", items: { type: "STRING" } },
                  channels_or_threads: { type: "ARRAY", items: { type: "STRING" } },
                  details_url: { type: "STRING" },
                  confidence: { type: "NUMBER" }
                },
                required: ["whatsapp_reply", "summary_bullets", "action_items", "decisions", "risks", "confidence"]
              }
            },
            required: ["workspace_id", "report"]
          }
        }
      ]
    }
  ];

  try {
    const model = ai.models.getGenerativeModel({
      model: modelName,
      systemInstruction: SYSTEM_PROMPT,
      tools: tools
    });

    const chat = model.startChat({
      history: history.map(h => ({
          role: h.role,
          parts: [{ text: h.content }]
      }))
    });

    // Capture the saved report if the tool is called
    let savedReport: AnalysisReport | undefined;

    // First Turn
    const result = await chat.sendMessage(message);
    const response = result.response;
    
    const calls = response.functionCalls();
    
    if (calls && calls.length > 0) {
      const toolParts = [];
      
      for (const call of calls) {
        let functionResponse;
        
        if (call.name === "fetch_chat_messages") {
          functionResponse = fetchChatMessagesTool(call.args);
        } 
        else if (call.name === "save_report") {
          console.log("☁️ [Server] save_report called");
          // Process report saving on the server
          const reportData = call.args.report;
          const reportId = "rpt_" + Math.random().toString(36).substr(2, 9);
          const detailsUrl = `chatflies.ai/reports/${reportId}`;
          
          savedReport = {
            ...reportData,
            details_url: detailsUrl,
            generated_at: new Date().toISOString()
          };
          
          functionResponse = {
            report_id: reportId,
            details_url: detailsUrl
          };
        } 
        else {
            functionResponse = { error: "Unknown tool" };
        }
        
        toolParts.push({
            functionResponse: {
                name: call.name,
                response: functionResponse
            }
        });
      }

      // Send tool results back to model
      const finalResult = await chat.sendMessage(toolParts);
      const finalResponseText = finalResult.response.text();

      // Deduct Credit
      const remainingCredits = user.credits - 1;

      return {
        text: finalResponseText,
        savedReport: savedReport,
        remainingCredits: remainingCredits
      };
    }
    
    // Fallback if no tools called (unlikely given system prompt)
    return {
      text: response.text(),
      remainingCredits: user.credits - 1
    };

  } catch (error: any) {
    console.error("☁️ [Server] Error:", error);
    return {
      text: "",
      remainingCredits: user.credits,
      error: { code: "API_ERROR", message: error.message || "Internal Server Error" }
    };
  }
};