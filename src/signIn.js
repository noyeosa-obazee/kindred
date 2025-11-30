import { authDB } from "./auth";
import { showSignUpPage } from "./signup";
import { loadUserData } from "./loadData";

// auth-ui.js
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
  title.textContent = "Relationship Advisor";

  const subtitle = document.createElement("p");
  subtitle.textContent = "Your personal relationship guidance companion";
  subtitle.className = "auth-subtitle";

  header.appendChild(logo);
  header.appendChild(title);
  header.appendChild(subtitle);

  // Form
  const form = document.createElement("form"); //changed 'div' to 'form'
  form.className = "auth-form";

  const formTitle = document.createElement("h2");
  formTitle.textContent = "Enter Your Name";

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "Your beautiful name...";
  nameInput.className = "auth-input";
  nameInput.required = true;

  const signInBtn = document.createElement("button");
  signInBtn.className = "auth-btn primary";
  signInBtn.textContent = "Continue";
  signInBtn.type = "submit";

  const loadingSpinner = document.createElement("div");
  loadingSpinner.className = "loading-spinner";
  loadingSpinner.style.display = "none";

  const errorMessage = document.createElement("div");
  errorMessage.className = "error-message";

  form.appendChild(formTitle);
  form.appendChild(nameInput);
  form.appendChild(signInBtn);
  form.appendChild(loadingSpinner);
  form.appendChild(errorMessage);

  // Footer
  const footer = document.createElement("div");
  footer.className = "auth-footer";
  footer.textContent = "No password needed. Just your name! ✨";

  container.appendChild(header);
  container.appendChild(form);
  container.appendChild(footer);

  //   // Add styles
  //   addAuthStyles();

  // Event listeners
  setupAuthEvents(
    container,
    nameInput,
    signInBtn,
    form,
    loadingSpinner,
    errorMessage
  );

  return container;
}

function setupAuthEvents(
  container,
  nameInput,
  signInBtn,
  form,
  loadingSpinner,
  errorMessage
) {
  form.addEventListener("submit", async (e) => {
    //changed 'sign in button' to 'form' and changed 'click' to 'submit'
    e.preventDefault();

    const name = nameInput.value.trim();
    if (!name) {
      showError(errorMessage, "Please enter your name");
      return;
    }

    // Show loading
    signInBtn.style.display = "none";
    loadingSpinner.style.display = "block";
    errorMessage.textContent = "";

    try {
      // Check if user exists
      const existingUser = await authDB.getUserByName(name);

      if (existingUser) {
        // User exists - sign them in
        await authDB.updateUserLastLogin(existingUser.id);
        await loadUserData(existingUser);
      } else {
        // New user - show signup page
        showSignUpPage(container, name);
      }
    } catch (error) {
      showError(errorMessage, "Something went wrong. Please try again.");
      console.error("Auth error:", error);
    } finally {
      // Hide loading
      signInBtn.style.display = "block";
      loadingSpinner.style.display = "none";
    }
  });

  // Enter key support
  nameInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      signInBtn.click();
    }
  });
}

export { createSignInPage };
