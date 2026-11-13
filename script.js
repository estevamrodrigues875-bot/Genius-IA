
/* ==========================================
   GENIUS IA
   SCRIPT.JS - SISTEMA PRINCIPAL
========================================== */

const API_URL = "/api/chat";

const STORAGE_KEY = "genius_ia_conversations";
const ACTIVE_CHAT_KEY = "genius_ia_active_chat";

const elements = {
    sidebar: document.querySelector(".sidebar"),
    mainContent: document.querySelector(".main-content"),

    homeScreen: document.querySelector(".home-screen"),
    chatScreen: document.querySelector(".chat-screen"),
    historyScreen: document.querySelector(".history-screen"),
    settingsScreen: document.querySelector(".settings-screen"),

    messagesContainer: document.querySelector(".messages-container"),

    homeForm: document.querySelector(".home-input-area form"),
    chatForm: document.querySelector(".chat-input-area form"),

    homeInput: document.querySelector(".home-input-area textarea"),
    chatInput: document.querySelector(".chat-input-area textarea"),

    historyContainer: document.querySelector(".history-container"),
    fullHistoryList: document.querySelector(".full-history-list"),

    fileInput: document.querySelector("#fileInput"),
    imageInput: document.querySelector("#imageInput"),
    videoInput: document.querySelector("#videoInput"),

    attachmentPreview: document.querySelector(".attachment-preview"),

    notification: document.querySelector(".notification"),

    voiceType: document.querySelector("#voiceType"),
    language: document.querySelector("#language")
};

let conversations = loadConversations();
let activeChatId = localStorage.getItem(ACTIVE_CHAT_KEY);

let selectedFiles = [];
let isWaiting = false;
let notificationTimer = null;

/* ==========================================
   UTILITÁRIOS
========================================== */

function createId() {
    return Date.now().toString(36) +
        Math.random().toString(36).slice(2, 9);
}

function loadConversations() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        return Array.isArray(saved) ? saved : [];
    } catch (error) {
        console.error("Erro ao carregar histórico:", error);
        return [];
    }
}

function saveConversations() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(conversations)
        );
    } catch (error) {
        showNotification(
            "Não foi possível salvar o histórico. O armazenamento pode estar cheio."
        );
    }
}

function getActiveChat() {
    return conversations.find(
        chat => chat.id === activeChatId
    );
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}

function showNotification(message) {
    if (!elements.notification) {
        alert(message);
        return;
    }

    elements.notification.textContent = message;
    elements.notification.hidden = false;

    clearTimeout(notificationTimer);

    notificationTimer = setTimeout(() => {
        elements.notification.hidden = true;
    }, 3000);
}

/* ==========================================
   NAVEGAÇÃO ENTRE TELAS
========================================== */

function showScreen(screenName) {
    const screens = {
        home: elements.homeScreen,
        chat: elements.chatScreen,
        history: elements.historyScreen,
        settings: elements.settingsScreen
    };

    Object.entries(screens).forEach(([name, element]) => {
        if (element) {
            element.hidden = name !== screenName;
        }
    });

    document.querySelectorAll(".sidebar-item").forEach(button => {
        const target = button.dataset.screen;

        button.classList.toggle(
            "active",
            target === screenName
        );
    });

    if (elements.sidebar) {
        elements.sidebar.classList.remove("open");
    }

    if (screenName === "history") {
        renderHistory();
    }

    if (screenName === "chat") {
        renderMessages();
    }
}

function openSidebar() {
    if (elements.sidebar) {
        elements.sidebar.classList.toggle("open");
    }
}

/* ==========================================
   CRIAR CONVERSA
========================================== */

function createConversation() {
    const conversation = {
        id: createId(),
        title: "Nova conversa",
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
    };

    conversations.unshift(conversation);

    activeChatId = conversation.id;

    localStorage.setItem(
        ACTIVE_CHAT_KEY,
        activeChatId
    );

    saveConversations();

    renderHistory();
    renderMessages();

    return conversation;
}

function startNewChat() {
    activeChatId = null;

    localStorage.removeItem(ACTIVE_CHAT_KEY);

    selectedFiles = [];

    if (elements.homeInput) {
        elements.homeInput.value = "";
    }

    if (elements.chatInput) {
        elements.chatInput.value = "";
    }

    if (elements.fileInput) {
        elements.fileInput.value = "";
    }

    if (elements.imageInput) {
        elements.imageInput.value = "";
    }

    if (elements.videoInput) {
        elements.videoInput.value = "";
    }

    renderAttachmentPreview();
    showScreen("home");
}

/* ==========================================
   HISTÓRICO DE CONVERSAS
========================================== */

function renderHistory() {
    if (elements.historyContainer) {
        elements.historyContainer.innerHTML = "";
    }

    if (elements.fullHistoryList) {
        elements.fullHistoryList.innerHTML = "";
    }

    conversations.forEach(conversation => {
        const item = document.createElement("button");

        item.className = "sidebar-item";
        item.textContent = conversation.title;

        item.addEventListener("click", () => {
            openConversation(conversation.id);
        });

        if (elements.historyContainer) {
            elements.historyContainer.appendChild(item);
        }

        if (elements.fullHistoryList) {
            const entry = document.createElement("div");

            entry.className = "history-entry";

            const title = document.createElement("strong");
            title.textContent = conversation.title;

            const openButton = document.createElement("button");
            openButton.className = "attachment-button";
            openButton.textContent = "Abrir";

            openButton.addEventListener("click", () => {
                openConversation(conversation.id);
            });

            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-button";
            deleteButton.textContent = "Excluir";

            deleteButton.addEventListener("click", () => {
                deleteConversation(conversation.id);
            });

            entry.append(title, openButton, deleteButton);

            elements.fullHistoryList.appendChild(entry);
        }
    });

    if (
        conversations.length === 0 &&
        elements.fullHistoryList
    ) {
        elements.fullHistoryList.textContent =
            "Nenhuma conversa salva ainda.";
    }
}

function openConversation(id) {
    const conversation = conversations.find(
        chat => chat.id === id
    );

    if (!conversation) {
        showNotification("Conversa não encontrada.");
        return;
    }

    activeChatId = id;

    localStorage.setItem(ACTIVE_CHAT_KEY, id);

    selectedFiles = [];

    renderAttachmentPreview();
    renderMessages();

    showScreen("chat");
}

function deleteConversation(id) {
    const confirmed = confirm(
        "Deseja realmente apagar esta conversa?"
    );

    if (!confirmed) return;

    conversations = conversations.filter(
        chat => chat.id !== id
    );

    if (activeChatId === id) {
        activeChatId = null;
        localStorage.removeItem(ACTIVE_CHAT_KEY);
    }

    saveConversations();
    renderHistory();

    if (!activeChatId) {
        showScreen("history");
    }

    showNotification("Conversa apagada.");
}

function deleteAllHistory() {
    if (conversations.length === 0) {
        showNotification("O histórico já está vazio.");
        return;
    }

    const confirmed = confirm(
        "Deseja apagar todas as conversas? Essa ação não pode ser desfeita."
    );

    if (!confirmed) return;

    conversations = [];
    activeChatId = null;

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVE_CHAT_KEY);

    saveConversations();
    renderHistory();
    showScreen("history");

    showNotification("Todo o histórico foi apagado.");
}

/* ==========================================
   MENSAGENS
========================================== */

function renderMessages() {
    if (!elements.messagesContainer) return;

    elements.messagesContainer.innerHTML = "";

    const conversation = getActiveChat();

    if (!conversation) return;

    conversation.messages.forEach(message => {
        addMessageToScreen(
            message.role,
            message.content
        );
    });

    elements.messagesContainer.scrollTop =
        elements.messagesContainer.scrollHeight;
}

function addMessageToScreen(role, content) {
    if (!elements.messagesContainer) return;

    const message = document.createElement("div");

    if (role === "user") {
        message.className = "user-message";

        const contentBox = document.createElement("div");
        contentBox.className = "message-content";

        const paragraph = document.createElement("p");
        paragraph.textContent = content;

        contentBox.appendChild(paragraph);
        message.appendChild(contentBox);
    } else {
        message.className = "assistant-message";

        const avatar = document.createElement("div");
        avatar.className = "message-avatar";
        avatar.textContent = "G";

        const contentBox = document.createElement("div");
        contentBox.className = "message-content";

        const name = document.createElement("strong");
        name.textContent = "Genius IA";

        const paragraph = document.createElement("p");
        paragraph.textContent = content;

        contentBox.append(name, paragraph);
        message.append(avatar, contentBox);
    }

    elements.messagesContainer.appendChild(message);

    elements.messagesContainer.scrollTop =
        elements.messagesContainer.scrollHeight;
}

function addMessage(role, content) {
    const conversation = getActiveChat();

    if (!conversation) return;

    conversation.messages.push({
        role,
        content,
        timestamp: Date.now()
    });

    conversation.updatedAt = Date.now();

    if (
        conversation.title === "Nova conversa" &&
        role === "user"
    ) {
        conversation.title =
            content.slice(0, 35) +
            (content.length > 35 ? "..." : "");
    }

    saveConversations();
    renderHistory();

    addMessageToScreen(role, content);
}

/* ==========================================
   ENVIO PARA O SERVIDOR
========================================== */

async function sendMessage(text) {
    if (isWaiting) return;

    const message = text.trim();

    if (!message && selectedFiles.length === 0) {
        return;
    }

    if (!getActiveChat()) {
        createConversation();
    }

    const conversation = getActiveChat();

    const filesToSend = [...selectedFiles];

    selectedFiles = [];
    renderAttachmentPreview();

    const displayMessage = message ||
        "Arquivo enviado para análise.";

    addMessage("user", displayMessage);

    isWaiting = true;
    updateSendButtons(true);

    const loadingMessage = document.createElement("div");
    loadingMessage.className = "assistant-message";
    loadingMessage.textContent = "Genius IA está pensando...";

    elements.messagesContainer.appendChild(loadingMessage);

    try {
        let response;

        if (filesToSend.length > 0) {
            const formData = new FormData();

            formData.append("message", message);

            filesToSend.forEach(file => {
                formData.append("files", file);
            });

            response = await fetch("/api/chat", {
                method: "POST",
                body: formData
            });
        } else {
            response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message,
                    history: conversation.messages
                        .slice(-20)
                        .map(item => ({
                            role: item.role,
                            content: item.content
                        })),
                    language: elements.language?.value || "auto"
                })
            });
        }

        if (!response.ok) {
            throw new Error(
                "O servidor respondeu com erro: " +
                response.status
            );
        }

        const data = await response.json();

        loadingMessage.remove();

        const answer =
            data.reply ||
            data.response ||
            data.text ||
            data.message;

        if (!answer) {
            throw new Error(
                "O servidor não retornou uma resposta válida."
            );
        }

        addMessage("assistant", answer);

    } catch (error) {
        console.error("Erro no envio:", error);

        loadingMessage.remove();

        addMessage(
            "assistant",
            "Não consegui responder agora. Verifique a conexão com o servidor e tente novamente."
        );

        showNotification("Erro ao conversar com o servidor.");
    } finally {
        isWaiting = false;
        updateSendButtons(false);
    }
}

function updateSendButtons(disabled) {
    document.querySelectorAll(".send-button").forEach(button => {
        button.disabled = disabled;
        button.textContent = disabled ? "Aguarde..." : "Enviar";
    });
}

/* ==========================================
   FORMULÁRIOS
========================================== */

function handleFormSubmit(event, input) {
    event.preventDefault();

    if (!input) return;

    const message = input.value.trim();

    if (!message && selectedFiles.length === 0) {
        return;
    }

    input.value = "";

    showScreen("chat");

    sendMessage(message);
}

if (elements.homeForm) {
    elements.homeForm.addEventListener("submit", event => {
        handleFormSubmit(event, elements.homeInput);
    });
}

if (elements.chatForm) {
    elements.chatForm.addEventListener("submit", event => {
        handleFormSubmit(event, elements.chatInput);
    });
}

/* ==========================================
   ANEXOS
========================================== */

function addFiles(files) {
    const incomingFiles = Array.from(files || []);

    if (incomingFiles.length === 0) return;

    const maxSize = 15 * 1024 * 1024;

    incomingFiles.forEach(file => {
        if (file.size > maxSize) {
            showNotification(
                file.name + " é maior que 15 MB."
            );
            return;
        }

        selectedFiles.push(file);
    });

    renderAttachmentPreview();
}

function renderAttachmentPreview() {
    if (!elements.attachmentPreview) return;

    elements.attachmentPreview.innerHTML = "";

    selectedFiles.forEach((file, index) => {
        const item = document.createElement("div");

        item.className = "history-entry";

        const name = document.createElement("span");
        name.textContent = file.name;

        const removeButton = document.createElement("button");
        removeButton.className = "delete-button";
        removeButton.textContent = "Remover";

        removeButton.addEventListener("click", () => {
            selectedFiles.splice(index, 1);
            renderAttachmentPreview();
        });

        item.append(name, removeButton);

        elements.attachmentPreview.appendChild(item);
    });
}

if (elements.fileInput) {
    elements.fileInput.addEventListener("change", event => {
        addFiles(event.target.files);
        event.target.value = "";
    });
}

if (elements.imageInput) {
    elements.imageInput.addEventListener("change", event => {
        addFiles(event.target.files);
        event.target.value = "";
    });
}

if (elements.videoInput) {
    elements.videoInput.addEventListener("change", event => {
        addFiles(event.target.files);
        event.target.value = "";
    });
}

/* ==========================================
   BOTÕES DA INTERFACE
========================================== */

document.addEventListener("click", event => {
    const screenButton = event.target.closest("[data-screen]");

    if (screenButton) {
        showScreen(screenButton.dataset.screen);
    }

    const modeButton = event.target.closest("[data-mode]");

    if (modeButton) {
        const mode = modeButton.dataset.mode;

        if (mode === "chat") {
            showScreen("chat");
            if (!getActiveChat()) createConversation();
        }

        if (mode === "image") {
            showNotification(
                "A criação de imagens precisa ser conectada ao servidor."
            );
        }

        if (mode === "video") {
            showNotification(
                "A criação de vídeos precisa ser conectada a um serviço compatível."
            );
        }

        if (mode === "files") {
            elements.fileInput?.click();
        }
    }

    if (event.target.closest("#newChatButton")) {
        startNewChat();
    }

    if (event.target.closest("#menuButton")) {
        openSidebar();
    }

    if (event.target.closest("#deleteAllHistory")) {
        deleteAllHistory();
    }

    if (event.target.closest("#attachButton")) {
        elements.fileInput?.click();
    }

    if (event.target.closest("#imageButton")) {
        elements.imageInput?.click();
    }

    if (event.target.closest("#videoButton")) {
        elements.videoInput?.click();
    }
});

/* ==========================================
   TECLA ENTER
========================================== */

[ elements.homeInput, elements.chatInput ].forEach(input => {
    if (!input) return;

    input.addEventListener("keydown", event => {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();

            input.closest("form")?.requestSubmit();
        }
    });
});

/* ==========================================
   CONFIGURAÇÕES
========================================== */

if (elements.language) {
    const savedLanguage = localStorage.getItem(
        "genius_ia_language"
    );

    if (savedLanguage) {
        elements.language.value = savedLanguage;
    }

    elements.language.addEventListener("change", () => {
        localStorage.setItem(
            "genius_ia_language",
            elements.language.value
        );
    });
}

if (elements.voiceType) {
    const savedVoice = localStorage.getItem(
        "genius_ia_voice"
    );

    if (savedVoice) {
        elements.voiceType.value = savedVoice;
    }

    elements.voiceType.addEventListener("change", () => {
        localStorage.setItem(
            "genius_ia_voice",
            elements.voiceType.value
        );
    });
}

/* ==========================================
   INICIALIZAÇÃO
========================================== */

function initializeApp() {
    renderHistory();

    const savedChat = conversations.find(
        chat => chat.id === activeChatId
    );

    if (savedChat) {
        renderMessages();
        showScreen("chat");
    } else {
        activeChatId = nu
