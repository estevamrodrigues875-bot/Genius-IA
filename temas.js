
const GeniusTemas = {
    aplicar(tema) {
        const temas = {
            escuro: {
                fundo: "#121212",
                texto: "#ffffff",
                destaque: "#7055ff"
            },

            claro: {
                fundo: "#ffffff",
                texto: "#111111",
                destaque: "#7055ff"
            }
        };

        const escolhido = temas[tema];

        if (!escolhido) {
            throw new Error("Tema não encontrado.");
        }

        document.documentElement.style.setProperty(
            "--fundo", escolhido.fundo
        );

        document.documentElement.style.setProperty(
            "--texto", escolhido.texto
        );

        document.documentElement.style.setProperty(
            "--destaque", escolhido.destaque
        );
    }
};

export default GeniusTemas;
