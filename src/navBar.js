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
  const conversationsList = document.createElement("div");
  conversationsList.className = "conversations-list";

  // Sample conversations (you'll replace this with real data)
  const sampleConversations = [
    {
      id: 1,
      title: "Relationship Communication",
      date: new Date(),
      pinned: true,
    },
    {
      id: 2,
      title: "Dating Advice",
      date: new Date(Date.now() - 86400000),
      pinned: false,
    },
    {
      id: 3,
      title: "Conflict Resolution",
      date: new Date(Date.now() - 172800000),
      pinned: false,
    },
  ];

  // Populate conversations
  sampleConversations.forEach((convo) => {
    const convoItem = createConversationItem(convo);
    conversationsList.appendChild(convoItem);
  });

  // Assemble sidebar
  sidebar.appendChild(sidebarHeader);
  sidebar.appendChild(conversationsList);

  // Assemble nav
  nav.appendChild(toggleBtn);
  nav.appendChild(sidebar);

  // Add event listeners
  setupNavEvents(nav, sidebar, toggleBtn, newChatBtn);

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
  title.textContent = conversation.title;

  const date = document.createElement("div");
  date.className = "conversation-date";
  date.textContent = formatConversationDate(conversation.date);

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
  enterBtn.onclick = () => enterConversation(conversation.id);

  const pinBtn = document.createElement("button");
  pinBtn.className = "menu-option";
  pinBtn.innerHTML = conversation.pinned ? "📌 Unpin" : "📌 Pin";
  pinBtn.onclick = () => togglePinConversation(conversation.id);

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "menu-option delete";
  deleteBtn.innerHTML = "🗑️ Delete";
  deleteBtn.onclick = () => deleteConversation(conversation.id);

  menuDropdown.appendChild(enterBtn);
  menuDropdown.appendChild(pinBtn);
  menuDropdown.appendChild(deleteBtn);

  item.appendChild(content);
  item.appendChild(menuBtn);
  item.appendChild(menuDropdown);

  return item;
}

function formatConversationDate(date) {
  const now = new Date();
  const diffTime = now - date;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

function setupNavEvents(nav, sidebar, toggleBtn, newChatBtn) {
  // Toggle sidebar
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });

  // New chat button
  newChatBtn.addEventListener("click", () => {
    startNewConversation();
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

// Placeholder functions for menu actions
function enterConversation(convoId) {
  console.log("Entering conversation:", convoId);
  // Load conversation history and display it
}

function togglePinConversation(convoId) {
  console.log("Toggling pin for conversation:", convoId);
  // Toggle pinned status in your data store
}

function deleteConversation(convoId) {
  console.log("Deleting conversation:", convoId);
  // Remove from data store and UI
}

function startNewConversation() {
  console.log("Starting new conversation");
  // Clear current chat and start fresh
}

// Initialize the navigation
function initNavigation() {
  const nav = createNavigationMenu();
  document.body.appendChild(nav);
  return nav;
}

// Add to your existing initialization
export { initNavigation };
