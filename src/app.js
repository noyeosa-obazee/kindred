// app.js
import { authDB as authDataBase } from "./auth.js";
import { createSignInPage } from "./signIn.js";
import { initChatbot, addMessage, signIn, setSignIn } from "./chatUI.js";
import { initNavigation } from "./navBar.js";

const messagesContainer = document.querySelector(".chatbot-messages");

export let currentUser = null;
export let authDB = null;

export async function initApp() {
  try {
    // 1. Initialize database first
    authDB = authDataBase;
    await authDB.init();

    // 2. Check for existing session
    if (!checkExistingSession()) {
      // 3. No session - show sign in page
      showAuthPage();
      setSignIn(false);
    } else {
      setSignIn(true);
    }

    // If session exists, initializeMainApp() is called automatically
  } catch (error) {
    console.error("App initialization failed:", error);
    throw error; // Re-throw to handle in index.js
  }
}

export function checkExistingSession() {
  try {
    const storedUser = sessionStorage.getItem("currentUser");

    if (currentUser) {
      console.log(currentUser);
      //   currentUser = JSON.parse(storedUser);
      initializeMainApp();
      return true;
    }
    return false;
  } catch (error) {
    console.error("Session check failed:", error);
    sessionStorage.removeItem("currentUser");
    return false;
  }
}

export function showAuthPage() {
  const authPage = createSignInPage();
  document.body.appendChild(authPage);
}

export function initializeMainApp() {
  document.body.textContent = "";
  // Your existing main app initialization
  //   let mainAppInitialized = false;
  //   if (mainAppInitialized) {
  //     console.log("Main app already initialized");
  //     return;
  //   }

  //   mainAppInitialized = true;
  initChatbot();
  initNavigation();

  //   // Welcome message
  //   setTimeout(() => {
  //     // You'll need to import your addMessage function
  //     if (currentUser) {
  //       addMessage(
  //         messagesContainer,
  //         `Welcome back, ${currentUser.name}! 💕`,
  //         "bot"
  //       );
  //     }
  //   }, 500);
}

// Export for other modules to use
export function setCurrentUser(user) {
  sessionStorage.setItem("currentUser", JSON.stringify(user));
  currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
}

export function logout() {
  currentUser = null;
  sessionStorage.removeItem("currentUser");
  location.reload(); // Simple way to reset the app
}
