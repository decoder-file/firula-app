Object.defineProperty(globalThis, "__ExpoImportMetaRegistry", {
  value: {},
  configurable: false,
  enumerable: false,
  writable: false,
});

Object.defineProperty(globalThis, "structuredClone", {
  value: (value) => JSON.parse(JSON.stringify(value)),
  configurable: false,
  enumerable: false,
  writable: false,
});