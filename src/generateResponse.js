import { GoogleGenAI } from "@google/genai";
import { initChatbot } from "./chatUI";

const ai = new GoogleGenAI({
  apiKey: "AIzaSyAgi2QEFzcNT_tBIXGId8aSguqgnXiZnvs",
});

async function generateResponse(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "You are an expert relationship coach, providing empathetic and constructive advice on various relationship topics. Focus solely on relationship-related queries and offer practical guidance.",
      },
    });
    console.log(response.text);
    return response.text;
  } catch (error) {
    console.error(error);
  }
}

export { generateResponse };
