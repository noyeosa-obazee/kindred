import { authDB } from "./auth";
import { createSignInPage } from "./signIn";
import { loadUserData } from "./loadData";

function showSignUpPage(authContainer, name) {
  authContainer.innerHTML = "";
  authContainer.className = "auth-container";

  // Header
  const header = document.createElement("div");
  header.className = "auth-header";

  const logo = document.createElement("div");
  logo.className = "auth-logo";
  logo.textContent = "🎉";

  const title = document.createElement("h1");
  title.textContent = "Welcome!";

  const subtitle = document.createElement("p");
  subtitle.textContent = "We're excited to have you join our community";
  subtitle.className = "auth-subtitle";

  header.appendChild(logo);
  header.appendChild(title);
  header.appendChild(subtitle);

  // Form
  const form = document.createElement("form"); //same story as in sign in
  form.className = "auth-form";

  const formTitle = document.createElement("h2");
  formTitle.textContent = "Create Your Account";

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "Your beautiful name...";
  nameInput.className = "auth-input";
  nameInput.value = name;
  nameInput.required = true;

  const signUpBtn = document.createElement("button");
  signUpBtn.className = "auth-btn primary";
  signUpBtn.textContent = "Create Account & Start Chatting";

  const backBtn = document.createElement("button");
  backBtn.className = "auth-btn secondary";
  backBtn.textContent = "← Back";

  const loadingSpinner = document.createElement("div");
  loadingSpinner.className = "loading-spinner";
  loadingSpinner.style.display = "none";

  const errorMessage = document.createElement("div");
  errorMessage.className = "error-message";

  form.appendChild(formTitle);
  form.appendChild(nameInput);
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
  form.addEventListener("submit", async () => {
    //sae story as in sign in page
    const finalName = nameInput.value.trim();
    if (!finalName) {
      showError(errorMessage, "Please enter your name");
      return;
    }

    signUpBtn.style.display = "none";
    backBtn.style.display = "none";
    loadingSpinner.style.display = "block";
    errorMessage.textContent = "";

    try {
      const newUser = await authDB.createUser(finalName);
      await loadUserData(newUser);
    } catch (error) {
      if (error.name === "ConstraintError") {
        showError(
          errorMessage,
          "This name is already taken. Please choose another."
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

  backBtn.addEventListener("click", () => {
    // Go back to sign in
    const newAuth = createSignInPage();
    authContainer.parentNode.replaceChild(newAuth, authContainer);
  });
}

export { showSignUpPage };
