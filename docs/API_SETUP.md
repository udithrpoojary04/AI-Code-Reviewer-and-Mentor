# API Setup Guide

This guide explains how to set up the necessary API keys and database for the backend to function correctly.

## 1. Database Setup (PostgreSQL)

1. Install PostgreSQL on your local machine.
2. Create a database named `codementor_db`.
3. The application will automatically create the required tables on startup.
4. Update `application.yml` with your database credentials or set the environment variables:
   - `DB_USER`
   - `DB_PASSWORD`

## 2. Groq API (Code Review AI)

We use Groq's high-speed inference for Llama 3 to power our code review engine.

1. Create a free account at [console.groq.com](https://console.groq.com/).
2. Navigate to the **API Keys** section.
3. Click **Create API Key**.
4. Copy the key (it starts with `gsk_`).
5. Open `backend/src/main/resources/application.yml` and paste it into the `ai.groq.api-key` field, OR set the `GROQ_API_KEY` environment variable.

## 3. Gemini API (Fallback / Optional)

1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Click **Get API key**.
3. Generate a new key for your project.
4. Open `backend/src/main/resources/application.yml` and paste it into the `ai.gemini.api-key` field, OR set the `GEMINI_API_KEY` environment variable.

> **Note**: If your ISP blocks access to Google Gemini or Hugging Face, the application defaults to using Groq which is generally accessible globally.
