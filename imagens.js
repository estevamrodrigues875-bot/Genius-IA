
const GeniusImagens = {
    visualizar(arquivo) {
        return new Promise((resolve, reject) => {
            if (!arquivo || !arquivo.type.startsWith("image/")) {
                reject(new Error("Arquivo de imagem inválido."));
                return;
            }

            const leitor = new FileReader();

            leitor.onload = () => resolve(leitor.result);
            leitor.onerror = reject;

            leitor.readAsDataURL(arquivo);
        });
    },

    criar(prompt) {
        throw new Error(
            "Conecte aqui um serviço de geração de imagens por API."
        );
    }
};

export default GeniusImagens;
