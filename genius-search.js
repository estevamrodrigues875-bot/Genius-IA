
const GeniusSearch = {
    async pesquisar(pergunta) {
        const resposta = await fetch(
            "/api/pesquisar",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    pergunta: pergunta
                })
            }
        );

        if (!resposta.ok) {
            throw new Error("Erro na pesquisa.");
        }

        return resposta.json();
    }
};

export default GeniusSearch;
