
const express = require("express");
const Groq = require("groq-sdk");
const crypto = require("crypto");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

// Histórico temporário das conversas
const conversas = new Map();

const INSTRUCOES = `
Você é a Genius IA, uma inteligência artificial criada por Estevam.

Seu criador é Estevam. Quando perguntarem quem criou você,
responda que foi Estevam.

Seja inteligente, educada, prestativa e converse naturalmente
em português brasileiro.

Explique assuntos de maneira clara e ajude o usuário.
Não invente informações quando não souber a resposta.
Você é a Genius IA e deve manter essa identidade.
`;

function obterSessao(req, res) {
  const cookies = (req.headers.cookie || "").split(";");

  let sessao = null;

  for (const cookie of cookies) {
    const partes = cookie.trim().split("=");
    if (partes[0] === "genius_session") {
      sessao = partes.slice(1).join("=");
      break;
    }
  }

  if (!sessao || !/^[a-f0-9-]{36}$/i.test(sessao)) {
    sessao = crypto.randomUUID();

    const secure = process.env.NODE_ENV === "production"
      ? " Secure;"
      : "";

    res.setHeader(
      "Set-Cookie",
      `genius_session=${sessao}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800;${secure}`
    );
  }

  return sessao;
}

// Verificar se o servidor está funcionando
app.get("/api/status", (req, res) => {
  res.json({
    online: true,
    assistant: "Genius IA",
    creator: "Estevam",
    provider: "Groq",
    apiConfigured: Boolean(process.env.GROQ_API_KEY)
  });
});

// Conversar com a Genius IA
app.post("/api/chat", async (req, res) => {
  try {
    if (!groq) {
      return res.status(503).json({
        error: "A chave GROQ_API_KEY não está configurada."
      });
    }

    const mensagem = String(
      req.body.message || req.body.text || ""
    ).trim();

    if (!mensagem) {
      return res.status(400).json({
        error: "Digite uma mensagem."
      });
    }

    if (mensagem.length > 10000) {
      return res.status(400).json({
        error: "A mensagem é muito grande."
      });
    }

    const sessao = obterSessao(req, res);

    let historico = conversas.get(sessao) || [];

    const mensagens = [
      { role: "system", content: INSTRUCOES },
      ...historico,
      { role: "user", content: mensagem }
    ];

    const resultado = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: mensagens
    });

    const resposta =
      resultado.choices?.[0]?.message?.content;

    if (!resposta) {
      throw new Error("A IA não retornou uma resposta.");
    }

    historico.push(
      { role: "user", content: mensagem },
      { role: "assistant", content: resposta }
    );

    // Manter somente as últimas 20 mensagens
    historico = historico.slice(-20);

    conversas.set(sessao, historico);

    return res.json({
      success: true,
      reply: resposta,
      response: resposta,
      message: resposta
    });

  } catch (erro) {
    console.error("Erro na Genius IA:", erro);

    const status = erro.status === 401 ? 502 :
      erro.status === 429 ? 429 : 500;

    return res.status(status).json({
      success: false,
      error: "Não consegui responder agora. Tente novamente.",
      details: erro.status === 401
        ? "A Groq recusou a chave da API."
        : erro.status === 429
        ? "Limite de solicitações atingido."
        : "Erro ao processar a mensagem."
    });
  }
});

// Limpar o histórico da conversa atual
app.post("/api/reset", (req, res) => {
  const sessao = obterSessao(req, res);
  conversas.delete(sessao);

  res.json({
    success: true,
    message: "Conversa reiniciada."
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Genius IA online!");
  console.log("Provedor: Groq");
  console.log("Modelo: openai/gpt-oss-120b");
  console.log("Porta:", PORT);
});
    
