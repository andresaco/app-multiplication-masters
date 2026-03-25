# Gemini Project Context: Multiplication Masters

This document provides instructions and context for interacting with the "Multiplication Masters" project codebase.

## About the Project

"Multiplication Masters" is an interactive web application designed to help children aged 8-9 learn and master multiplication tables from 1 to 10.

### Key Features:

-   **Game Modes**: Sequential and Random modes for practicing multiplication tables.
-   **Voice Control**: Allows users to answer questions using their voice.
-   **Gamification**: Includes a medal system (Bronze, Silver, Gold, Diamond) and a trophy room to track progress.
-   **Statistics**: Provides detailed statistics with interactive charts to show speed and accuracy.
-   **PWA (Progressive Web App)**: The application can be installed on mobile devices for a full-screen, offline experience.
-   **Study Mode**: A mode for reviewing and printing multiplication tables.

## Technologies Used

-   **Framework**: React (with TypeScript)
-   **Build Tool**: Vite
-   **Styling**: Tailwind CSS
-   **AI**: Google Gemini (`@google/genai`) for potential generative AI features.
-   **Deployment**: GitHub Pages

## Development Setup

### Prerequisites

-   Node.js (v18 or higher recommended)
-   npm (included with Node.js)

### Installation

1.  **Install dependencies**:
    ```bash
    npm install
    ```

### Running the Application

-   **Development Mode**:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

-   **Production Build**:
    ```bash
    npm run build
    ```
    The production-ready files will be generated in the `dist/` directory.

-   **Preview Production Build**:
    ```bash
    npm run preview
    ```

### Linting

To check for TypeScript errors, run:

```bash
npm run lint
```

## Project Structure

-   `App.tsx`: The main application component.
-   `index.tsx`: The entry point of the React application.
-   `vite.config.ts`: Vite build configuration.
-   `package.json`: Project dependencies and scripts.
-   `public/`: Static assets and the `index.html` file.
-   `src/`: Main source code directory.
    -   `components/`: React components for different parts of the application (e.g., `Playing.tsx`, `Finished.tsx`, `Study.tsx`).
    -   `hooks/`: Custom React hooks, including `useGameLogic.ts` and `useVoiceRecognition.ts`.
-   `geminiService.ts`: Service for interacting with the Google Gemini API.
-   `feedbackService.ts`: Service for handling user feedback.

## AI Agent Instructions

-   **Code Style**: Follow the existing code style, which includes functional components with hooks, TypeScript for type safety, and Tailwind CSS for styling.
-   **State Management**: The application uses React's built-in state management (`useState`, `useReducer`, `useContext`).
-   **Voice Recognition**: The voice recognition feature is implemented in `useVoiceRecognition.ts`. It uses the browser's Web Speech API.
-   **Gemini Integration**: The `geminiService.ts` file is used for interacting with the Gemini API. Any new AI features should be added here.
