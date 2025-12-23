// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Polyfill fetch and related APIs for Firebase
global.fetch = jest.fn()
global.Request = jest.fn()
global.Response = jest.fn()
global.Headers = jest.fn()

// Mock localStorage with actual storage
const localStorageData = {}
const localStorageMock = {
  getItem: jest.fn((key) => localStorageData[key] || null),
  setItem: jest.fn((key, value) => { localStorageData[key] = value }),
  removeItem: jest.fn((key) => { delete localStorageData[key] }),
  clear: jest.fn(() => { Object.keys(localStorageData).forEach(key => delete localStorageData[key]) }),
  get length() { return Object.keys(localStorageData).length },
  key: jest.fn((index) => Object.keys(localStorageData)[index] || null),
}
global.localStorage = localStorageMock

// Mock sessionStorage with actual storage
const sessionStorageData = {}
const sessionStorageMock = {
  getItem: jest.fn((key) => sessionStorageData[key] || null),
  setItem: jest.fn((key, value) => { sessionStorageData[key] = value }),
  removeItem: jest.fn((key) => { delete sessionStorageData[key] }),
  clear: jest.fn(() => { Object.keys(sessionStorageData).forEach(key => delete sessionStorageData[key]) }),
  get length() { return Object.keys(sessionStorageData).length },
  key: jest.fn((index) => Object.keys(sessionStorageData)[index] || null),
}
global.sessionStorage = sessionStorageMock

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
}

// Suppress console errors during tests (optional)
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
}
