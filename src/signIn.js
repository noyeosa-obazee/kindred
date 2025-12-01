import { authDB } from "./auth";
import { showSignUpPage } from "./signup";
import { initApp, setCurrentUser } from "./app";

function createSignInPage() {
  const container = document.createElement("div");
  container.className = "auth-container";

  // Header
  const header = document.createElement("div");
  header.className = "auth-header";

  const logo = document.createElement("div");
  logo.className = "auth-logo";
  logo.textContent = "💕";

  const title = document.createElement("h1");
  title.textContent = "Welcome to Kindred";

  const subtitle = document.createElement("p");
  subtitle.textContent = "Your personal relationship guidance companion";
  subtitle.className = "auth-subtitle";

  header.appendChild(logo);
  header.appendChild(title);
  header.appendChild(subtitle);

  // Form
  const form = document.createElement("form");
  form.className = "auth-form";

  const formTitle = document.createElement("h2");
  formTitle.textContent = "Sign In";

  // Username input
  const usernameInput = document.createElement("input");
  usernameInput.type = "text";
  usernameInput.placeholder = "Enter your username...";
  usernameInput.className = "auth-input";
  usernameInput.required = true;
  usernameInput.autofocus = true;

  const signInBtn = document.createElement("button");
  signInBtn.className = "auth-btn primary";
  signInBtn.textContent = "Sign In";
  signInBtn.type = "submit";

  const loadingSpinner = document.createElement("div");
  loadingSpinner.className = "loading-spinner";
  loadingSpinner.style.display = "none";

  // Error message container
  const errorContainer = document.createElement("div");
  errorContainer.className = "error-container";
  errorContainer.style.display = "none";

  const errorIcon = document.createElement("span");
  errorIcon.textContent = "⚠️";
  errorIcon.style.marginRight = "8px";
  errorIcon.style.fontSize = "16px";

  const errorMessage = document.createElement("div");
  errorMessage.className = "error-message";
  errorMessage.style.margin = "0";

  const signupSuggestion = document.createElement("div");
  signupSuggestion.className = "signup-suggestion";
  signupSuggestion.style.marginTop = "8px";
  signupSuggestion.style.fontSize = "13px";

  const signupLink = document.createElement("button");
  signupLink.className = "auth-link-btn";
  signupLink.textContent = "Create an account";
  signupLink.type = "button";
  signupLink.style.marginLeft = "5px";

  signupSuggestion.appendChild(document.createTextNode("New here?"));
  signupSuggestion.appendChild(signupLink);

  errorContainer.appendChild(errorIcon);
  errorContainer.appendChild(errorMessage);
  errorContainer.appendChild(signupSuggestion);

  // Signup link at bottom
  const bottomSignupLink = document.createElement("p");
  bottomSignupLink.className = "auth-link";

  const bottomSignupText = document.createElement("span");
  bottomSignupText.textContent = "Don't have an account? ";

  const bottomSignupButton = document.createElement("button");
  bottomSignupButton.className = "auth-link-btn";
  bottomSignupButton.textContent = "Sign up";
  bottomSignupButton.type = "button";

  bottomSignupLink.appendChild(bottomSignupText);
  bottomSignupLink.appendChild(bottomSignupButton);

  form.appendChild(formTitle);
  form.appendChild(usernameInput);
  form.appendChild(signInBtn);
  form.appendChild(loadingSpinner);
  form.appendChild(errorContainer);
  form.appendChild(bottomSignupLink);

  // Footer
  const footer = document.createElement("div");
  footer.className = "auth-footer";
  footer.textContent = "Your conversations are private and secure. ✨";

  container.appendChild(header);
  container.appendChild(form);
  container.appendChild(footer);

  // Event listeners
  setupAuthEvents(
    container,
    usernameInput,
    signInBtn,
    form,
    loadingSpinner,
    errorContainer,
    errorMessage,
    signupSuggestion,
    signupLink,
    bottomSignupButton
  );

  return container;
}

function setupAuthEvents(
  container,
  usernameInput,
  signInBtn,
  form,
  loadingSpinner,
  errorContainer,
  errorMessage,
  signupSuggestion,
  signupLink,
  bottomSignupButton
) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim().toLowerCase();

    if (!username) {
      showError(
        errorContainer,
        errorMessage,
        signupSuggestion,
        "Please enter your username"
      );
      return;
    }

    // Show loading
    signInBtn.style.display = "none";
    loadingSpinner.style.display = "block";
    errorContainer.style.display = "none";

    try {
      // Check if user exists by username
      const existingUser = await authDB.getUserByUsername(username);

      if (existingUser) {
        // User exists - sign them in
        await authDB.updateUserLastLogin(existingUser.id);
        setCurrentUser(existingUser);
        await initApp();
      } else {
        // Username not found - show error with suggestion
        showError(
          errorContainer,
          errorMessage,
          signupSuggestion,
          `Username "${username}" not found.`
        );

        // Clear the input for retry
        usernameInput.focus();
        usernameInput.select();
      }
    } catch (error) {
      showError(
        errorContainer,
        errorMessage,
        signupSuggestion,
        "Something went wrong. Please try again."
      );
      console.error("Auth error:", error);
    } finally {
      // Hide loading
      signInBtn.style.display = "block";
      loadingSpinner.style.display = "none";
    }
  });

  // Signup link in error message
  signupLink.addEventListener("click", () => {
    showSignUpPage(container, usernameInput.value.trim(), "");
  });

  // Bottom signup button
  bottomSignupButton.addEventListener("click", () => {
    showSignUpPage(container, "", "");
  });

  // Clear error when user starts typing
  usernameInput.addEventListener("input", () => {
    if (errorContainer.style.display === "block") {
      errorContainer.style.display = "none";
    }
  });

  // Enter key support
  usernameInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      form.dispatchEvent(new Event("submit"));
    }
  });
}

function showError(container, messageElement, suggestionElement, message) {
  messageElement.textContent = message;
  suggestionElement.style.display = "block";
  container.style.display = "block";
}

export { createSignInPage };
