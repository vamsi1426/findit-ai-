# FindIt AI - Project Documentation

## 1. Introduction

### 1.1 Overview of the Project

**FindIt AI** is an intelligent, web-based Lost and Found application designed to streamline the process of recovering lost items. Unlike traditional bulletin boards or simple listing sites, FindIt AI integrates advanced **Computer Vision** and **Natural Language Processing (NLP)** directly into the browser. It allows users to report lost or found items and uses an algorithm to calculate a "Match Compatibility Score" based on visual similarity, text description, location, and date. The system features a real-time AI Chat Assistant, WhatsApp/Email integration for communication, and a self-cleaning database to ensure relevance.

### 1.2 Objectives of the Project

- **Automate Matching**: To replace manual searching with an automated AI engine that compares images and text.
- **Reduce Recovery Time**: To provide instant match results with confidence scores (High/Medium/Low).
- **Enhance Privacy**: To process sensitive data (like image features) on the client-side (Edge AI) wherever possible.
- **Simplify Communication**: To enable one-click contact via WhatsApp or Email without exposing user details publicly.
- **Maintain Data Hygiene**: To implement an automatic expiration system that deletes reports older than 30 days.

### 1.3 The Need of the Project

In densely populated areas (campuses, cities, transit hubs), thousands of items are lost daily. Existing solutions are fragmented:

- Physical "Lost & Found" boxes are inefficient and localized.
- Social media posts are unorganized and difficult to search.
- Traditional websites rely solely on keyword matching (e.g., searching "Phone" fails to find "iPhone" if not explicitly labeled).
  **FindIt AI** addresses this by "seeing" the item (visual recognition) and understanding the context, creating a centralized, intelligent hub for recovery.

### 1.4 Overview of Existing System (Literature Study)

- **Manual Logbooks**: High human error, no search capability, physically restricted.
- **Social Media Groups**: High engagement but zero organization; posts get buried within hours; no privacy control.
- **Keyword-Based Databases**: Rely strictly on text. If a user describes a "Blue Bag" and another "Navy Backpack", simple databases fail to match them.
  **Gap Analysis**: None of the existing systems utilize **Multimodal AI** (Image + Text) in a consumer-friendly, serverless web application.

### 1.5 Scope of the Project

- **User Module**: Registration, Reporting Lost/Found items, Dashboard management ("My Reports").
- **AI Module**: Image embedding extraction (MobileNet), Fuzzy Text Search (Fuse.js), Match Scoring Algorithm.
- **Communication Module**: Secure redirection to WhatsApp/Email.
- **Administrative Scope**: The system is self-governing with auto-deletion policies; no manual admin approval is required for standard operations.

### 1.6 Deliverables

1.  **Web Application**: A fully responsive React.js PWA suitable for Desktop and Mobile.
2.  **AI Engine**: Integrated TensorFlow.js models for client-side processing.
3.  **Documentation**: Complete Source Code, Setup Guide, and System Architecture Record.

---

## 2. Feasibility Study

### 2.1 Economic Feasibility

- **Status**: Highly Feasible.
- **Justification**: The project is built on a **Serverless Architecture**.
  - **Frontend**: Hosted on low-cost/free tiers (Vercel/Netlify).
  - **Database**: Firebase (Free Spark Plan is sufficient for development).
  - **AI Models**: TensorFlow.js runs on the user's device (User's GPU/CPU), incurring **zero** server computation costs.
  - **Chat API**: Uses Groq's Free Tier.
  - **Cost**: Close to $0/month for maintenance.

### 2.2 Technical Feasibility

- **Status**: Feasible.
- **Stack**: React, Vite, Tailwind CSS, Firebase, TensorFlow.js.
- **Capability**: Modern browsers (Chrome, Edge, Safari) fully support WebGL/WASM required for the AI models. The chosen technologies are mature, well-documented, and widely supported.

### 2.3 Resource and Time Feasibility

- **Status**: Feasible.
- **Resources**: Requires standard development environment (VS Code, Node.js). No specialized hardware (like GPU servers) is needed since AI is client-side.
- **Time**: The modular nature (separating UI, AI logic, and Firebase service) allows for rapid development and testing cycles.

### 2.4 Social/Legal Feasibility

- **Status**: Feasible.
- **Social**: Promotes community goodwill and civic responsibility.
- **Legal/Privacy**:
  - **Data Minimization**: Reports auto-delete after 30 days.
  - **User Control**: Users share contact info (Phone/Email) voluntarily per report.
  - **Safe Communication**: Initial contact is proxied (via app buttons) avoiding public display of raw data where possible.

---

## 3. Analysis

### 3.1 Overall System Description

#### 3.1.1 System Perspective

FindIt AI acts as an intermediary intelligent agent. It sits between a "Loser" (person who lost an item) and a "Finder" (person who found one). It interacts efficiently with external services:

- **Firebase**: For persistent storage of item metadata.
- **Groq AI**: For the Chat Assistant.
- **EmailJS**: For sending notification emails.

#### 3.1.2 System Functions

1.  **Report Found Item**: Upload photo, auto-extract features, save to DB.
2.  **Report Lost Item**: Upload reference photo (optional), describe item.
3.  **Auto-Match**: Compare new report against all active records; generate match list.
4.  **Save Alert**: If no match found, save request to notify future finders.
5.  **Smart Chat**: AI Assistant answers "How-to" queries.
6.  **Auto-Cleanup**: Cron-like frontend job to remove expired data.

#### 3.1.3 User Classes and Characteristics

- **Guest**: Can view Landing page, About page.
- **Registered User**: Can report items, view matches, access "My Reports", and use contact features.
  - _Note_: Authentication is required to prevent spam and ensure accountability.

#### 3.1.4 Operating Environment

- **Client**: Any modern web browser (Windows, macOS, Android, iOS) with JavaScript enabled.
- **Network**: Requires an active internet connection for Firebase/API calls.

#### 3.1.5 Design and Implementation Constraints

- **Image Size**: Uploads compressed to prevent database bloat (handled by `imageUtils.js`).
- **Browser Compatibility**: Legacy browsers (IE11) not supported due to TensorFlow.js requirements.
- **API Rate Limits**: Groq Free Tier limits requests per minute (managed via concise prompts).

### 3.2 System Requirement Specification (SRS)

#### 3.2.1 Functional Requirements

- **FR-01**: System must allow Google and Email/Password Login.
- **FR-02**: System must accept image uploads (PNG/JPG) and convert them to 1024-dimension vectors.
- **FR-03**: Match algorithm must weigh Visuals (50%) higher than Text (30%).
- **FR-04**: System must provide a direct "Chat on WhatsApp" link for matches.
- **FR-05**: System must prohibit access to "My Reports" for unauthenticated users.

#### 3.2.2 External Interface Requirements

- **User Interface**: Clean, "Glassmorphism" design using Tailwind CSS.
- **Hardware Interface**: Camera access for capturing item photos (on mobile).
- **Software Interface**: REST APIs for Groq and EmailJS; WebSocket/HTTP for Firebase.

#### 3.2.3 Non-Functional Requirements

- **Performance**: Matching 100+ items should take < 2 seconds.
- **Reliability**: Core DB (Firebase) guarantees 99.9% uptime.
- **Usability**: "My Reports" must show clear "Days Left" indicators.

### 3.3 Design

#### 3.3.1 System Architecture

The system follows a **Client-Centric / Edge AI Architecture**:

1.  **Presentation Layer**: React.js Components (Pages, Navbar, Cards).
2.  **Logic Layer**: `matching.js` (Algorithm), `models.js` (TensorFlow), `AIChatAssistant.jsx`.
3.  **Data Layer**: Firebase Cloud Firestore (NoSQL JSON-like documents).

#### 3.3.2 High Level Design

- **Input**: Image + Text Description.
- **Process**:
  - Image -> MobileNet -> Vector Embedding.
  - Text -> Fuse.js -> Fuzzy Score.
  - Vectors + Scores -> Weighted Sum -> Match %.
- **Output**: Sorted List of Match Cards (Highest Confidence First).

#### 3.3.3 Low Level Design (Key Algorithms)

- **Vector Similarity**: Calculated using **Cosine Similarity** formula: `(A . B) / (||A|| * ||B||)`.
- **Feature Extraction**: Input Image (224x224px) -> CNN Layers -> Output Tensor (1x1024).
- **Age Calculation**: `CurrentDate - CreatedDate = DaysDiff`. If `DaysDiff > 30`, trigger `deleteDoc()`.
