<div align="center">

# ChatRoom
### Minimal Communication. Maximum Focus.

Real-time room-based chat with WebRTC audio & video calling — built in a strict **black & white** design system.

![License](https://img.shields.io/badge/license-MIT-white?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-white?style=flat-square&logo=typescript&logoColor=white&color=222)
![React](https://img.shields.io/badge/React-19-white?style=flat-square&logo=react&logoColor=white&color=222)
![Node](https://img.shields.io/badge/Node.js-22-white?style=flat-square&logo=node.js&logoColor=white&color=222)
![Prisma](https://img.shields.io/badge/Prisma-6-white?style=flat-square&logo=prisma&logoColor=white&color=222)

</div>

---

## 📸 Demo

![ChatRoom Demo — Landing, Chat, Video Call, Call Event Pills](./demo.webp)

> *Landing page → Login → Chat rooms → Real-time messages → Video call → In-chat call event pills*

---

## ✨ Features

- **Real-time messaging** — Socket.IO powered, per-room channels
- **Live typing indicators** — shows who's typing in real-time
- **Audio & video calls** — WebRTC peer-to-peer, no third-party service
- **In-chat call events** — "You started a video call · 3:04 PM" and "Video call ended · 20s" pills inline in chat
- **Screen sharing** — in video calls
- **Incoming call modal** — Accept / Decline without leaving the chat
- **Room search** — filter sidebar rooms in real-time
- **Create rooms** — modal with name + description
- **JWT Auth** — register, login, persistent sessions

---

## 🎨 Design System

Strict **black & white only**. Inspired by Excalidraw, Linear, and Notion dark mode.

| Token | Value | Usage |
|---|---|---|
| Primary bg | `#000000` | Page backgrounds |
| Secondary bg | `#0F0F0F` | Sidebar |
| Elevated | `#141414` | Modals, cards |
| Border | `#262626` | Inputs, buttons |
| Primary text | `#FFFFFF` | Headings, active |
| Secondary text | `#B3B3B3` | Body |
| Muted text | `#737373` | Timestamps, labels |

> No blue. No purple. No gradients. Contrast creates hierarchy.

---

## 🛠 Tech Stack

### Frontend
- React 19 + TypeScript
- Vite + Tailwind CSS v4
- Socket.IO Client
- WebRTC (`RTCPeerConnection`, `getUserMedia`, `getDisplayMedia`)

### Backend
- Node.js + Express + TypeScript
- Socket.IO
- Prisma ORM + PostgreSQL
- JWT + bcrypt

### Architecture
```
chat-room/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── context/
│   │   │   ├── AuthContext.tsx      # JWT auth state
│   │   │   ├── ChatContext.tsx      # Rooms, messages, call events
│   │   │   ├── SocketContext.tsx    # Socket.IO connection
│   │   │   ├── CallContext.tsx      # WebRTC peer connections
│   │   │   └── callEventBus.ts     # Cross-context call event bus
│   │   ├── components/
│   │   │   ├── Sidebar.tsx          # Room list + search + user footer
│   │   │   ├── ChatArea.tsx         # Message thread + call event pills
│   │   │   ├── MessageInput.tsx     # Pill input with send button
│   │   │   ├── CreateRoomModal.tsx  # Modal for new rooms
│   │   │   └── call/
│   │   │       ├── CallScreen.tsx       # Full-screen call overlay
│   │   │       ├── CallControls.tsx     # Mic/cam/screen/end buttons
│   │   │       ├── CallIncoming.tsx     # Incoming call modal
│   │   │       └── VideoTile.tsx        # Video stream tile
│   │   └── pages/
│   │       ├── Landing.tsx
│   │       ├── Login.tsx
│   │       ├── Register.tsx
│   │       └── Chat.tsx
└── server/                  # Express + Socket.IO backend
    ├── routes/
    │   ├── auth.ts          # /api/auth/register, /api/auth/login
    │   └── rooms.ts         # /api/rooms, /api/rooms/:id/join, /messages
    ├── socket/
    │   └── handler.ts       # Socket events: chat + WebRTC signaling + callLog
    ├── middleware/auth.ts   # JWT middleware
    └── prisma/
        └── schema.prisma    # User, Room, RoomMember, Message models
```

---

## 🚀 Run Locally

**Prerequisites**: Node.js 18+, npm

```bash
# Clone
git clone https://github.com/vkxr/chatroom.git
cd chatroom

# Install all workspaces
npm install

# Set up environment
cp server/.env.example server/.env
# Edit server/.env — set DATABASE_URL and JWT_SECRET
```

Create `server/.env`:
```env
DATABASE_URL=file:./dev.db   # SQLite for local dev
JWT_SECRET=your-secret-key-here
CLIENT_URL=http://localhost:5173
```

```bash
# Push database schema
npm run db:push

# Start backend (port 5000)
npm run dev:server

# Start frontend (port 5173) — in a new terminal
npm run dev:client
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🌐 Deploy

**Backend** → [Render.com](https://render.com) Web Service (supports WebSockets)  
**Database** → Render PostgreSQL  
**Frontend** → [Vercel](https://vercel.com)

See the detailed deploy steps:

| Step | Action |
|---|---|
| 1 | Push to GitHub |
| 2 | Render → New PostgreSQL → copy `DATABASE_URL` |
| 3 | Render → New Web Service → root: `server`, build: `npm install && npm run build`, start: `npm start` |
| 4 | Set env vars: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production` |
| 5 | Run once in Render Shell: `npx prisma migrate deploy` |
| 6 | Vercel → Import repo → root: `client`, set `VITE_API_URL=https://your-render.onrender.com` |

> WebRTC requires HTTPS — both Render and Vercel provide it ✅

---

## 📡 Socket.IO Events

| Event | Direction | Description |
|---|---|---|
| `joinRoom` / `leaveRoom` | client→server | Subscribe to room channel |
| `sendMessage` | client→server | Broadcast message to room |
| `newMessage` | server→client | Receive new message |
| `typing` / `stopTyping` | client→server | Typing indicator |
| `userTyping` / `userStopTyping` | server→client | Typing state |
| `callUser` | client→server | Initiate call to room |
| `incomingCall` | server→client | Incoming call notification |
| `acceptCall` / `declineCall` | client→server | Call response |
| `callSignal` | bidirectional | SDP offer/answer + ICE relay |
| `callEnded` | client→server | End call |
| `callLog` | bidirectional | In-chat call event pills |

---

## 📄 License

MIT
