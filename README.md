# SlotSwapper - Peer-to-Peer Time-Slot Scheduling Application

A full-stack web application that allows users to manage their calendar events and swap time slots with other users in real-time.

## 🚀 Features

- **User Authentication**: Secure signup/login with JWT
- **Event Management**: Create, read, update, and delete calendar events
- **Slot Status Management**: Mark slots as BUSY, SWAPPABLE, or SWAP_PENDING
- **Marketplace**: Browse and filter available swappable slots from other users
- **Swap Requests**: Request swaps and manage incoming/outgoing requests
- **Real-time Notifications**: Socket.IO powered live notifications for swap activities
- **Responsive UI**: Modern, mobile-friendly interface built with React and Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- React
- Tailwind CSS
- Axios for API calls
- Socket.IO Client for real-time communication
- Context API for state management

### Backend
- Node.js with Express 
- MongoDB with Mongoose
- JWT for authentication
- Socket.IO for real-time features
- bcrypt for password hashing

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd slotswapper
```

### 2. Install dependencies

**Root directory (backend):**
```bash
npm install
```

**Client directory (frontend):**
```bash
cd client
npm install
cd ..
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
DB_URI=mongodb://localhost:27017/slotswapper
JWT_SECRET=your_super_secret_jwt_key_change_this
CLIENT_URL=http://localhost:5173
```

**For MongoDB Atlas:**
Replace `DB_URI` with your connection string:
```env
DB_URI=mongodb+srv://username:password@cluster.mongodb.net/slotswapper
```

### 4. Start the application

**Option 1: Development mode (both servers)**
```bash
# Terminal 1 - Backend server
npm run dev

# Terminal 2 - Frontend server  
cd client
npm run dev
```

**Option 2: Build and Run **
```bash
npm run build
npm run dev
```

**Option 3: Production build**
```bash
npm run build
npm start
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## 📁 Project Structure

```
slotswapper/
├── server/
│   ├── app.js                 # Express app configuration
│   ├── socket.js              # Socket.IO
│   ├── controllers/
│   │   ├── auth.js           # Authentication logic
│   │   ├── event.js          # Event CRUD operations
│   │   └── swap.js           # Swap request logic
│   ├── models/
│   │   ├── user.js           # User schema
│   │   ├── event.js          # Event schema
│   │   └── swapRequest.js    # SwapRequest schema
│   ├── middlewares/
│   │   └── auth.js           # JWT authentication middleware
│   └── routes/
│       ├── auth.js           # Auth routes
│       ├── event.js          # Event routes
│       └── swap.js           # Swap routes
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/         # Login & Signup
│   │   │   ├── Dashboard/    # Main dashboard components
│   │   │   ├── Navbar.jsx
│   │   │   └── NotificationPanel.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # Authentication state
│   │   │   └── SocketContext.jsx  # Socket.IO connection
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── .env
├── .gitignore
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Events (Protected)
- `POST /api/events` - Create new event
- `GET /api/events/my-events` - Get user's events
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `PATCH /api/events/:id/status` - Update event status

### Swap Requests (Protected)
- `GET /api/swap/swappable-slots` - Get all swappable slots (excluding own)
- `POST /api/swap/request` - Create swap request
- `POST /api/swap/response/:requestId` - Accept/reject swap request
- `GET /api/swap/my-requests` - Get incoming and outgoing requests

## 🔄 How the Swap Logic Works

1. **User A** marks their event as "SWAPPABLE"
2. **User B** sees User A's slot in the Marketplace
3. **User B** selects one of their own SWAPPABLE slots and requests a swap
4. Both slots are marked as "SWAP_PENDING"
5. **User A** receives a real-time notification
6. **User A** can Accept or Reject:
   - **Accept**: Slot owners are swapped, both slots become "BUSY"
   - **Reject**: Both slots return to "SWAPPABLE" status

## 🔐 Authentication Flow

1. User signs up with name, email, and password
2. Password is hashed using bcrypt
3. On login, JWT token is generated and sent to client
4. Client stores token in localStorage
5. Token is sent with all protected API requests as Bearer token
6. Socket.IO connection uses same token for authentication

## 📱 Real-time Features

Socket.IO events:
- `swap-request-received` - When someone requests to swap with you
- `swap-request-accepted` - When your swap request is accepted
- `swap-request-rejected` - When your swap request is rejected

## 🧪 Testing the Application

### Manual Testing Flow:

1. **Create two user accounts** (different browsers/incognito)
2. **User 1**: Create events and mark some as SWAPPABLE
3. **User 2**: Create events and mark some as SWAPPABLE
4. **User 2**: Go to Marketplace, see User 1's slots
5. **User 2**: Request a swap with one of User 1's slots
6. **User 1**: Check real-time notification and Swap Requests tab
7. **User 1**: Accept or reject the request
8. Verify both calendars update correctly

## 🚧 Known Limitations & Assumptions

- Events cannot be modified when SWAP_PENDING
- One slot can only be in one swap request at a time
- Swap is atomic - either both events swap owners or neither does
- No timezone handling (uses browser's local time)

---
