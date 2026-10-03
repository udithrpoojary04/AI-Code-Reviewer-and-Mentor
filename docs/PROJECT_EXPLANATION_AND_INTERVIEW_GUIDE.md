# CodeMentor AI: Comprehensive Architecture, Integration & Interview Master Guide

---

## 1. Executive Summary & Project Overview

**CodeMentor AI** is an enterprise-grade, full-stack developer intelligence platform engineered with **Spring Boot 3 (Java 21)** and **React 19 (Vite)**. The platform bridges the gap between static code analysis, AI-guided mentorship, and developer collaboration by delivering:

1. **Multi-Tier AI Code Reviews**:
   - **Snippet Analysis**: Instant line-by-line feedback, security vulnerability detection, and performance optimizations powered by **Groq Cloud (Llama 3.1 8B Instant)** for ultra-low latency.
   - **Full Project / Zip Upload Review**: Architectural-level inspection, design smell detection, and security auditing across multi-file archives powered by **Google Gemini 1.5 Pro**.
   - **GitHub Repository Analysis**: Direct integration with the GitHub REST API using Personal Access Tokens (PAT) to stream repository zipballs, extract code files in-memory, and perform comprehensive codebase audits.
2. **Real-Time Collaborative Coding**:
   - Live multiplayer code rooms powered by **Spring WebSockets with STOMP broker** and **SockJS**.
   - **Monaco Editor** integration synchronized across all connected participants with client-side echo cancellation.
   - Live chat with an interactive **`@AI` Mentor bot** that parses developer questions in real-time and broadcasts intelligent recommendations directly to the collaboration room.
3. **AI-Powered Technical Interview Simulator**:
   - Dynamic mock interview generator tailoring questions to programming language, skill level (Junior, Mid, Senior), and interview format (Multiple Choice or Coding / System Design).
   - Automated evaluation, scoring, and algorithmic explanations.
4. **Adaptive AI Skill Roadmaps**:
   - Dynamic generation of customized 5-milestone learning roadmaps based on historical code review scores and targeted developer tech stacks.
5. **Security & Administration**:
   - Stateless **JWT (JSON Web Token)** authentication, role-based access control (`ROLE_USER`, `ROLE_ADMIN`), BCrypt password hashing, and real-time administrative system telemetry.

---

## 2. Complete Technology Stack Breakdown

### Backend Stack
| Technology | Version | Purpose & Architectural Role |
| :--- | :--- | :--- |
| **Java** | 21 (LTS) | Modern language runtime leveraging Virtual Threads readiness, Pattern Matching, Records, and enhanced `java.net.http.HttpClient`. |
| **Spring Boot** | 3.2.4 | Enterprise backend foundation handling DI (Dependency Injection), IoC container, REST endpoints, and lifecycle management. |
| **Spring Security** | 6.x | Stateless security pipeline implementing custom `JwtAuthenticationFilter`, BCrypt hashing, and method-level security (`@PreAuthorize`). |
| **Spring Data JPA & Hibernate** | 6.x | ORM layer with entity auditing (`AuditingEntityListener`), dynamic queries, and PostgreSQL dialect mapping. |
| **PostgreSQL** | Latest | ACID-compliant relational persistence storing users, reviews, historical code snapshots, bookmarks, and notifications. |
| **Spring WebSocket & STOMP** | 3.2.4 | Full-duplex messaging layer using Simple In-Memory Broker (`/topic`) and application prefix routing (`/app`). |
| **JJWT (`jjwt-api`, `jjwt-impl`)** | 0.11.5 | Cryptographic creation and verification of HMAC-SHA256 signed JSON Web Tokens. |
| **MapStruct & Lombok** | 1.5.5 | Compile-time boilerplate reduction and high-performance, reflection-free DTO-to-Entity mapping. |
| **SpringDoc OpenAPI (Swagger)** | 2.5.0 | Automated OpenAPI 3 documentation available at `/swagger-ui.html`. |
| **Groq Cloud API** | REST | Powers sub-second LLM inference using Llama 3.1 8B Instant for snippet reviews and live collab `@AI` mentions. |
| **Google Gemini API** | v1beta | Large-context multimodal LLM for multi-file repository audits, interview question generation, and roadmap generation. |

### Frontend Stack
| Technology | Version | Purpose & Architectural Role |
| :--- | :--- | :--- |
| **React** | 19.2.7 | Declarative component UI library with modern hooks (`useContext`, `useState`, `useEffect`, `useRef`). |
| **Vite** | 8.1.1 | Next-generation ultra-fast frontend build tool and dev server. |
| **Tailwind CSS** | 4.3.3 | Utility-first styling framework configured for custom dark mode and glassmorphism. |
| **Monaco Editor** | 4.7.0 | In-browser VS Code editing engine powering the snippet review and real-time collaboration rooms. |
| **STOMP.js & SockJS Client** | 7.3.0 / 1.6.1 | Web-socket client library managing subscriptions, reconnect backoff, and bidirectional messaging. |
| **Axios** | 1.18.1 | HTTP client configured with dual instances: public `api` and authenticated `apiPrivate` with request/response interceptors. |
| **React Router DOM** | 7.18.1 | Client-side routing with nested routes and `ProtectedRoute` authentication guards. |
| **Framer Motion** | 12.42.2 | Fluid spring animations, page transitions (`AnimatePresence`), and stagger effects. |
| **Chart.js & React-Chartjs-2** | 4.5.1 / 5.3.1 | Data visualization engine rendering user performance radar and progress curves. |
| **TanStack React Query** | 5.101.2 | Async server state caching and mutation management. |
| **Lucide React & React Icons** | Latest | Scalable SVG iconography. |

---

## 3. System Architecture & Component Interactions

```
  +-----------------------------------------------------------------------------------+
  |                                  FRONTEND (React 19 + Vite)                       |
  |  +-------------------+  +--------------------+  +---------------+  +-----------+  |
  |  | Monaco Editor UI  |  | Collaboration Room |  | InterviewPrep |  | Dashboard |  |
  |  +---------+---------+  +---------+----------+  +-------+-------+  +-----+-----+  |
  +------------|----------------------|---------------------|----------------|--------+
               | HTTPS (Axios)        | STOMP/SockJS        | HTTPS          | HTTPS
               v                      v                     v                v
  +-----------------------------------------------------------------------------------+
  |                             BACKEND (Spring Boot 3.2.4)                           |
  |                                                                                   |
  |  [SecurityFilterChain] -> JwtAuthenticationFilter -> SecurityContextHolder        |
  |                                                                                   |
  |  +--------------------+  +----------------------+  +---------------------------+  |
  |  | REST Controllers   |  | WebSocket Broker     |  | AI Clients                |  |
  |  | - AuthController   |  | - SimpleBroker       |  | - GroqClient (Llama 3.1)  |  |
  |  | - ReviewController |  |   (/topic)           |  | - GeminiClient (Gemini Pro)|  |
  |  | - GitHubController |  | - App Destination    |  | - GitHubClient            |  |
  |  | - InterviewCtrl    |  |   (/app)             |  | - HuggingFaceClient       |  |
  |  | - RoadmapCtrl      |  +----------+-----------+  +-------------+-------------+  |
  |  +---------+----------+             |                            |                |
  +------------|------------------------|----------------------------|----------------+
               |                        |                            |
               v                        v                            v
  +-----------------------+   +-------------------+        +--------------------+
  |      PostgreSQL       |   | Connected Clients |        | External AI APIs   |
  | - users               |   | (Live Room Synced |        | - api.groq.com     |
  | - reviews             |   |  Code & Chat)     |        | - Google Gemini    |
  | - review_history      |   +-------------------+        | - api.github.com   |
  | - github_accounts     |                                +--------------------+
  | - bookmarks           |
  | - notifications       |
  +-----------------------+
```

---

## 4. Comprehensive API Reference & Specifications

### 4.1 Authentication & User Security (`/api/v1/auth`)

#### 1. Register New User
- **Endpoint**: `POST /api/v1/auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "username": "alex_dev",
    "email": "alex@codementor.ai",
    "password": "SecurePassword123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhbGV4QGNvZGVtZW50b3IuYWkiLCJpYXQiOjE...",
      "username": "alex_dev",
      "email": "alex@codementor.ai",
      "role": "USER"
    }
  }
  ```

#### 2. User Login
- **Endpoint**: `POST /api/v1/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "alex@codementor.ai",
    "password": "SecurePassword123!"
  }
  ```
- **Response (200 OK)**: Returns standard `AuthenticationResponse` with Bearer JWT token.

---

### 4.2 AI Code Review Engine (`/api/v1/reviews`)

#### 1. Analyze Code Snippet
- **Endpoint**: `POST /api/v1/reviews/analyze`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "title": "Payment Controller Review",
    "code": "public double calc(double a, double b) { return a / b; }",
    "language": "java"
  }
  ```
- **Internal Processing Flow**:
  1. Identifies authenticated user via `@AuthenticationPrincipal UserDetails`.
  2. Constructs an architect-level review prompt specifying categories: *Readability, Maintainability, Performance, Security, and Best Practices*.
  3. Dispatches prompt to `GroqClient` (Llama 3.1 8B Instant) for immediate execution.
  4. Saves `Review` and `ReviewHistory` entities to PostgreSQL.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Code review completed successfully",
    "data": {
      "id": "c3b3e412-850d-4b8c-b03a-c85244b79100",
      "title": "Payment Controller Review",
      "aiSummary": "### Summary...\n### Security Considerations:\nPotential division by zero...",
      "score": 85,
      "securityScore": 90,
      "performanceScore": 80,
      "createdAt": "2026-09-19T10:30:00"
    }
  }
  ```

#### 2. Get User Review History
- **Endpoint**: `GET /api/v1/reviews/history`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**: List of all previous reviews generated by the authenticated user ordered by `createdAt DESC`.

---

### 4.3 GitHub Integration (`/api/v1/github`)

#### 1. Connect GitHub Account
- **Endpoint**: `POST /api/v1/github/connect`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "accessToken": "ghp_xxxxxxxxxxxxxxxxxxxx",
    "githubUsername": "octocat"
  }
  ```
- **Action**: Persists encrypted PAT linked to the authenticated user ID.

#### 2. Get User Repositories
- **Endpoint**: `GET /api/v1/github/repos`
- **Headers**: `Authorization: Bearer <token>`
- **Processing**: Calls `https://api.github.com/user/repos?per_page=100&sort=updated` using the stored PAT.
- **Response (200 OK)**: Array of `GitHubRepoDTO` (name, full_name, description, default_branch, private, etc.).

#### 3. Analyze Full GitHub Repository
- **Endpoint**: `POST /api/v1/github/analyze`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "owner": "octocat",
    "repo": "hello-world",
    "branch": "main"
  }
  ```
- **Processing Flow**:
  1. Requests repository zipball stream from `https://api.github.com/repos/{owner}/{repo}/zipball/{branch}`.
  2. Automatic 302 redirect following enabled on `HttpClient`.
  3. `ZipUtils.extractCodeFiles(byte[])` reads ZIP stream in-memory.
  4. Filters out binaries, `.git`, `node_modules`, `target`, `dist`, `.idea`.
  5. Accumulates source files and forwards payload to `GeminiClient` (Google Gemini Pro) for architectural synthesis.
  6. Stores consolidated review report in database.

---

### 4.4 Project ZIP Upload (`/api/v1/projects`)

- **Endpoint**: `POST /api/v1/projects/upload`
- **Content-Type**: `multipart/form-data`
- **Headers**: `Authorization: Bearer <token>`
- **Payload**: `file` (ZIP archive binary).
- **Processing**: Streams uploaded archive directly to `ZipUtils` in-memory parser, extracts source code files, and dispatches to Gemini Pro for architectural review.

---

### 4.5 Real-Time WebSocket Collaboration (`/ws-collaboration`)

- **STOMP Protocol Handshake**: SockJS endpoint `/ws-collaboration`.
- **Client Outgoing Prefix**: `/app`.
- **Broker Subscription Prefix**: `/topic`.

#### Message Channels:
1. **Live Code Sync**:
   - **Send Destination**: `/app/collab/{roomId}/code`
   - **Payload**:
     ```json
     {
       "roomId": "room-uuid",
       "content": "function hello() { return 'world'; }",
       "language": "javascript",
       "senderId": "client-uuid"
     }
     ```
   - **Broadcast Channel**: `/topic/collab/{roomId}/code`
   - **Echo Cancellation**: The sender ignores messages where `message.senderId === client.uniqueId`.

2. **Live Room Chat & `@AI` Bot Trigger**:
   - **Send Destination**: `/app/collab/{roomId}/chat`
   - **Payload**:
     ```json
     {
       "roomId": "room-uuid",
       "senderName": "Sarah",
       "content": "@AI how can I optimize this SQL query?"
     }
     ```
   - **Broadcast Channel**: `/topic/collab/{roomId}/chat`
   - **Automatic AI Response**: When backend detects `@AI` in `content`, it queries `GroqClient`, formats an AI response message with `senderName: "AI Mentor"`, `isAiResponse: true`, and broadcasts back to all room participants.

---

### 4.6 Interview Simulator & Skill Roadmap

#### 1. Generate Mock Technical Interview
- **Endpoint**: `GET /api/interview/generate?language=Java&skillLevel=Senior&type=MCQ`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  [
    {
      "question": "What happens when an exception is thrown in a CompletableFuture supplyAsync pipeline without exceptionally()?",
      "options": [
        "The thread dies silently",
        "The CompletableFuture completes exceptionally and the error is deferred until join()/get()",
        "It triggers a JVM crash",
        "The task is automatically retried"
      ],
      "answer": "The CompletableFuture completes exceptionally and the error is deferred until join()/get()",
      "explanation": "Exceptions in asynchronous stages are encapsulated within the CompletableFuture object...",
      "type": "MCQ"
    }
  ]
  ```

#### 2. Generate Adaptive Skill Roadmap
- **Endpoint**: `GET /api/roadmap/generate?techStack=Spring+Boot+Microservices`
- **Headers**: `Authorization: Bearer <token>`
- **Processing**: Computes the developer's historical average code review score across past submissions in the database, injects the score into the Gemini prompt, and returns a tailored 5-stage milestone plan.

---

## 5. Frontend-Backend Integration Details

### 5.1 Dual-Axios Architecture & Security Interceptors
In `frontend/src/api/axios.js`, two Axios client instances are configured:
1. `api`: Unauthenticated instance for public routes (`/login`, `/register`).
2. `apiPrivate`: Authenticated instance bound with lifecycle interceptors:
   - **Request Interceptor**: Extracts the JWT token from browser `localStorage` and appends `Authorization: Bearer <token>` to HTTP headers.
   - **Response Interceptor**: Catches `401 Unauthorized` errors. If an expired token is encountered, it clears `localStorage` and redirects the user to `/login`.

### 5.2 State Management with React Context (`AuthContext.jsx`)
- Stores user credentials (`username`, `email`, `role`, `token`) in centralized React Context.
- Rehydrates user state from `localStorage` upon initial app mounting to prevent flicker or premature redirects.
- Provides `login`, `register`, and `logout` operations globally.

### 5.3 Route Protection via `ProtectedRoute.jsx`
- Wrap all protected paths (`/dashboard`, `/code-review`, `/github`, `/collab/:roomId`, `/interview`, `/roadmap`, `/admin`) inside `ProtectedRoute`.
- Checks `isAuthenticated` status from `AuthContext`.
- If unauthorized, redirects to `/login` while preserving route history.

---

## 6. High-Impact Interview Questions, Detailed Answers & Production Code

### Category A: Core Architecture & System Design

#### Q1: "Can you walk us through the high-level architecture of CodeMentor AI and justify your technology choices?"
**Answer:**
> "CodeMentor AI is designed as a decoupled, multi-tiered architecture with a Spring Boot 3 backend and a React 19 single-page application.
> 
> On the backend:
> - **Java 21 & Spring Boot 3.2**: Chosen for enterprise stability, high throughput, and modern language features.
> - **PostgreSQL**: Selected for ACID guarantees, relational integrity between Users, Reviews, and ReviewHistory, and JSON/auditing support.
> - **Multi-LLM Strategy**: Instead of relying on a single AI provider, we adopted a dual-model paradigm:
>   1. **Groq Cloud (Llama 3.1 8B Instant)** is utilized for single-file snippet reviews and real-time collaboration `@AI` responses due to its specialized LPU hardware delivering sub-500ms latency.
>   2. **Google Gemini 1.5 Pro** is used for entire GitHub repositories, uploaded ZIP projects, and skill roadmaps due to its expansive context window (1M+ tokens), enabling holistic architectural evaluation without arbitrary truncation.
> 
> On the frontend:
> - **React 19 with Vite** delivers lightning-fast HMR and small bundle footprints.
> - **Monaco Editor** provides a native VS Code experience in the browser.
> - **Spring WebSocket + STOMP** enables full-duplex, low-overhead collaboration."

---

#### Q2: "How does CodeMentor AI handle multi-file repository analysis without hitting token limits or high memory pressure?"
**Answer:**
> "When a developer submits a GitHub repository or uploads a `.zip` archive:
> 1. **In-Memory Streaming**: The backend uses `java.util.zip.ZipInputStream` to stream and decompress byte arrays in memory without writing temporary files to the disk subsystem, avoiding disk I/O bottlenecks and temporary file cleanup leaks.
> 2. **Heuristic File Filtering (`ZipUtils`)**: The stream filters out binaries, lock files, dependency directories (`node_modules`, `.git`, `target`, `build`, `dist`, `.idea`), and non-code assets. Only recognized programming extensions (`.java`, `.js`, `.ts`, `.py`, `.go`, `.sql`, etc.) are captured.
> 3. **Context Routing to Gemini Pro**: Once aggregated, the multi-file bundle is dispatched to Google Gemini Pro, whose massive context window handles the aggregated codebase seamlessly, generating an architectural-level evaluation rather than fragmented snippet reviews."

---

### Category B: Spring Security, JWT & Backend Engineering

#### Q3: "Explain the exact lifecycle of a request entering the Spring Boot application, from JWT validation to Controller execution."
**Answer:**
> "1. The incoming HTTP request hits the Tomcat servlet container and enters Spring Security's `SecurityFilterChain`.
> 2. It encounters our custom `JwtAuthenticationFilter` (extending `OncePerRequestFilter`), positioned before `UsernamePasswordAuthenticationFilter`.
> 3. The filter inspects the `Authorization` header. If missing or not starting with `Bearer `, the filter delegates down the chain.
> 4. If present, it extracts the raw JWT, invokes `JwtService.extractUsername()`, decoding the HMAC-SHA256 signature using the secret key.
> 5. If the token is valid and no authentication exists in `SecurityContextHolder`, it loads the `UserDetails` via `CustomUserDetailsService`.
> 6. It verifies that `jwtService.isTokenValid()` returns true (matching username and non-expired timestamp).
> 7. A `UsernamePasswordAuthenticationToken` is instantiated with the user's authorities (`ROLE_USER` or `ROLE_ADMIN`) and placed inside `SecurityContextHolder.getContext().setAuthentication(...)`.
> 8. The request proceeds to the `@RestController`, where `@AuthenticationPrincipal UserDetails` is readily accessible."

---

#### Q4: "How is real-time collaboration implemented, and how did you solve the concurrency and echo problems?"
**Answer:**
> "Real-time collaboration is built over **Spring WebSocket with STOMP**:
> - We registered SockJS endpoint `/ws-collaboration` with a simple broker configured for `/topic` and application prefix `/app`.
> - Clients join a room by subscribing to `/topic/collab/{roomId}/code` and `/topic/collab/{roomId}/chat`.
> 
> **Solving the Echo Problem**:
> In real-time editors, when Client A types, the change is sent to the server and broadcast to all subscribers. If Client A receives its own broadcast and re-sets the Monaco editor state, it creates cursor jumps, stutter, or infinite update loops. We solved this with **Client-Side Origin Tagging**:
> - Each frontend client generates a unique `clientId` via `useRef(uuidv4())`.
> - Every outgoing code update payload includes this `senderId`.
> - When the client receives a message from `/topic/collab/{roomId}/code`, it checks:
>   `if (message.senderId !== clientId.current) { setCode(message.content); }`
>   This completely eliminates echo loops while maintaining instant synchronization for other collaborators."

---

### Category C: Database, JPA & Data Modeling

#### Q5: "Why did you use UUID primary keys instead of auto-incrementing BigInts, and how does JPA Auditing work in this project?"
**Answer:**
> "1. **UUID Primary Keys**:
>    - Auto-incrementing IDs (`1, 2, 3...`) expose predictable numerical sequences, creating enumeration vulnerabilities (IDOR attacks where an attacker can guess other users' reviews by incrementing the URL parameter).
>    - UUIDs (`UUID.randomUUID()`) allow IDs to be safely generated and distributed across microservices or multiple database shards without primary key collision risks.
> 2. **JPA Auditing**:
>    - Entities are decorated with `@EntityListeners(AuditingEntityListener.class)`.
>    - Fields such as `createdAt` and `updatedAt` use `@CreatedDate` and `@LastModifiedDate`.
>    - Spring automatically populates these timestamps during `persist()` and `update()` cycles without manual setter calls."

---

## 7. Production Code Snippets (Ready to Write in Technical Interviews)

### Snippet 1: Spring Security JWT Authentication Filter
```java
package com.codementor.ai.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // 1. Validate header presence and Bearer prefix
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Extract raw token & subject (email)
        jwt = authHeader.substring(7);
        userEmail = jwtService.extractUsername(jwt);

        // 3. Authenticate if token has username and SecurityContext is currently empty
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // 4. Update Security Context
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}
```

---

### Snippet 2: Resilient Google Gemini AI Client with Mock Fallback
```java
package com.codementor.ai.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;

@Component
public class GeminiClient {

    @Value("${ai.gemini.url}")
    private String geminiUrl;

    @Value("${ai.gemini.api-key}")
    private String apiKey;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public GeminiClient() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public String generateContent(String prompt) {
        try {
            // Build Gemini standard JSON payload
            var payload = new GeminiDto.Request(
                    List.of(new GeminiDto.Content(
                            List.of(new GeminiDto.Part(prompt))
                    ))
            );

            String requestJson = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(geminiUrl + "?key=" + apiKey))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestJson))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                var responseDto = objectMapper.readValue(response.body(), GeminiDto.Response.class);
                if (responseDto.getCandidates() != null && !responseDto.getCandidates().isEmpty()) {
                    return responseDto.getCandidates().get(0).getContent().getParts().get(0).getText();
                }
            }
            return getFallbackResponse();
        } catch (Exception e) {
            System.err.println("Gemini API invocation failed: " + e.getMessage());
            return getFallbackResponse();
        }
    }

    private String getFallbackResponse() {
        return "### [Fallback Mode] Review Analysis Completed\n" +
               "- Code syntax conforms to standard naming conventions.\n" +
               "- Consider replacing raw types with generics.\n" +
               "- Wrap I/O streams in try-with-resources blocks.";
    }
}
```

---

### Snippet 3: Real-Time WebSocket Collaboration Controller with `@AI` Bot
```java
package com.codementor.ai.controller;

import com.codementor.ai.client.GroqClient;
import com.codementor.ai.dto.ChatMessage;
import com.codementor.ai.dto.CodeUpdateMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
public class CollaborationController {

    private final SimpMessagingTemplate messagingTemplate;
    private final GroqClient groqClient;

    @MessageMapping("/collab/{roomId}/code")
    public void handleCodeUpdate(@DestinationVariable String roomId, @Payload CodeUpdateMessage message) {
        // Broadcast incoming code change to all subscribed peers
        messagingTemplate.convertAndSend("/topic/collab/" + roomId + "/code", message);
    }

    @MessageMapping("/collab/{roomId}/chat")
    public void handleChatMessage(@DestinationVariable String roomId, @Payload ChatMessage message) {
        message.setTimestamp(LocalDateTime.now());
        message.setAiResponse(false);
        
        // 1. Broadcast user's chat message to room
        messagingTemplate.convertAndSend("/topic/collab/" + roomId + "/chat", message);

        // 2. Detect if user invoked the AI Mentor via @AI tag
        if (message.getContent() != null && message.getContent().contains("@AI")) {
            String prompt = String.format(
                "You are an expert AI Code Mentor inside a live collaborative coding room. " +
                "Developer %s asks: %s\nProvide a precise, constructive answer.",
                message.getSenderName(), message.getContent()
            );

            try {
                String aiReply = groqClient.generateContent(prompt);

                ChatMessage aiMessage = ChatMessage.builder()
                        .roomId(roomId)
                        .senderName("AI Mentor")
                        .content(aiReply)
                        .timestamp(LocalDateTime.now())
                        .isAiResponse(true)
                        .build();

                // 3. Broadcast AI response into the room
                messagingTemplate.convertAndSend("/topic/collab/" + roomId + "/chat", aiMessage);
            } catch (Exception ex) {
                System.err.println("Failed to generate AI chat response: " + ex.getMessage());
            }
        }
    }
}
```

---

### Snippet 4: Production Axios Interceptors with Automatic Bearer Injection & 401 Eviction
```javascript
import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/v1';

// Public instance for Auth (login, register)
export const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Authenticated instance for secured features
export const apiPrivate = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Request Interceptor: Attach JWT to every outgoing call
apiPrivate.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle token expiration and 401 eviction
apiPrivate.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            // Token expired or invalid: Clear state & force re-login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
```

---

### Snippet 5: Thread-Safe In-Memory Token Bucket Rate Limiter (For AI Endpoints)
```java
package com.codementor.ai.security;

import org.springframework.stereotype.Component;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Production Token Bucket Rate Limiter to protect AI endpoints from cost overruns and DDoS.
 */
@Component
public class TokenBucketRateLimiter {

    private final int MAX_CAPACITY = 10; // Max 10 requests allowed
    private final long REFILL_INTERVAL_MILLIS = 60_000; // 1 minute window
    
    private static class Bucket {
        AtomicInteger tokens = new AtomicInteger(10);
        AtomicLong lastRefillTimestamp = new AtomicLong(System.currentTimeMillis());
    }

    private final ConcurrentHashMap<String, Bucket> userBuckets = new ConcurrentHashMap<>();

    public boolean tryConsume(String userKey) {
        Bucket bucket = userBuckets.computeIfAbsent(userKey, k -> new Bucket());
        refill(bucket);

        while (true) {
            int currentTokens = bucket.tokens.get();
            if (currentTokens <= 0) {
                return false; // Rate limit exceeded
            }
            if (bucket.tokens.compareAndSet(currentTokens, currentTokens - 1)) {
                return true; // Token acquired
            }
        }
    }

    private void refill(Bucket bucket) {
        long now = System.currentTimeMillis();
        long lastRefill = bucket.lastRefillTimestamp.get();
        if (now - lastRefill > REFILL_INTERVAL_MILLIS) {
            if (bucket.lastRefillTimestamp.compareAndSet(lastRefill, now)) {
                bucket.tokens.set(MAX_CAPACITY);
            }
        }
    }
}
```

---

## 8. Summary of Project Strengths for Recruiters & Hiring Managers

1. **Full-Stack Proficiency**: Demonstrates mastery of both Spring Boot 3 enterprise backends and React 19 modern frontends.
2. **Real-World AI Engineering**: Goes far beyond trivial wrappers by utilizing multi-model routing (Groq for ultra-low latency, Gemini Pro for million-token multi-file repository evaluation).
3. **Complex Distributed Protocols**: Implements WebSockets over STOMP with SockJS fallback and handles tricky race conditions (echo prevention in live editors).
4. **Clean Code & Enterprise Patterns**: Layered architecture (Controller-Service-Repository), stateless JWT security filter chains, JPA Auditing, MapStruct, and in-memory ZIP processing.
