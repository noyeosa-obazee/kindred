// auth.js
class AuthDatabase {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("RelationshipChatDB", 2); // Version 2 for conversations

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const oldVersion = event.oldVersion || 0;

        // Create users store
        if (!db.objectStoreNames.contains("users")) {
          const usersStore = db.createObjectStore("users", {
            keyPath: "id",
            autoIncrement: true,
          });
          usersStore.createIndex("name", "name", { unique: true });
          usersStore.createIndex("createdAt", "createdAt", { unique: false });
        }

        // Create conversations store
        if (!db.objectStoreNames.contains("conversations")) {
          const convosStore = db.createObjectStore("conversations", {
            keyPath: "id",
            autoIncrement: true,
          });
          convosStore.createIndex("userId", "userId", { unique: false });
          convosStore.createIndex("createdAt", "createdAt", { unique: false });
          convosStore.createIndex("lastUpdated", "lastUpdated", {
            unique: false,
          });
          convosStore.createIndex("title", "title", { unique: false });
          convosStore.createIndex("pinned", "pinned", { unique: false });
        }

        // For version 2, add messages array to conversations
        if (oldVersion < 2) {
          const transaction = event.target.transaction;
          const convosStore = transaction.objectStore("conversations");

          // Add messages array if not exists (we'll handle this in code)
        }
      };
    });
  }

  // User methods
  async getUserByName(name) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["users"], "readonly");
      const store = transaction.objectStore("users");
      const index = store.index("name");
      const request = index.get(name);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async createUser(name) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["users"], "readwrite");
      const store = transaction.objectStore("users");

      const user = {
        name: name.trim(),
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      const request = store.add(user);

      request.onsuccess = () => resolve({ id: request.result, ...user });
      request.onerror = () => reject(request.error);
    });
  }

  async updateUserLastLogin(userId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["users"], "readwrite");
      const store = transaction.objectStore("users");

      const getRequest = store.get(userId);
      getRequest.onsuccess = () => {
        const user = getRequest.result;
        user.lastLogin = new Date();

        const updateRequest = store.put(user);
        updateRequest.onsuccess = () => resolve(user);
        updateRequest.onerror = () => reject(updateRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Conversation methods
  async createConversation(userId, title = "New Conversation") {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["conversations"], "readwrite");
      const store = transaction.objectStore("conversations");

      const conversation = {
        userId: userId,
        title: title,
        messages: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
        pinned: false,
      };

      const request = store.add(conversation);

      request.onsuccess = () =>
        resolve({ id: request.result, ...conversation });
      request.onerror = () => reject(request.error);
    });
  }

  async getConversationsByUser(userId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["conversations"], "readonly");
      const store = transaction.objectStore("conversations");
      const index = store.index("userId");
      const request = index.getAll(userId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getConversation(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["conversations"], "readonly");
      const store = transaction.objectStore("conversations");
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateConversation(id, updates) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["conversations"], "readwrite");
      const store = transaction.objectStore("conversations");

      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const conversation = getRequest.result;
        Object.assign(conversation, updates);
        conversation.lastUpdated = new Date();

        const updateRequest = store.put(conversation);
        updateRequest.onsuccess = () => resolve(conversation);
        updateRequest.onerror = () => reject(updateRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteConversation(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["conversations"], "readwrite");
      const store = transaction.objectStore("conversations");
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async addMessageToConversation(conversationId, message) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["conversations"], "readwrite");
      const store = transaction.objectStore("conversations");

      const getRequest = store.get(conversationId);
      getRequest.onsuccess = () => {
        const conversation = getRequest.result;

        // Generate title from first user message if it's the first message
        if (conversation.messages.length === 0 && message.sender === "user") {
          conversation.title =
            message.content.substring(0, 30) +
            (message.content.length > 30 ? "..." : "");
        }

        conversation.messages.push(message);
        conversation.lastUpdated = new Date();

        const updateRequest = store.put(conversation);
        updateRequest.onsuccess = () => resolve(conversation);
        updateRequest.onerror = () => reject(updateRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }
}

// Initialize database
const authDB = new AuthDatabase();

export { authDB };
