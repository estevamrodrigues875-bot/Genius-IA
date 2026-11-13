
const GeniusMusic = {
    audio: new Audio(),

    reproduzir(url) {
        this.audio.src = url;
        return this.audio.play();
    },

    pausar() {
        this.audio.pause();
    },

    continuar() {
        return this.audio.play();
    },

    volume(valor) {
        this.audio.volume = Math.max(
            0,
            Math.min(1, valor)
        );
    },

    parar() {
        this.audio.pause();
        this.audio.currentTime = 0;
    }
};

export default GeniusMusic;
