import { GoogleGenAI } from "@google/genai";
import { authDB } from "./app.js";

const ai = new GoogleGenAI({
  apiKey: "AIzaSyAgi2QEFzcNT_tBIXGId8aSguqgnXiZnvs",
});

const chatSessions = new Map();

async function generateResponse(prompt, conversationId) {
  try {
    // Get or create chat session
    let chatSession;

    if (conversationId && chatSessions.has(conversationId)) {
      // Use existing chat session
      chatSession = chatSessions.get(conversationId);
    } else {
      // Create new chat session
      let history = [];

      if (conversationId) {
        // Load conversation history from database
        const conversation = await authDB.getConversation(conversationId);
        if (conversation && conversation.messages) {
          // Convert stored messages to Gemini chat history format
          history = conversation.messages.map((msg) => ({
            role: msg.sender === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
          }));
        }
      }

      // Create new chat with history
      chatSession = ai.chats.create({
        model: "gemini-2.5-flash",
        history: history,
        config: {
          systemInstruction:
            "You are an expert relationship coach, providing empathetic and constructive advice on various relationship topics. Focus solely on relationship-related queries and offer practical guidance. Remember the full conversation history and maintain context.",
        },
      });

      // Store the chat session
      if (conversationId) {
        chatSessions.set(conversationId, chatSession);
      }
    }

    // Send message using the chat session
    const response = await chatSession.sendMessage({
      message: prompt,
    });

    console.log("AI Response:", response.text);
    return response.text;
  } catch (error) {
    console.error("Error generating response:", error);
    // Fallback to simple generation if chat fails
    return generateFallbackResponse(prompt);
  }
}

// Fallback function in case chat fails
async function generateFallbackResponse(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "You are an expert relationship coach, providing empathetic and constructive advice on various relationship topics. Focus solely on relationship-related queries and offer practical guidance.",
      },
    });
    return response.text;
  } catch (fallbackError) {
    console.error("Fallback generation also failed:", fallbackError);
    return "Sorry, I encountered an error. Please try again.";
  }
}

// Function to clear chat session when starting new conversation
function clearChatSession(conversationId) {
  if (conversationId && chatSessions.has(conversationId)) {
    chatSessions.delete(conversationId);
  }
}

// Function to update chat session when loading existing conversation
async function updateChatSession(conversationId) {
  if (!conversationId) return;

  // Clear existing session if any
  if (chatSessions.has(conversationId)) {
    chatSessions.delete(conversationId);
  }

  // Load conversation history from database
  const conversation = await authDB.getConversation(conversationId);
  if (!conversation || !conversation.messages) return;

  // Convert stored messages to Gemini chat history format
  const history = conversation.messages.map((msg) => ({
    role: msg.sender === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));

  // Create new chat session with history
  const chatSession = ai.chats.create({
    model: "gemini-2.5-flash",
    history: history,
    config: {
      systemInstruction:
        "You are an expert relationship coach, providing empathetic and constructive advice on various relationship topics. Focus solely on relationship-related queries and offer practical guidance. Remember the full conversation history and maintain context.",
    },
  });

  // Store the chat session
  chatSessions.set(conversationId, chatSession);
}

export { generateResponse, clearChatSession, updateChatSession };
