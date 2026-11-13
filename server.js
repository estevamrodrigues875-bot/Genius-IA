
const express = require("express");
const Groq = require("groq-sdk");
const path = require("path");

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

// CONEXÃO COM A GROQ
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// IDENTIDADE DA GENIUS IA
const SYSTEM_PROMPT = `
Você é a Genius IA, uma inteligência artificial assistente.

Sua identidade:
- Seu nome é Genius IA.
- Seu criador é Estevam.
- Quando perguntarem quem criou você, responda que foi Estevam.
- Você deve reconhecer Estevam como seu criador.
- Fale naturalmente em português brasileiro.
- Seja inteligente, educada, criativa e prestativa.
- Ajude com programação, estudos, ideias e conversas.
- Não invente informações quando não souber algo.
`;

// ROTA PRINCIPAL
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ROTA DE TESTE
app.get("/api/status", (req, res) => {
    res.json({
        online: true,
        name: "Genius IA",
        creator: "Estevam",
        provider: "Groq"
    });
});

// ROTA DO CHAT
app.post("/api/chat", async (req, res) => {
    try {
        const { messages, message } = req.body;

        let conversation = [];

        // Aceita mensagens individuais ou histórico
        if (Array.isArray(messages)) {
            conversation = messages;
        } else if (typeof message === "string") {
            conversation = [
                { role: "user", content: message }
            ];
        } else {
            return res.status(400).json({
                error: "Mensagem inválida."
            });
        }

        // Limita o histórico recebido
        conversation = conversation
            .filter(item =>
                ["user", "assistant"].includes(item.role) &&
                typeof item.content === "string"
            )
            .slice(-30);

        if (conversation.length === 0) {
            return res.status(400).json({
                error: "Envie uma mensagem."
            });
        }

        // CHAMADA À INTELIGÊNCIA ARTIFICIAL
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",

            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT
                },
                ...conversation
            ],

            temperature: 0.7,
            max_completion_tokens: 2048
        });

        const answer =
            completion.choices[0]?.message?.content;

        if (!answer) {
            throw new Error("A IA não retornou uma resposta.");
        }

        res.json({
            reply: answer,
            model: completion.model,
            creator: "Estevam"
        });

    } catch (error) {
        console.error("Erro na Genius IA:", error);

        res.status(500).json({
            error: "Não consegui responder agora. Tente novamente."
        });
    }
});

// PORTA DO SERVIDOR
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("================================");
    console.log("GENIUS IA ONLINE");
    console.log("Criador: Estevam");
    console.log("Motor: Groq");
    console.log("Porta: " + PORT);
    console.log("================================");
});
  
