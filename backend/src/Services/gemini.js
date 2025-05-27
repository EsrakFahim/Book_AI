import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../constant.js";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function streamFromGemini(prompt, res) {
      if (!prompt) {
            res.status(400).json({ message: "Prompt is required" });
            return;
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent(prompt);
            const text = result.response.text();

            // Simulate streaming by sending chunks
            const chunks = text.match(/.{1,100}/g); // 100-character chunks
            for (const chunk of chunks) {
                  res.write(`data: ${chunk}\n\n`);
                  await new Promise((r) => setTimeout(r, 20)); // Delay to simulate real stream
            }

            res.write(`event: done\ndata: end\n\n`);
            res.end();
      } catch (err) {
            console.error("Gemini Error:", err.message);
            res.write(`event: error\ndata: ${err.message}\n\n`);
            res.end();
      }
}
