// database.js
class AuthDatabase {
  constructor() {
    this.db = null;
    this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("RelationshipChatDB", 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

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
}

// Initialize database
const authDB = new AuthDatabase();

export { authDB };
