import { initChatbot, addMessage } from "./chatUI";
import { initNavigation } from "./navBar";
import { createSignInPage } from "./signIn";
import { authDB } from "./auth";

// app.js
let currentUser = null;

async function loadUserData(user) {
  currentUser = user;

  // Store user in session
  sessionStorage.setItem("currentUser", JSON.stringify(user));

  // Hide auth UI, show main app
  const authContainer = document.querySelector(".auth-container");
  if (authContainer) {
    authContainer.style.opacity = "0";
    setTimeout(() => {
      authContainer.remove();
      initializeMainApp();
    }, 300);
  }

  function initializeMainApp() {
    // Your existing chatbot initialization
    const chatbot = initChatbot();

    // Welcome message
    setTimeout(() => {
      addMessage(
        chatbot.messagesContainer,
        `Welcome back, ${currentUser.name}! 💕 How can I help with your relationships today?`,
        "bot"
      );
      initNavigation();
    }, 500);
  }

  // Check if user is already logged in
  function checkExistingSession() {
    const storedUser = sessionStorage.getItem("currentUser");
    if (storedUser !== "undefined") {
      currentUser = JSON.parse(storedUser);
      initializeMainApp();
      return true;
    }
    return false;
  }

  // Initialize app
  async function initApp() {
    await authDB.init();

    if (!checkExistingSession()) {
      const authPage = createSignInPage();
      document.body.appendChild(authPage);
    }
  }

  // Utility functions
  function showError(errorElement, message) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }

  // Start the app
  initApp();
}

export { loadUserData };
