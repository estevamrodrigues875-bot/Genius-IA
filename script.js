
const form = document.getElementById("chatForm");
const input = document.getElementById("messageInput");
const messagesArea = document.getElementById("messages");
const chat = document.getElementById("chat");
const welcome = document.getElementById("welcome");
const sendButton = document.getElementById("sendButton");
const newChatButton = document.getElementById("newChat");

const STORAGE_KEY = "genius_ia_messages";

let messages = [];
let isSending = false;

input.value = "";

function saveMessages() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(messages)
    );
}

function scrollToBottom() {
    chat.scrollTop = chat.scrollHeight;
}

function renderMessage(message) {
    const container = document.createElement("div");

    container.className = "message " + message.role;

    const bubble = document.createElement("div");

    bubble.className = "bubble";
    bubble.textContent = message.text;

    container.appendChild(bubble);
    messagesArea.appendChild(container);

    welcome.style.display = "none";

    scrollToBottom();
}

function addMessage(role, text) {
    const message = {
        role: role,
        text: text
    };

    messages.push(message);

    renderMessage(message);
    saveMessages();
}

function showError(text) {
    const container = document.createElement("div");
    container.className = "message assistant";

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;

    container.appendChild(bubble);
    messagesArea.appendChild(container);

    scrollToBottom();
}

function loadMessages() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        if (!Array.isArray(saved)) {
            messages = [];
            return;
        }

        messages = saved.filter(message =>
            message &&
            ["user", "assistant"].includes(message.role) &&
            typeof message.text === "string"
        );

        messages.forEach(renderMessage);

    } catch (error) {
        messages = [];
        localStorage.removeItem(STORAGE_KEY);
    }
}

async function sendMessage(text) {
    if (isSending || !text.trim()) return;

    isSending = true;

    addMessage("user", text);

    input.value = "";
    input.style.height = "auto";

    sendButton.disabled = true;
    newChatButton.disabled = true;

    const typing = document.createElement("div");

    typing.className = "typing";
    typing.textContent = "Genius IA está pensando...";

    messagesArea.appendChild(typing);

    scrollToBottom();

    try {
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

        typing.remove();

        if (!response.ok) {
            throw new Error(
                data.error || "Erro ao conversar com a Genius IA."
            );
        }

        if (!data.answer) {
            throw new Error("A IA não enviou uma resposta.");
        }

        addMessage("assistant", data.answer);

    } catch (error) {
        typing.remove();

        showError(
            "Não consegui responder: " + error.message
        );

    } finally {
        isSending = false;
        sendButton.disabled = false;
        newChatButton.disabled = false;
        input.focus();
    }
}

form.addEventListener("submit", async event => {
    event.preventDefault();

    const text = input.value.trim();

    if (!text || isSending) return;

    await sendMessage(text);
});

input.addEventListener("input", () => {
    input.style.height = "auto";

    input.style.height =
        Math.min(input.scrollHeight, 130) + "px";
});

input.addEventListener("keydown", event => {
    if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.isComposing
    ) {
        event.preventDefault();
        form.requestSubmit();
    }
});

newChatButton.addEventListener("click", () => {
    if (isSending) return;

    if (
        messages.length > 0 &&
        !confirm("Deseja apagar as mensagens e começar uma nova conversa?")
    ) {
        return;
    }

    messages = [];

    localStorage.removeItem(STORAGE_KEY);

    messagesArea.innerHTML = "";

    welcome.style.display = "flex";

    input.value = "";
    input.style.height = "auto";

    input.focus();
});

loadMessages();
       
