
/*
 * GENIUS IA - SISTEMA DE VÍDEOS
 * Arquivo: genius-video.js
 *
 * Este módulo fica separado do sistema principal.
 */

const GeniusVideo = {

  // Endereço da API de vídeo
  apiUrl: "/api/videos",

  // Criar vídeo
  async criarVideo(descricao, duracao = 5) {
    if (!descricao || !descricao.trim()) {
      throw new Error("Digite uma descrição para o vídeo.");
    }

    const resposta = await fetch(`${this.apiUrl}/criar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        descricao,
        duracao
      })
    });

    if (!resposta.ok) {
      throw new Error("Não foi possível solicitar a criação do vídeo.");
    }

    return await resposta.json();
  },

  // Consultar o andamento da criação
  async consultarVideo(id) {
    const resposta = await fetch(
      `${this.apiUrl}/status/${encodeURIComponent(id)}`
    );

    if (!resposta.ok) {
      throw new Error("Não foi possível consultar o vídeo.");
    }

    return await resposta.json();
  },

  // Receber e visualizar vídeo
  receberVideo(arquivo) {
    if (!(arquivo instanceof File)) {
      throw new Error("Arquivo inválido.");
    }

    if (!arquivo.type.startsWith("video/")) {
      throw new Error("Selecione um arquivo de vídeo.");
    }

    return URL.createObjectURL(arquivo);
  },

  // Enviar vídeo para análise
  async analisarVideo(arquivo) {
    if (!(arquivo instanceof File) ||
        !arquivo.type.startsWith("video/")) {
      throw new Error("Selecione um vídeo válido.");
    }

    const dados = new FormData();
    dados.append("video", arquivo);

    const resposta = await fetch(`${this.apiUrl}/analisar`, {
      method: "POST",
      body: dados
    });

    if (!resposta.ok) {
      throw new Error("Não foi possível analisar o vídeo.");
    }

    return await resposta.json();
  },

  // Reproduzir vídeo
  reproduzirVideo(elemento, url) {
    elemento.src = url;
    elemento.controls = true;
    elemento.playsInline = true;
    return elemento.play();
  }
};

// Disponibilizar o módulo no navegador
if (typeof window !== "undefined") {
  window.GeniusVideo = GeniusVideo;
}

// Exportar para projetos que usam módulos JavaScript
if (typeof module !== "undefined" && module.exports) {
  module.exports = GeniusVideo;
  }
