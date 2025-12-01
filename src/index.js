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

// function clearEntireDatabase() {
//     return new Promise((resolve, reject) => {
//         const request = indexedDB.deleteDatabase('RelationshipChatDB');

//         request.onsuccess = () => {
//             console.log('Database deleted successfully');
//             resolve();
//         };

//         request.onerror = () => reject(request.error);
//         request.onblocked = () => {
//             console.log('Database is blocked - close all connections');
//             reject(new Error('Database blocked'));
//         };
//     });
// }

// // Usage
// await clearEntireDatabase();
// // Database will be recreated on next init()
// sessionStorage.removeItem("currentUser");
