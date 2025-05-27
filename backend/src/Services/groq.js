// services/ai/groq.service.js
import { OpenAI } from "openai";
import { GROQ_API_KEY } from "../constant.js";

const openai = new OpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: GROQ_API_KEY,
});

export async function streamFromGroq(prompt, res) {
      if (!prompt) {
            res.status(400).json({ message: "Prompt is required" });
            return;
      }

      // SSE headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      try {
            const stream = await openai.chat.completions.create({
                  model: "llama3-70b-8192", // Change this if needed
                  messages: [{ role: "user", content: prompt }],
                  stream: true,
            });

            for await (const chunk of stream) {
                  const content = chunk.choices?.[0]?.delta?.content;
                  if (content) {
                        res.write(`data: ${content}\n\n`);
                  }
            }

            res.write(`event: done\ndata: end\n\n`);
            res.end();
      } catch (err) {
            console.error("Groq Error:", err.message);
            res.write(`event: error\ndata: ${err.message}\n\n`);
            res.end();
      }
}
