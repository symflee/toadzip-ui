import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);

const storedValues = new Map<string, string>();
const localStorageMock: Storage = {
  get length() {
    return storedValues.size;
  },
  clear: () => storedValues.clear(),
  getItem: (key) => storedValues.get(key) ?? null,
  key: (index) => [...storedValues.keys()][index] ?? null,
  removeItem: (key) => storedValues.delete(key),
  setItem: (key, value) => storedValues.set(key, String(value)),
};

Object.defineProperty(window, "localStorage", {
  configurable: true,
  value: localStorageMock,
});

Object.defineProperty(window, "requestAnimationFrame", {
  writable: true,
  value: (callback: FrameRequestCallback) => window.setTimeout(callback, 0),
});

Object.defineProperty(Element.prototype, "scrollIntoView", {
  writable: true,
  value: () => undefined,
});
