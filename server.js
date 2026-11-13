
const express = require("express");
const Groq = require("groq-sdk");
const path = require("path");

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const MODEL = "llama-3.3-70b-versatile";

app.get("/api/status", (req, res) => {
    res.json({
        online: true,
        name: "Genius IA",
        creator: "Estevam",
        provider: "Groq",
        model: MODEL
    });
});

app.post("/api/chat", async (req, res) => {
    try {
        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({
                error: "A chave GROQ_API_KEY não está configurada no servidor."
            });
        }

        const messages = req.body.messages;

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                error: "Envie uma mensagem para conversar."
            });
        }

        const validMessages = messages
            .filter(message =>
                ["user", "assistant"].includes(message.role) &&
                typeof message.text === "string" &&
                message.text.trim()
            )
            .slice(-30)
            .map(message => ({
                role: message.role,
                content: message.text.slice(0, 10000)
            }));

        if (
            validMessages.length === 0 ||
            validMessages[validMessages.length - 1].role !== "user"
        ) {
            return res.status(400).json({
                error: "A última mensagem precisa ser do usuário."
            });
        }

        const completion = await groq.chat.completions.create({
            model: MODEL,

            messages: [
                {
                    role: "system",
                    content:
                        "Você é a Genius IA, uma inteligência artificial criada por Estevam. Seu nome é Genius IA. Responda em português do Brasil, seja útil, educada, clara e converse naturalmente. Não invente informações."
                },
                ...validMessages
            ],

            temperature: 0.7,
            max_tokens: 2048
        });

        const answer =
            completion.choices?.[0]?.message?.content;

        if (!answer) {
            return res.status(502).json({
                error: "A inteligência artificial não retornou uma resposta."
            });
        }

        res.json({
            answer,
            model: MODEL
        });

    } catch (error) {
        console.error("Erro na Genius IA:", error);

        res.status(500).json({
            error: "Não foi possível obter uma resposta. Verifique a conexão com a API."
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Genius IA online!");
    console.log("Criador: Estevam");
    console.log("Provedor: Groq");
    console.log(`Servidor na porta ${PORT}`);
});
