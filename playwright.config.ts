import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: 'data-transfer.spec.ts',
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: 'http://127.0.0.1:4175',
    channel: process.env.PLAYWRIGHT_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined),
    viewport: { width: 1280, height: 900 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --port 4175 --strictPort',
    url: 'http://127.0.0.1:4175',
    reuseExistingServer: false,
    env: {
      VITE_FIREBASE_API_KEY: 'emulator-test-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'demo-transfer-tests.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'demo-transfer-tests',
      VITE_FIREBASE_APP_ID: 'emulator-test-app',
      VITE_FIRESTORE_EMULATOR_PORT: '8085',
    },
  },
});
