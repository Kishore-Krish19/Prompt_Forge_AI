const memoryStore = new Map();

export const memoryStorage = {
  getItem: (key) => memoryStore.has(key) ? memoryStore.get(key) : null,
  setItem: (key, value) => memoryStore.set(key, value),
  removeItem: (key) => memoryStore.delete(key),
  clear: () => memoryStore.clear()
};
