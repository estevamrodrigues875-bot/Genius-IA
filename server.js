
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

app.use(express.json());
app.use(express.static("public"));

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

// Sistema de novas tentativas
async function generateWithRetry(request, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await request();
    } catch (error) {
      const status =
        error.status ||
        error.statusCode ||
        error.response?.status;

      const temporaryErrors = [408, 429, 500, 502, 503, 504];

      if (!temporaryErrors.includes(status) ||
          attempt === maxRetries) {
        throw error;
      }

      const delay = 1000 * (2 ** attempt);

      console.log(
        `Gemini ocupado. Tentativa ${attempt + 1}...`
      );

      await new Promise(resolve =>
        setTimeout(resolve, delay)
      );
    }
  }
}

// Conversa com a Genius IA
app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body.message;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Mensagem inválida."
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-3.8-flash"
    });

    const result = await generateWithRetry(
      () => model.generateContent(message)
    );

    res.json({
      reply: result.response.text()
    });

  } catch (error) {
    console.error("Erro Gemini:", error);

    res.status(503).json({
      error: "A Genius IA está temporariamente ocupada. Tente novamente."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Genius IA online!");
});
