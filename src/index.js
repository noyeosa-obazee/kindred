import "./style.css";
import { initChatbot } from "./chatUI.js";
import { initNavigation } from "./navBar.js";
import { initApp } from "./app.js";

// initNavigation();
// initChatbot();

initApp().catch((error) => {
  console.error("Failed to initialize app:", error);
  // Show a user-friendly error message
  // document.body.innerHTML = `
  //     <div style="padding: 20px; text-align: center; font-family: sans-serif;">
  //         <h2>😕 Something went wrong</h2>
  //         <p>Please refresh the page and try again.</p>
  //     </div>
  // `;
});
