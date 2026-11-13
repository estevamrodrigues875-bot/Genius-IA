
const GeniusBubble = {
    criar(aoAbrir) {
        const bolinha = document.createElement("button");

        bolinha.id = "genius-bubble";
        bolinha.textContent = "G";
        bolinha.title = "Abrir Genius IA";

        Object.assign(bolinha.style, {
            position: "fixed",
            right: "18px",
            bottom: "100px",
            width: "58px",
            height: "58px",
            borderRadius: "50%",
            background: "#7055ff",
            color: "white",
            border: "none",
            fontSize: "24px",
            zIndex: "999999",
            cursor: "pointer"
        });

        bolinha.onclick = aoAbrir;

        document.body.appendChild(bolinha);

        return bolinha;
    }
};

export default GeniusBubble;
