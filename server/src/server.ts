import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.OPENAI_API_KEY as string;

app.post("/analyze", async (req, res) => {
  try {
    const { bug } = req.body as { bug: string };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
content: `
You are a senior QA engineer.

Analyze the bug SPECIFICALLY.

Respond in this format:

Root cause: (be precise about what is undefined and where)
Fix: (give exact code-level suggestion)
QA insight: (what test would prevent this)

Keep it short and concrete.
Avoid generic explanations.
`        },
          {
            role: "user",
            content: bug
          }
        ]
      })
    });

const data = await response.json();

console.log("🔥 FULL RESPONSE:", JSON.stringify(data, null, 2));

const result =
  data.choices?.[0]?.message?.content ||
  data.error?.message ||
  JSON.stringify(data);

console.log("AI RESULT:", result);

res.json({ result });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "AI failed" });
  }
});

app.listen(3000, () => {
  console.log("🚀 AI server running on http://localhost:3000");
});