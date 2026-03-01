# 💬 ChatRoom - Premium Real-Time Chat & Video Calling

![Demo](demo.png)

A fully-featured, ultra-premium real-time chat application built with the **PERN stack** (PostgreSQL, Express, React, Node.js). It offers a sleek, dark-themed UI with seamless instant messaging, live typing indicators, and built-in Peer-to-Peer Audio/Video calling via WebRTC.

## ✨ Why This is Better?
- **All-in-One Communication:** Combines text chat, audio calls, and video calls in a single, fluid interface without needing external tools.
- **Premium Aesthetics:** Built with TailwindCSS v4 to provide a modern, high-contrast black & white dark theme with sophisticated purple and pink gradient accents.
- **Instant Real-Time Sync:** Powered by Socket.IO for zero-latency messaging, typing indicators, and WebRTC signaling across all users in a room.
- **Production-Ready Architecture:** Clean monorepo-style separation of concerns with full TypeScript coverage across client and server.
- **Type-Safe Database:** Prisma ORM ensures robust data modeling and migration safety with PostgreSQL.

## 🚀 Key Features
- **Real-Time Messaging:** Instant message delivery and live online user counts.
- **Audio & Video Calls:** WebRTC-powered P2P calling natively embedded into chat rooms.
- **User Authentication:** Secure JWT-based login and registration with bcrypt password hashing.
- **Typing Indicators:** See when others are typing in real-time.
- **Room Management:** Create, join, and seamlessly navigate between different chat rooms.
- **Responsive Design:** Works flawlessly across desktop screens with high-performance CSS animations.

## 💻 Tech Stack
**Frontend:**
- React 19 (TypeScript)
- Vite for lightning-fast bundling
- TailwindCSS 4 + SCSS for premium styling
- Socket.IO-Client for real-time events, Context API for state management

**Backend:**
- Node.js & Express (TypeScript)
- Socket.IO (WebSockets & WebRTC Signaling server)
- Prisma ORM
- PostgreSQL
- JWT Authentication & bcryptjs

## 🏁 Starting the Website

### Prerequisites
Make sure you have Node.js and npm installed. You also need a PostgreSQL database URL.

### 1. Clone the repository
```bash
git clone https://github.com/vkxr/chatroom.git
cd chatroom
```

### 2. Install Dependencies
Open two terminals, one for `client` and one for `server`.
```bash
# In terminal 1
cd client
npm install

# In terminal 2
cd server
npm install
```

### 3. Environment Variables
Create a `.env` file in the `server` directory and fill in your connection details:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
JWT_SECRET="your_super_secret_jwt_key"
CLIENT_URL="http://localhost:5173"
PORT=5000
```
*(Optionally setup a `.env` in `client` if you wish to override `VITE_API_URL`)*

### 4. Database Setup
In the `server` directory, push the Prisma schema to your PostgreSQL database:
```bash
cd server
npx prisma db push
```

### 5. Run the Application
Start the backend and frontend dev servers.
```bash
# Terminal 1: Start Backend (Port 5000)
cd server
npm run dev

# Terminal 2: Start Frontend (Port 5173)
cd client
npm run dev
```

Your app will be running at `http://localhost:5173`. Navigate there to register your first account, create a chatroom, and start chatting and video calling!

---
*Developed with a focus on high-performance Real-Time Web Architecture.*
