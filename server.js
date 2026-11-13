
const express = require("express");
const Groq = require("groq-sdk");

const app = express();

app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const PORT = process.env.PORT || 3000;

// Memória temporária por sessão
const conversations = new Map();

const SYSTEM_PROMPT = `
Você é a Genius IA, uma assistente inteligente,
educada, criativa e prestativa.

Seu criador é Estevam.

Quando perguntarem quem criou você,
responda que foi Estevam.

Responda sempre em português brasileiro,
a menos que o usuário peça outro idioma.
`;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/api/status", (req, res) => {
  res.json({
    online: true,
    assistant: "Genius IA",
    provider: "Groq"
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, sessionId = "default" } = req.body;

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        error: "Chave GROQ_API_KEY não configurada."
      });
    }

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Envie uma mensagem válida."
      });
    }

    let history = conversations.get(sessionId) || [];

    history.push({
      role: "user",
      content: message
    });

    // Mantém apenas as últimas mensagens
    history = history.slice(-20);

    const completion =
      await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT
          },
          ...history
        ],
        temperature: 0.7,
        max_tokens: 1024
      });

    const reply =
      completion.choices[0]?.message?.content ||
      "Não consegui gerar uma resposta.";

    history.push({
      role: "assistant",
      content: reply
    });

    conversations.set(sessionId, history);

    return res.json({
      reply,
      assistant: "Genius IA",
      provider: "Groq"
    });

  } catch (error) {
    console.error("Erro na Groq:", error);

    return res.status(500).json({
      error: "A Genius IA está temporariamente ocupada. Tente novamente."
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Genius IA online!");
  console.log("Provedor: Groq");
  console.log("Porta:", PORT);
});
