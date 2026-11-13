
const GeniusArquivos = {
    analisar(arquivo) {
        if (!arquivo) {
            throw new Error("Nenhum arquivo selecionado.");
        }

        return {
            nome: arquivo.name,
            tipo: arquivo.type,
            tamanho: arquivo.size,
            arquivo: arquivo
        };
    },

    selecionar() {
        return new Promise(resolve => {
            const entrada = document.createElement("input");

            entrada.type = "file";
            entrada.accept = "image/*,video/*,.pdf,.txt,.docx";

            entrada.onchange = () => {
                resolve(entrada.files[0] || null);
            };

            entrada.click();
        });
    }
};

export default GeniusArquivos;
