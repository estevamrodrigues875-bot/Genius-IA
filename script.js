
document.addEventListener("DOMContentLoaded", () => {

    // ELEMENTOS DA TELA
    const chatForm = document.getElementById("chatForm");
    const messageInput = document.getElementById("messageInput");
    const chatMessages = document.getElementById("chatMessages");
    const welcomeScreen = document.getElementById("welcomeScreen");
    const sendBtn = document.getElementById("sendBtn");
    const newChatBtn = document.getElementById("newChatBtn");
    const loadingIndicator = document.getElementById("loadingIndicator");
    const attachBtn = document.getElementById("attachBtn");
    const fileInput = document.getElementById("fileInput");

    // ESTADO
    let messages = [];
    let conversations = [];
    let currentId = Date.now();
    let selectedFiles = [];
    let isLoading = false;

    const STORAGE_KEY = "genius_ia_conversations";

    // CARREGAR HISTÓRICO
    function loadHistory() {
        try {
            conversations = JSON.parse(
                localStorage.getItem(STORAGE_KEY)
            ) || [];
        } catch {
            conversations = [];
        }
    }

    // SALVAR HISTÓRICO
    function saveHistory() {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(conversations)
        );
    }

    // SALVAR CONVERSA ATUAL
    function saveConversation() {
        if (messages.length === 0) return;

        const titleMessage = messages.find(
            message => message.role === "user"
        );

        const conversation = {
            id: currentId,
            title: titleMessage
                ? titleMessage.content.slice(0, 35)
                : "Nova conversa",
            messages: messages,
            updatedAt: new Date().toISOString()
        };

        const index = conversations.findIndex(
            item => item.id === currentId
        );

        if (index >= 0) {
            conversations[index] = conversation;
        } else {
            conversations.unshift(conversation);
        }

        saveHistory();
    }

    // CRIAR MENSAGEM NA TELA
    function addMessage(role, content) {
        const message = document.createElement("div");

        message.className = role === "user"
            ? "message user-message"
            : "message assistant-message";

        const text = document.createElement("div");
        text.className = "message-content";
        text.textContent = content;

        message.appendChild(text);
        chatMessages.appendChild(message);

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // MOSTRAR MENSAGENS
    function renderMessages() {
        chatMessages.innerHTML = "";

        welcomeScreen.hidden = messages.length > 0;

        messages.forEach(message => {
            addMessage(message.role, message.content);
        });
    }

    // INDICADOR DE CARREGAMENTO
    function setLoading(value) {
        isLoading = value;

        loadingIndicator.hidden = !value;
        sendBtn.disabled = value;
        messageInput.disabled = value;

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // LER ARQUIVOS DE TEXTO
    async function readAttachments() {
        let attachmentText = "";

        for (const file of selectedFiles) {
            const allowedTypes = [
                ".txt", ".md", ".csv", ".json"
            ];

            const extension = file.name
                .substring(file.name.lastIndexOf("."))
                .toLowerCase();

            if (!allowedTypes.includes(extension)) {
                throw new Error(
                    "Formato não suportado: " + file.name +
                    ". Por enquanto, use TXT, MD, CSV ou JSON."
                );
            }

            if (file.size > 1024 * 1024) {
                throw new Error(
                    "O arquivo " + file.name +
                    " ultrapassa o limite de 1 MB."
                );
            }

            const content = await file.text();

            attachmentText +=
                "\n\nConteúdo do arquivo " + file.name +
                ":\n" + content;
        }

        return attachmentText;
    }

    // ENVIAR MENSAGEM PARA A GROQ
    async function sendMessage(event) {
        if (event) event.preventDefault();

        if (isLoading) return;

        const userText = messageInput.value.trim();

        if (!userText && selectedFiles.length === 0) return;

        try {
            const attachmentText = await readAttachments();

            const finalText =
                userText +
                (attachmentText
                    ? "\n\nAnalise também estes arquivos:" +
                      attachmentText
                    : "");

            if (!finalText.trim()) return;

            messages.push({
                role: "user",
                content: finalText
            });

            addMessage("user", userText || "Arquivos enviados");

            welcomeScreen.hidden = true;

            messageInput.value = "";
            selectedFiles = [];
            fileInput.value = "";

            saveConversation();
            setLoading(true);

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messages: messages
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Erro ao conversar com a Groq."
                );
            }

            if (!data.reply) {
                throw new Error("A IA não retornou uma resposta.");
            }

            messages.push({
                role: "assistant",
                content: data.reply
            });

            addMessage("assistant", data.reply);

            saveConversation();

        } catch (error) {
            addMessage(
                "assistant",
                "Não consegui responder: " + error.message
            );

            console.error("Genius IA:", error);

        } finally {
            setLoading(false);
            messageInput.disabled = false;
            messageInput.focus();
        }
    }

    // NOVA CONVERSA
    function newConversation() {
        if (isLoading) return;

        saveConversation();

        messages = [];
        selectedFiles = [];
        currentId = Date.now();

        chatMessages.innerHTML = "";
        messageInput.value = "";
        fileInput.value = "";

        welcomeScreen.hidden = false;
    }

    // ABRIR HISTÓRICO
    function openHistory() {
        if (isLoading) return;

        if (conversations.length === 0) {
            alert("Você ainda não tem conversas salvas.");
            return;
        }

        const list = conversations.map((item, index) => {
            return `${index + 1}. ${item.title}`;
        }).join("\n");

        const choice = prompt(
            "HISTÓRICO DA GENIUS IA\n\n" +
            list +
            "\n\nDigite o número para abrir.\n" +
            "Digite D seguido do número para apagar."
        );

        if (!choice) return;

        if (/^d\d+$/i.test(choice.trim())) {
            const index = Number(choice.trim().slice(1)) - 1;

            if (index >= 0 && index < conversations.length) {
                const confirmDelete = confirm(
                    "Deseja apagar esta conversa?"
                );

                if (confirmDelete) {
                    conversations.splice(index, 1);
                    saveHistory();

                    if (
                        conversations[index]?.id === currentId
                    ) {
                        newConversation();
                    }

                    alert("Conversa apagada.");
                }
            }

            return;
        }

        const index = Number(choice) - 1;

        if (
            Number.isInteger(index) &&
            index >= 0 &&
            index < conversations.length
        ) {
            saveConversation();

            const conversation = conversations[index];

            currentId = conversation.id;
            messages = [...conversation.messages];

            renderMessages();
        }
    }

    // ANEXAR ARQUIVOS
    attachBtn.addEventListener("click", () => {
        if (!isLoading) fileInput.click();
    });

    fileInput.addEventListener("change", () => {
        selectedFiles = Array.from(fileInput.files);

        if (selectedFiles.length > 0) {
            messageInput.placeholder =
                selectedFiles.length +
                " arquivo(s) selecionado(s). Escreva sua mensagem...";
        } else {
            messageInput.placeholder =
                "Pergunte alguma coisa...";
        }
    });

    // ENVIAR
    chatForm.addEventListener("submit", sendMessage);

    // ENTER ENVIA / SHIFT + ENTER QUEBRA LINHA
    messageInput.addEventListener("keydown", event => {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();
            sendMessage();
        }
    });

    // NOVA CONVERSA
    newChatBtn.addEventListener(
        "click",
        newConversation
    );

    // BOTÃO DE HISTÓRICO
    const historyBtn = document.createElement("button");

    historyBtn.type = "button";
    historyBtn.id = "historyBtn";
    historyBtn.className = "icon-button";
    historyBtn.textContent = "☷";
    historyBtn.title = "Histórico de conversas";

    newChatBtn.parentNode.insertBefore(
        historyBtn,
        newChatBtn
    );

    historyBtn.addEventListener(
        "click",
        openHistory
    );

    // INICIALIZAÇÃO
    loadHistory();
    renderMessages();

    console.log("Genius IA: Script iniciado.");

});
                          
