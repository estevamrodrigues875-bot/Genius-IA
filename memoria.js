
const GeniusMemoria = {
    dados: {},

    salvar(chave, valor) {
        this.dados[chave] = valor;

        localStorage.setItem(
            "genius_memoria",
            JSON.stringify(this.dados)
        );
    },

    carregar() {
        this.dados = JSON.parse(
            localStorage.getItem("genius_memoria") || "{}"
        );

        return this.dados;
    },

    consultar(chave) {
        return this.dados[chave] || null;
    },

    apagar(chave) {
        delete this.dados[chave];

        localStorage.setItem(
            "genius_memoria",
            JSON.stringify(this.dados)
        );
    }
};

export default GeniusMemoria;
