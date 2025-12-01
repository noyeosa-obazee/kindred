import {
  generateResponse,
  clearChatSession,
  updateChatSession,
} from "./generateResponse.js";
import { parseMarkdownToDOM } from "./parseMarkdown.js";
import { currentUser, authDB } from "./app.js";
import { loadConversations, setCurrentConversation } from "./navBar.js";

let signIn = false;
const storedUser = sessionStorage.getItem("currentUser");

// Global state
export let currentConversationId = null;
export let messagesContainer = null;
export let chatbotUI = null;

export function setSignIn(state) {
  signIn = state;
}

export function getSignIn() {
  return signIn;
}

// Create the complete chatbot UI with JavaScript
function createChatbotUI() {
  // Create main container
  const chatbotContainer = document.createElement("div");
  chatbotContainer.className = "chatbot-container";

  // Create header
  const header = document.createElement("div");
  header.className = "chatbot-header";

  const avatar = document.createElement("div");
  avatar.className = "chatbot-avatar";
  const avatarText = document.createTextNode("💕");
  avatar.appendChild(avatarText);

  const headerText = document.createElement("div");
  headerText.className = "chatbot-header-text";

  const title = document.createElement("h3");
  const titleText = document.createTextNode("Kindred");
  title.appendChild(titleText);

  const status = document.createElement("p");
  const statusText = document.createTextNode("Online • Ready to help");
  status.appendChild(statusText);
  status.className = "status";

  headerText.appendChild(title);
  //   headerText.appendChild(status);
  header.appendChild(headerText);
  header.appendChild(avatar);

  // Create new chat button in header
  const newChatHeaderBtn = document.createElement("button");
  newChatHeaderBtn.className = "new-chat-header-btn";
  newChatHeaderBtn.textContent = "+ New Chat";
  header.appendChild(newChatHeaderBtn);

  // Create messages container
  messagesContainer = document.createElement("div");
  messagesContainer.className = "chatbot-messages";

  // Create welcome message
  const welcomeMsg = document.createElement("div");
  welcomeMsg.className = "message bot-message";

  const messageContent = document.createElement("div");
  messageContent.className = "message-content";

  const welcomePara1 = document.createElement("p");
  const welcomeText1 = document.createTextNode(
    `Hello ${currentUser.displayName}! I'm your relationship advisor 💕`
  );
  welcomePara1.appendChild(welcomeText1);

  const welcomePara2 = document.createElement("p");
  const welcomeText2 = !signIn
    ? document.createTextNode(
        "I'm here to help with dating advice, communication tips, conflict resolution, and relationship guidance. What's on your mind?"
      )
    : document.createTextNode(
        `Welcome back, ${currentUser.name}! 💕, how may I help you?`
      );
  welcomePara2.appendChild(welcomeText2);

  !signIn && messageContent.appendChild(welcomePara1);
  messageContent.appendChild(welcomePara2);

  const messageTime = document.createElement("div");
  messageTime.className = "message-time";
  const timeText = document.createTextNode(getCurrentTime());
  messageTime.appendChild(timeText);

  welcomeMsg.appendChild(messageContent);
  welcomeMsg.appendChild(messageTime);
  messagesContainer.appendChild(welcomeMsg);

  // Create input area
  const inputArea = document.createElement("div");
  inputArea.className = "chatbot-input-area";

  const inputWrapper = document.createElement("div");
  inputWrapper.className = "input-wrapper";

  const textInput = document.createElement("textarea");
  textInput.className = "chatbot-input";
  textInput.placeholder = "Ask about relationships, dating, communication...";
  textInput.rows = 1;

  const sendBtn = document.createElement("button");
  sendBtn.className = "send-btn";

  // Create SVG send icon manually
  const sendSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  sendSvg.setAttribute("width", "20");
  sendSvg.setAttribute("height", "20");
  sendSvg.setAttribute("viewBox", "0 0 24 24");
  sendSvg.setAttribute("fill", "currentColor");

  const sendPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  sendPath.setAttribute("d", "M2.01 21L23 12 2.01 3 2 10l15 2-15 2z");
  sendSvg.appendChild(sendPath);
  sendBtn.appendChild(sendSvg);

  inputWrapper.appendChild(textInput);
  inputWrapper.appendChild(sendBtn);
  inputArea.appendChild(inputWrapper);

  // Create typing indicator
  const typingIndicator = document.createElement("div");
  typingIndicator.className = "typing-indicator";

  const typingDots = document.createElement("div");
  typingDots.className = "typing-dots";

  const dot1 = document.createElement("span");
  const dot2 = document.createElement("span");
  const dot3 = document.createElement("span");

  typingDots.appendChild(dot1);
  typingDots.appendChild(dot2);
  typingDots.appendChild(dot3);

  const typingText = document.createElement("p");
  const typingTextContent = document.createTextNode("AI is thinking...");
  typingText.appendChild(typingTextContent);

  typingIndicator.appendChild(typingDots);
  typingIndicator.appendChild(typingText);
  typingIndicator.style.display = "none";

  // Assemble everything
  chatbotContainer.appendChild(header);
  chatbotContainer.appendChild(messagesContainer);
  chatbotContainer.appendChild(typingIndicator);
  chatbotContainer.appendChild(inputArea);

  return {
    container: chatbotContainer,
    messagesContainer: messagesContainer,
    textInput: textInput,
    sendBtn: sendBtn,
    newChatHeaderBtn: newChatHeaderBtn,
    typingIndicator: typingIndicator,
  };
}

function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Initialize chatbot
function initChatbot() {
  chatbotUI = createChatbotUI();
  document.body.appendChild(chatbotUI.container);

  // Add event listeners
  chatbotUI.sendBtn.addEventListener("click", () => sendMessage(chatbotUI));
  chatbotUI.textInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(chatbotUI);
    }
  });

  chatbotUI.newChatHeaderBtn.addEventListener("click", () => {
    startNewConversation();
  });

  // Auto-resize textarea
  chatbotUI.textInput.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 120) + "px";
  });

  return chatbotUI;
}
export async function startNewConversation() {
  try {
    // Clear current chat session if exists
    if (currentConversationId && typeof clearChatSession === "function") {
      clearChatSession(currentConversationId);
    }

    // Clear current conversation
    currentConversationId = null;

    // Clear messages
    if (chatbotUI && chatbotUI.messagesContainer) {
      chatbotUI.messagesContainer.innerHTML = "";

      // Add welcome message
      const welcomeMsg = document.createElement("div");
      welcomeMsg.className = "message bot-message";

      const messageContent = document.createElement("div");
      messageContent.className = "message-content";

      const welcomePara = document.createElement("p");
      const welcomeText = document.createTextNode(
        `Hello ${currentUser.displayName}! I'm ready for a new conversation. What would you like to discuss? 💕`
      );
      welcomePara.appendChild(welcomeText);
      messageContent.appendChild(welcomePara);

      const messageTime = document.createElement("div");
      messageTime.className = "message-time";
      const timeText = document.createTextNode(getCurrentTime());
      messageTime.appendChild(timeText);

      welcomeMsg.appendChild(messageContent);
      welcomeMsg.appendChild(messageTime);
      chatbotUI.messagesContainer.appendChild(welcomeMsg);
    }

    // Load conversations in sidebar
    if (typeof loadConversations === "function") {
      await loadConversations();
    }
  } catch (error) {
    console.error("Error starting new conversation:", error);
  }
}

async function sendMessage(chatbot) {
  const message = chatbot.textInput.value.trim();
  if (!message) return;

  // Add user message to UI
  addMessage(chatbot.messagesContainer, message, "user");
  chatbot.textInput.value = "";
  chatbot.textInput.style.height = "auto";

  // Show typing indicator
  chatbot.typingIndicator.style.display = "flex";
  chatbot.messagesContainer.scrollTop = chatbot.messagesContainer.scrollHeight;

  try {
    // Create conversation if doesn't exist
    if (!currentConversationId && currentUser) {
      const newConvo = await authDB.createConversation(currentUser.id);
      currentConversationId = newConvo.id;

      // Update navbar
      if (typeof loadConversations === "function") {
        await loadConversations();
      }
    }

    // Save user message to database
    if (currentConversationId) {
      const userMessage = {
        content: message,
        sender: "user",
        timestamp: new Date(),
      };
      await authDB.addMessageToConversation(currentConversationId, userMessage);
    }

    // Generate AI response using the chat session
    const aiResponse = await generateResponse(message, currentConversationId);
    chatbot.typingIndicator.style.display = "none";

    // Add AI message to UI
    addMessage(chatbot.messagesContainer, aiResponse, "bot");

    // Save AI message to database
    if (currentConversationId) {
      const aiMessage = {
        content: aiResponse,
        sender: "bot",
        timestamp: new Date(),
      };
      await authDB.addMessageToConversation(currentConversationId, aiMessage);

      // Update conversations list
      if (typeof loadConversations === "function") {
        await loadConversations();
      }
    }
  } catch (error) {
    chatbot.typingIndicator.style.display = "none";
    addMessage(
      chatbot.messagesContainer,
      "Sorry, I encountered an error. Please try again",
      "bot"
    );
    console.error("Error sending message:", error);
  }
}

export function addMessage(container, text, sender) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender}-message`;

  const messageContent = document.createElement("div");
  messageContent.className = "message-content";

  if (sender === "bot") {
    // Parse markdown and create DOM elements
    const formattedContent = parseMarkdownToDOM(text);
    messageContent.appendChild(formattedContent);
  } else {
    // User messages stay as plain text
    const messageText = document.createElement("p");
    const messageTextNode = document.createTextNode(text);
    messageText.appendChild(messageTextNode);
    messageContent.appendChild(messageText);
  }

  const messageTime = document.createElement("div");
  messageTime.className = "message-time";
  const timeText = document.createTextNode(getCurrentTime());
  messageTime.appendChild(timeText);

  messageDiv.appendChild(messageContent);
  messageDiv.appendChild(messageTime);
  container.appendChild(messageDiv);

  container.scrollTop = container.scrollHeight;
}
export async function loadConversationMessages(conversationId) {
  try {
    if (!chatbotUI || !chatbotUI.messagesContainer) return;

    const conversation = await authDB.getConversation(conversationId);
    if (!conversation) return;

    // Set current conversation
    currentConversationId = conversationId;

    // Update chat session with conversation history
    if (typeof updateChatSession === "function") {
      await updateChatSession(conversationId);
    }

    // Clear current messages
    chatbotUI.messagesContainer.innerHTML = "";

    // Load all messages
    if (conversation.messages && conversation.messages.length > 0) {
      conversation.messages.forEach((message) => {
        addMessage(
          chatbotUI.messagesContainer,
          message.content,
          message.sender
        );
      });
    } else {
      // Add welcome message if no messages
      const welcomeMsg = document.createElement("div");
      welcomeMsg.className = "message bot-message";

      const messageContent = document.createElement("div");
      messageContent.className = "message-content";

      const welcomePara = document.createElement("p");
      const welcomeText = document.createTextNode(
        `Welcome back to this conversation! Continue where you left off. 💕`
      );
      welcomePara.appendChild(welcomeText);
      messageContent.appendChild(welcomePara);

      const messageTime = document.createElement("div");
      messageTime.className = "message-time";
      const timeText = document.createTextNode(getCurrentTime());
      messageTime.appendChild(timeText);

      welcomeMsg.appendChild(messageContent);
      welcomeMsg.appendChild(messageTime);
      chatbotUI.messagesContainer.appendChild(welcomeMsg);
    }
  } catch (error) {
    console.error("Error loading conversation messages:", error);
  }
}

export { initChatbot };
