# CodeMentor AI

CodeMentor AI is a full-stack platform built with Spring Boot and React that provides AI-powered code reviews, real-time collaboration, and interview preparation. 

## Features

- **AI Code Review**: Submit your code and receive line-by-line feedback, security vulnerabilities, and performance optimizations powered by Google Gemini and Groq AI.
- **Real-Time Collaboration**: Create live coding rooms where multiple users can write code together using the Monaco Editor and chat in real-time via WebSockets.
- **Modern UI**: A sleek, dark-themed interface built with Tailwind CSS, Framer Motion animations, and Chart.js analytics.
- **Secure Authentication**: JWT-based authentication powered by Spring Security.

## Tech Stack

**Frontend**:
- React 18 (Vite)
- Tailwind CSS
- Monaco Editor
- React Router DOM
- Framer Motion
- Chart.js

**Backend**:
- Java 21
- Spring Boot 3
- Spring Security (JWT)
- Spring Data JPA
- Spring WebSockets (STOMP)
- PostgreSQL

## Getting Started

To run the application locally, you'll need to set up the database and API keys.

1. **API Keys**: Please refer to [docs/API_SETUP.md](docs/API_SETUP.md) for detailed instructions on acquiring and configuring your free API keys for Groq and Gemini.

2. **Backend Setup**:
   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## License
MIT License
