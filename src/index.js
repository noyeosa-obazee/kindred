import "./style.css";
import { initChatbot } from "./chatUI.js";
import { initNavigation } from "./navBar.js";
import { initApp } from "./app.js";

initApp().catch((error) => {
  console.error("Failed to initialize app:", error);
});
