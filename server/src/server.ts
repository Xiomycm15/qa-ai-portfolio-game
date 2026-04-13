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

Bug ID: (Unique identifier for the issue. Example: BUG-1042)

Title: (Short one-line description of the problem. Someone should understand the issue quickly just by reading it)

Severity: (How technically serious the bug is. Example: 
Critical → System unusable / data loss / crash
High → Major feature broken
Medium → Important but workaround exists
Low → Minor issue / cosmetic)

Priority: (How urgent it is to fix this bug. Example:
P1 → Must fix immediately
P2 → Fix in next release
P3 → Fix when possible)

Environment: (Where the bug happens. Example:
Browser
OS
Device
App version
Production/Staging/QA)

Preconditions: (What needs to be in place before the bug can be reproduced. Example:
User must be logged in
User must have admin role
Specific data must exist)

Steps to Reproduce: (Exact steps to see the bug. Be as detailed as possible. Example:
1. Go to login page
2. Enter valid credentials
3. Click "Login"
4. Observe error message)

Expected Result: (What should happen if the bug didn't exist. Example: User should be logged in and redirected to dashboard)

Actual Result: (What actually happens because of the bug. Example: User sees an error message and stays on login page)

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

app.post("/test-plan", async (req, res) => {
  try {
    const { userStory } = req.body as { userStory: string };

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

Create a concise test plan from the user story.

Respond in this format:

User Story Summary: (one short sentence)

Assumptions: (only if needed)

Acceptance Criteria:
- (clear, testable criteria)

Test Scenarios:
Scenario 1: (short title)
Given (initial context)
When (user action)
Then (expected result)

Scenario 2: (short title)
Given (initial context)
When (user action)
Then (expected result)

Scenario 3: (short title)
Given (initial context)
When (user action)
Then (expected result)

Edge Cases:
- (important negative or boundary cases)

Keep it practical for manual QA and automation.
Avoid generic scenarios.
`
          },
          {
            role: "user",
            content: userStory
          }
        ]
      })
    });

    const data = await response.json();

    console.log("🧪 TEST PLAN RESPONSE:", JSON.stringify(data, null, 2));

    const result =
      data.choices?.[0]?.message?.content ||
      data.error?.message ||
      JSON.stringify(data);

    console.log("TEST PLAN RESULT:", result);

    res.json({ result });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "Test plan generation failed" });
  }
});

app.listen(3000, () => {
  console.log("🚀 AI server running on http://localhost:3000");
});
