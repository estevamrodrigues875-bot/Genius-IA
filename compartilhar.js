
const GeniusCompartilhar = {
    async compartilhar(arquivo) {
        if (!navigator.share) {
            throw new Error("Compartilhamento não disponível.");
        }

        if (navigator.canShare &&
            !navigator.canShare({ files: [arquivo] })) {
            throw new Error("Este arquivo não pode ser compartilhado.");
        }

        return navigator.share({
            files: [arquivo],
            title: "Genius IA",
            text: "Arquivo criado pela Genius IA"
        });
    }
};

export default GeniusCompartilhar;
