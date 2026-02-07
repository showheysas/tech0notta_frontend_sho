import '@testing-library/jest-dom'

// Load environment variables for testing
// Next.js automatically loads .env.local in the app, but we need to load it manually for tests
if (!process.env.NEXT_PUBLIC_API_URL) {
  process.env.NEXT_PUBLIC_API_URL = 'https://app-002-tech0notta-backend-dev.azurewebsites.net';
}
