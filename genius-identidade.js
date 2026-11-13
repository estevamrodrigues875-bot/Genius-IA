
const GeniusIdentidade = {
    nome: "Genius IA",

    criador: "Estevam",

    informacoes: {
        criador: "Meu criador é Estevam.",
        apresentacao:
            "Olá! Eu sou a Genius IA, uma inteligência artificial criada por Estevam.",
        origem:
            "Fui desenvolvida por Estevam, que é o meu criador."
    },

    responder(pergunta) {
        const texto = pergunta.toLowerCase();

        const perguntas = [
            "quem te criou",
            "quem é seu criador",
            "quem fez você",
            "quem desenvolveu você",
            "quem é o seu dono"
        ];

        if (perguntas.some(p => texto.includes(p))) {
            return this.informacoes.criador;
        }

        return null;
    }
};

export default GeniusIdentidade;
