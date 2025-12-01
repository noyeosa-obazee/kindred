import { currentUser, authDB, logout } from "./app.js";
import { loadConversationMessages, startNewConversation } from "./chatUI.js";

let conversationsList = null;

function createNavigationMenu() {
  // Create main nav container
  const nav = document.createElement("div");
  nav.className = "chatbot-nav";

  // Create toggle button
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "nav-toggle";
  toggleBtn.innerHTML = "☰";

  // Create sidebar
  const sidebar = document.createElement("div");
  sidebar.className = "nav-sidebar";

  // Create header
  const sidebarHeader = document.createElement("div");
  sidebarHeader.className = "sidebar-header";

  const sidebarTitle = document.createElement("h3");
  sidebarTitle.textContent = "Conversations";
  sidebarHeader.appendChild(sidebarTitle);

  const newChatBtn = document.createElement("button");
  newChatBtn.className = "new-chat-btn";
  newChatBtn.innerHTML = "+ New Chat";
  sidebarHeader.appendChild(newChatBtn);

  // Create conversations list
  conversationsList = document.createElement("div");
  conversationsList.className = "conversations-list";

  // Create footer with logout button
  const sidebarFooter = document.createElement("div");
  sidebarFooter.className = "sidebar-footer";

  const userInfo = document.createElement("div");
  userInfo.className = "sidebar-user-info";

  const userName = document.createElement("div");
  userName.className = "sidebar-user-name";
  userName.textContent = currentUser ? currentUser.displayName : "User";

  const logoutBtn = document.createElement("button");
  logoutBtn.className = "logout-btn";
  logoutBtn.innerHTML = "🚪 Log Out";

  userInfo.appendChild(userName);
  sidebarFooter.appendChild(userInfo);
  sidebarFooter.appendChild(logoutBtn);

  // Assemble sidebar
  sidebar.appendChild(sidebarHeader);
  sidebar.appendChild(conversationsList);
  sidebar.appendChild(sidebarFooter);

  // Assemble nav
  nav.appendChild(toggleBtn);
  nav.appendChild(sidebar);

  // Add event listeners
  setupNavEvents(nav, sidebar, toggleBtn, newChatBtn, logoutBtn);

  return nav;
}

function createConversationItem(conversation) {
  const item = document.createElement("div");
  item.className = `conversation-item ${conversation.pinned ? "pinned" : ""}`;
  item.dataset.id = conversation.id;

  // Main content
  const content = document.createElement("div");
  content.className = "conversation-content";

  const title = document.createElement("div");
  title.className = "conversation-title";
  title.textContent = conversation.title || "New Conversation";

  const date = document.createElement("div");
  date.className = "conversation-date";
  date.textContent = formatConversationDate(
    conversation.lastUpdated || conversation.createdAt
  );

  content.appendChild(title);
  content.appendChild(date);

  // Menu button
  const menuBtn = document.createElement("button");
  menuBtn.className = "conversation-menu-btn";
  menuBtn.innerHTML = "⋯";

  // Menu dropdown (hidden by default)
  const menuDropdown = document.createElement("div");
  menuDropdown.className = "conversation-menu-dropdown";

  const enterBtn = document.createElement("button");
  enterBtn.className = "menu-option";
  enterBtn.innerHTML = "📝 Enter";
  enterBtn.onclick = (e) => {
    e.stopPropagation();
    enterConversation(conversation.id);
  };

  const pinBtn = document.createElement("button");
  pinBtn.className = "menu-option";
  pinBtn.innerHTML = conversation.pinned ? "📌 Unpin" : "📌 Pin";
  pinBtn.onclick = (e) => {
    e.stopPropagation();
    togglePinConversation(conversation.id);
  };

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "menu-option delete";
  deleteBtn.innerHTML = "🗑️ Delete";
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    deleteConversation(conversation.id);
  };

  menuDropdown.appendChild(enterBtn);
  menuDropdown.appendChild(pinBtn);
  menuDropdown.appendChild(deleteBtn);

  item.appendChild(content);
  item.appendChild(menuBtn);
  item.appendChild(menuDropdown);

  // Click on item to enter conversation
  item.addEventListener("click", (e) => {
    if (
      !e.target.closest(".conversation-menu-btn") &&
      !e.target.closest(".conversation-menu-dropdown")
    ) {
      enterConversation(conversation.id);
    }
  });

  return item;
}

function formatConversationDate(date) {
  const now = new Date();
  const dateObj = new Date(date);
  const diffTime = now - dateObj;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return dateObj.toLocaleDateString();
  }
}

function setupNavEvents(nav, sidebar, toggleBtn, newChatBtn, logoutBtn) {
  // Toggle sidebar
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });

  // New chat button
  newChatBtn.addEventListener("click", async () => {
    await startNewConversation();
    sidebar.classList.remove("active");
  });

  // Logout button
  logoutBtn.addEventListener("click", () => {
    logout();
  });

  // Close sidebar when clicking outside
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && sidebar.classList.contains("active")) {
      sidebar.classList.remove("active");
    }
  });

  // Conversation menu toggle
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("conversation-menu-btn")) {
      const dropdown = e.target.nextElementSibling;
      const allDropdowns = document.querySelectorAll(
        ".conversation-menu-dropdown"
      );

      // Close all other dropdowns
      allDropdowns.forEach((d) => {
        if (d !== dropdown) d.classList.remove("active");
      });

      // Toggle current dropdown
      dropdown.classList.toggle("active");
      e.stopPropagation();
    } else {
      // Close all dropdowns when clicking elsewhere
      document.querySelectorAll(".conversation-menu-dropdown").forEach((d) => {
        d.classList.remove("active");
      });
    }
  });
}
// Conversation actions
export async function enterConversation(convoId) {
  try {
    await loadConversationMessages(convoId);

    // Close sidebar
    const sidebar = document.querySelector(".nav-sidebar");
    if (sidebar) {
      sidebar.classList.remove("active");
    }
  } catch (error) {
    console.error("Error entering conversation:", error);
  }
}

export async function togglePinConversation(convoId) {
  try {
    const conversation = await authDB.getConversation(convoId);
    if (conversation) {
      await authDB.updateConversation(convoId, {
        pinned: !conversation.pinned,
      });
      await loadConversations();
    }
  } catch (error) {
    console.error("Error toggling pin:", error);
  }
}

export async function deleteConversation(convoId) {
  try {
    if (confirm("Are you sure you want to delete this conversation?")) {
      await authDB.deleteConversation(convoId);
      await loadConversations();
    }
  } catch (error) {
    console.error("Error deleting conversation:", error);
  }
}

export async function loadConversations() {
  try {
    if (!currentUser || !authDB || !conversationsList) return;

    const conversations = await authDB.getConversationsByUser(currentUser.id);

    // Sort by pinned first, then by lastUpdated
    conversations.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.lastUpdated) - new Date(a.lastUpdated);
    });

    // Clear current list
    conversationsList.innerHTML = "";

    if (conversations.length === 0) {
      const emptyMessage = document.createElement("div");
      emptyMessage.className = "empty-conversations";
      emptyMessage.textContent = "No conversations yet. Start a new chat!";
      conversationsList.appendChild(emptyMessage);
    } else {
      conversations.forEach((convo) => {
        const convoItem = createConversationItem(convo);
        conversationsList.appendChild(convoItem);
      });
    }
  } catch (error) {
    console.error("Error loading conversations:", error);
    conversationsList.innerHTML = "";
    const errorMessage = document.createElement("div");
    errorMessage.className = "error-message";
    errorMessage.textContent = "Error loading conversations";
    conversationsList.appendChild(errorMessage);
  }
}

export function setCurrentConversation(id) {
  // This will be used by chatUI
  // console.log("Current conversation set to:", id);
}

// Initialize the navigation
function initNavigation() {
  const nav = createNavigationMenu();
  document.body.appendChild(nav);

  // Load conversations after a short delay to ensure user is set
  setTimeout(() => {
    loadConversations();
  }, 100);

  return nav;
}

export { initNavigation };
