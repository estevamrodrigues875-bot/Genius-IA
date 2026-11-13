
const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/gerar-video", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        erro: "Descreva o vídeo que deseja criar."
      });
    }

    const resposta = await axios.post(
      process.env.VIDEO_API_URL,
      { prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.VIDEO_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({
      sucesso: true,
      resultado: resposta.data
    });

  } catch (erro) {
    console.error("Erro ao gerar vídeo:", erro.message);

    res.status(500).json({
      erro: "Não foi possível gerar o vídeo."
    });
  }
});

module.exports = router;
