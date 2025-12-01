// app.js
import { authDB as authDataBase } from "./auth.js";
import { createSignInPage } from "./signIn.js";
import { initChatbot, addMessage, signIn, setSignIn } from "./chatUI.js";
import { initNavigation } from "./navBar.js";

const messagesContainer = document.querySelector(".chatbot-messages");

export let currentUser =
  JSON.parse(sessionStorage.getItem("currentUser")) || null;
export let authDB = null;

export async function initApp() {
  try {
    authDB = authDataBase;
    await authDB.init();

    if (!checkExistingSession()) {
      showAuthPage();
      setSignIn(false);
    } else {
      setSignIn(true);
    }
  } catch (error) {
    console.error("App initialization failed:", error);
    throw error;
  }
}

export function checkExistingSession() {
  try {
    const storedUser = sessionStorage.getItem("currentUser");

    if (currentUser) {
      //   console.log(currentUser);

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

  initChatbot();
  initNavigation();

  setTimeout(() => {
    if (currentUser) {
    }
  }, 500);
}

export function setCurrentUser(user) {
  sessionStorage.setItem("currentUser", JSON.stringify(user));
  currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
}

export function logout() {
  currentUser = null;
  sessionStorage.removeItem("currentUser");
  location.reload();
}
