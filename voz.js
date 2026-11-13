
const GeniusVoz = {
    falar(texto, idioma = "pt-BR") {
        const fala = new SpeechSynthesisUtterance(texto);

        fala.lang = idioma;
        fala.rate = 1;
        fala.pitch = 1;

        speechSynthesis.speak(fala);
    },

    parar() {
        speechSynthesis.cancel();
    },

    ouvir() {
        const Reconhecimento =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!Reconhecimento) {
            throw new Error("Reconhecimento de voz não disponível.");
        }

        const reconhecimento = new Reconhecimento();

        reconhecimento.lang = "pt-BR";
        reconhecimento.start();

        return reconhecimento;
    }
};

export default GeniusVoz;
