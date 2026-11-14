
require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

// Verifica se a API está configurada
if (!process.env.GROQ_API_KEY) {
    console.error("ERRO: GROQ_API_KEY não configurada!");
}

// Rota de status
app.get("/api/status", (req, res) => {
    res.json({
        status: "online",
        name: "Genius IA",
        provider: "Groq"
    });
});

// Rota principal do chat
app.post("/api/chat", async (req, res) => {
    try {
        const { messages } = req.body;

        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({
                error: "Chave da Groq não configurada no servidor."
            });
        }

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                error: "Envie pelo menos uma mensagem."
            });
        }

        // Validação das mensagens
        const validMessages = messages.filter(message =>
            message &&
            ["user", "assistant"].includes(message.role) &&
            typeof message.content === "string"
        );

        if (validMessages.length !== messages.length) {
            return res.status(400).json({
                error: "Formato de mensagem inválido."
            });
        }

        const groqMessages = [
            {
                role: "system",
                content: `Você é a Genius IA, uma inteligência artificial
                útil, inteligente, educada e criativa.
                Seu criador é Estevam Rodrigues.
                Responda em português do Brasil,
                salvo quando o usuário pedir outro idioma.`
            },
            ...validMessages
        ];

        // Conexão com a GROQ
        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
                    messages: groqMessages,
                    temperature: 0.7,
                    max_tokens: 2048
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Erro da Groq:", data);

            return res.status(response.status).json({
                error: data.error?.message || "Erro ao conectar com a Groq."
            });
        }

        const answer = data.choices?.[0]?.message?.content;

        if (!answer) {
            return res.status(502).json({
                error: "A Groq não retornou uma resposta."
            });
        }

        res.json({
            reply: answer,
            model: data.model
        });

    } catch (error) {
        console.error("Erro no servidor:", error);

        res.status(500).json({
            error: "Erro interno ao processar sua mensagem."
        });
    }
});

// Inicialização
app.listen(PORT, () => {
    console.log("--------------------------------");
    console.log("GENIUS IA INICIADA");
    console.log("Servidor: porta " + PORT);
    console.log("Provedor: GROQ");
    console.log("--------------------------------");
});
