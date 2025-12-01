import { authDB } from "./auth";
import { createSignInPage } from "./signIn";
import { initApp, setCurrentUser } from "./app";

function showSignUpPage(authContainer, username, displayName) {
  authContainer.innerHTML = "";
  authContainer.className = "auth-container";

  // Header
  const header = document.createElement("div");
  header.className = "auth-header";

  const logo = document.createElement("div");
  logo.className = "auth-logo";
  logo.textContent = "🎉";

  const title = document.createElement("h1");
  title.textContent = "Create a Kindred Account";

  const subtitle = document.createElement("p");
  subtitle.textContent = "Join our community of relationship seekers";
  subtitle.className = "auth-subtitle";

  header.appendChild(logo);
  header.appendChild(title);
  header.appendChild(subtitle);

  // Form
  const form = document.createElement("form");
  form.className = "auth-form";

  const formTitle = document.createElement("h2");
  formTitle.textContent = "Create Your Account";

  // Username display (read-only if coming from sign in)
  const usernameDisplay = document.createElement("div");
  usernameDisplay.className = "username-display";

  const usernameLabel = document.createElement("div");
  usernameLabel.className = "username-label";
  usernameLabel.textContent = "Username:";

  const usernameValue = document.createElement("div");
  usernameValue.className = "username-value";
  usernameValue.textContent = username || "Enter below";

  usernameDisplay.appendChild(usernameLabel);
  usernameDisplay.appendChild(usernameValue);

  // Username input (only if not coming from sign in)
  let usernameInput = null;
  if (!username) {
    usernameInput = document.createElement("input");
    usernameInput.type = "text";
    usernameInput.placeholder = "Choose a unique username...";
    usernameInput.className = "auth-input";
    usernameInput.required = true;
    usernameInput.autofocus = true;
  }

  // Display name input (required)
  const displayNameInput = document.createElement("input");
  displayNameInput.type = "text";
  displayNameInput.placeholder = "What should we call you? (first name)";
  displayNameInput.className = "auth-input";
  displayNameInput.value = displayName || "";
  displayNameInput.required = true;
  if (username) {
    displayNameInput.autofocus = true;
  }

  const signUpBtn = document.createElement("button");
  signUpBtn.className = "auth-btn primary";
  signUpBtn.textContent = "Create Account & Start Chatting";

  const backBtn = document.createElement("button");
  backBtn.className = "auth-btn secondary";
  backBtn.textContent = "← Back to Sign In";

  const loadingSpinner = document.createElement("div");
  loadingSpinner.className = "loading-spinner";
  loadingSpinner.style.display = "none";

  const errorMessage = document.createElement("div");
  errorMessage.className = "error-message";

  // Build form
  form.appendChild(formTitle);
  form.appendChild(usernameDisplay);

  if (usernameInput) {
    form.appendChild(usernameInput);
  }

  form.appendChild(displayNameInput);
  form.appendChild(signUpBtn);
  form.appendChild(backBtn);
  form.appendChild(loadingSpinner);
  form.appendChild(errorMessage);

  // Footer
  const footer = document.createElement("div");
  footer.className = "auth-footer";
  footer.textContent = "Ready to improve your relationships! 💫";

  authContainer.appendChild(header);
  authContainer.appendChild(form);
  authContainer.appendChild(footer);

  // Event listeners
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const finalUsername =
      username ||
      (usernameInput ? usernameInput.value.trim().toLowerCase() : "");
    const finalDisplayName = displayNameInput.value.trim();

    if (!finalUsername) {
      showError(errorMessage, "Please enter a username");
      return;
    }

    if (!finalDisplayName) {
      showError(errorMessage, "Please enter what we should call you");
      return;
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(finalUsername)) {
      showError(
        errorMessage,
        "Username can only contain letters, numbers, and underscores"
      );
      return;
    }

    if (finalUsername.length < 3) {
      showError(errorMessage, "Username must be at least 3 characters");
      return;
    }

    signUpBtn.style.display = "none";
    backBtn.style.display = "none";
    loadingSpinner.style.display = "block";
    errorMessage.textContent = "";

    try {
      // Double-check username isn't taken
      const existingUser = await authDB.getUserByUsername(finalUsername);
      if (existingUser) {
        throw { name: "ConstraintError" };
      }

      const newUser = await authDB.createUser(finalUsername, finalDisplayName);
      setCurrentUser(newUser);
      await initApp();
    } catch (error) {
      if (error.name === "ConstraintError") {
        showError(
          errorMessage,
          "This username is already taken. Please choose another."
        );
      } else {
        showError(errorMessage, "Failed to create account. Please try again.");
      }
      console.error("Signup error:", error);
    } finally {
      signUpBtn.style.display = "block";
      backBtn.style.display = "block";
      loadingSpinner.style.display = "none";
    }
  });

  backBtn.addEventListener("click", (e) => {
    e.preventDefault();
    // Go back to sign in
    const newAuth = createSignInPage();
    authContainer.parentNode.replaceChild(newAuth, authContainer);
  });
}

function showError(element, message) {
  element.textContent = message;
  element.style.display = "block";
}

export { showSignUpPage };
