const mockAsyncStorage = {
  clear: jest.fn(async () => undefined),
  getAllKeys: jest.fn(async () => []),
  getItem: jest.fn(async () => null),
  key: jest.fn(async () => null),
  length: jest.fn(async () => 0),
  multiGet: jest.fn(async () => []),
  multiMerge: jest.fn(async () => undefined),
  multiRemove: jest.fn(async () => undefined),
  multiSet: jest.fn(async () => undefined),
  removeItem: jest.fn(async () => undefined),
  setItem: jest.fn(async () => undefined),
};

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));