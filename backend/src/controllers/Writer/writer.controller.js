import { streamFromGemini } from "../../Services/gemini.js";
import { streamFromGroq } from "../../Services/groq.js";


export default async function writer(req, res) {
      const prompt = req.method === "GET" ? req.query.prompt : req.body.prompt;
      const provider = req.query.provider || "groq"; // ?provider=gemini

      if (provider === "gemini") {
            await streamFromGemini(prompt, res);
      } else {
            await streamFromGroq(prompt, res);
      }
}
