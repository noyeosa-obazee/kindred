// auth.js
class AuthDatabase {
  constructor() {
    this.db = null;
    this.dbName = "RelationshipChatDB";
    this.dbVersion = 3; // Increment version to trigger upgrade
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        console.log("Database initialized successfully");
        console.log("Object stores:", Array.from(this.db.objectStoreNames));
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        console.log(
          "Database upgrade needed from version",
          event.oldVersion,
          "to",
          event.newVersion
        );
        const db = event.target.result;
        const oldVersion = event.oldVersion || 0;

        // Create users store if it doesn't exist
        if (!db.objectStoreNames.contains("users")) {
          console.log("Creating 'users' store");
          const usersStore = db.createObjectStore("users", {
            keyPath: "id",
            autoIncrement: true,
          });
          usersStore.createIndex("username", "username", { unique: true });
          usersStore.createIndex("name", "name", { unique: false });
          usersStore.createIndex("displayName", "displayName", {
            unique: false,
          });
          usersStore.createIndex("createdAt", "createdAt", { unique: false });
        }

        // Create conversations store if it doesn't exist
        if (!db.objectStoreNames.contains("conversations")) {
          console.log("Creating 'conversations' store");
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

        // If upgrading from old version, ensure all indexes exist
        if (oldVersion > 0) {
          const transaction = event.target.transaction;

          // Ensure users store has username index
          if (db.objectStoreNames.contains("users")) {
            const usersStore = transaction.objectStore("users");
            if (!usersStore.indexNames.contains("username")) {
              console.log("Adding 'username' index to users store");
              usersStore.createIndex("username", "username", { unique: true });
            }
          }

          // Ensure conversations store has all indexes
          if (db.objectStoreNames.contains("conversations")) {
            const convosStore = transaction.objectStore("conversations");
            const neededIndexes = [
              "userId",
              "createdAt",
              "lastUpdated",
              "title",
              "pinned",
            ];

            neededIndexes.forEach((indexName) => {
              if (!convosStore.indexNames.contains(indexName)) {
                console.log(
                  `Adding '${indexName}' index to conversations store`
                );
                convosStore.createIndex(indexName, indexName, {
                  unique: false,
                });
              }
            });
          }
        }
      };

      request.onblocked = () => {
        console.warn(
          "Database upgrade blocked - close other tabs/windows using this database"
        );
        reject(
          new Error(
            "Database upgrade blocked. Please close other tabs/windows."
          )
        );
      };
    });
  }

  // ... rest of the methods remain the same ...

  // User methods
  //   async getUserByName(name) {
  //     return new Promise((resolve, reject) => {
  //       const transaction = this.db.transaction(["users"], "readonly");
  //       const store = transaction.objectStore("users");
  //       const index = store.index("name");
  //       const request = index.get(name);

  //       request.onsuccess = () => resolve(request.result);
  //       request.onerror = () => reject(request.error);
  //     });
  //   }

  async getUserByUsername(username) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["users"], "readonly");
      const store = transaction.objectStore("users");
      const index = store.index("username"); // Need to create this index
      const request = index.get(username.toLowerCase());

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async createUser(username, displayName) {
    // return new Promise((resolve, reject) => {
    //   const transaction = this.db.transaction(["users"], "readwrite");
    //   const store = transaction.objectStore("users");

    //   const user = {
    //     name: name.trim(),
    //     createdAt: new Date(),
    //     lastLogin: new Date(),
    //   };

    //   const request = store.add(user);

    //   request.onsuccess = () => resolve({ id: request.result, ...user });
    //   request.onerror = () => reject(request.error);
    // });
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["users"], "readwrite");
      const store = transaction.objectStore("users");

      const user = {
        username: username.toLowerCase(),
        displayName: displayName.trim(),
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      const request = store.add(user);

      request.onsuccess = () => resolve({ id: request.result, ...user });
      request.onerror = () => reject(request.error);
    });
  }

  async updateUserDisplayName(userId, displayName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["users"], "readwrite");
      const store = transaction.objectStore("users");

      const getRequest = store.get(userId);
      getRequest.onsuccess = () => {
        const user = getRequest.result;
        user.displayName = displayName.trim();

        const updateRequest = store.put(user);
        updateRequest.onsuccess = () => resolve(user);
        updateRequest.onerror = () => reject(updateRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
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
