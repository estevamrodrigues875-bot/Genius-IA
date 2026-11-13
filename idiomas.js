
const GeniusIdiomas = {
    idiomas: [
        "pt-BR",
        "en-US",
        "es-ES",
        "fr-FR",
        "de-DE",
        "it-IT",
        "ja-JP",
        "zh-CN"
    ],

    traduzir(texto, idioma) {
        const url = new URL(
            "https://translate.googleapis.com/translate_a/single"
        );

        url.search = new URLSearchParams({
            client: "gtx",
            sl: "auto",
            tl: idioma,
            dt: "t",
            q: texto
        });

        return fetch(url)
            .then(resposta => resposta.json())
            .then(dados =>
                dados[0].map(item => item[0]).join("")
            );
    }
};

export default GeniusIdiomas;
