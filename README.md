# Employee Task Assistant

A full-stack LLM-powered chat application that helps employees manage daily tasks through natural language conversations. The application features **per-employee memory management** using [mem0](https://mem0.ai), enabling personalized AI interactions that remember user preferences and context across sessions.

![Tech Stack](https://img.shields.io/badge/React-18.x-blue) ![Tech Stack](https://img.shields.io/badge/Node.js-Express-green) ![Tech Stack](https://img.shields.io/badge/OpenAI-GPT--4o--mini-orange) ![Tech Stack](https://img.shields.io/badge/mem0-Memory-purple)

## Features

### Core Functionality
- **Natural Language Task Management**: Interact with an AI assistant to manage daily work tasks
- **Persistent Memory**: Employee preferences and context are remembered across sessions using mem0
- **Smart Memory Classification**: Memories are automatically categorized (Food, Travel, Work, Leave, etc.)
- **Selective Memory Storage**: Only meaningful information is stored, avoiding noise from routine transactions

### Supported Tasks
| Task | Examples |
|------|----------|
| **Cab Booking** | "Book a cab for tomorrow 9am from home to office" |
| **Food Ordering** | "Order biryani and coffee to my desk" |
| **Expense Reports** | "Submit an expense of ₹500 for client lunch" |
| **Timesheet** | "Log 8 hours on Project Alpha for today" |
| **Leave Requests** | "Apply for casual leave next Friday" |

### Memory Categories
Memories are automatically classified into:
- 🍽️ **Food Preferences** - Dietary restrictions, favorite meals, allergies
- 🚗 **Travel Preferences** - Commute locations, pickup/drop preferences
- 💼 **Work Schedule** - Work hours, meeting patterns, project schedules
- 🏖️ **Leave/Time Off** - Vacation plans, leave patterns
- 💰 **Expense/Finance** - Spending habits, budget preferences
- 👤 **Personal Info** - Personal details, emergency contacts
- 💬 **Communication Style** - Notification and communication preferences
- ⚙️ **General Preferences** - Other preferences

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                          │
│  ┌─────────────┐  ┌─────────────────┐  ┌──────────────────┐     │
│  │   Login/    │  │  Chat Interface │  │ Memories Modal   │     │
│  │  Register   │  │  + Quick Actions│  │ + Category Filter│     │
│  └─────────────┘  └─────────────────┘  └──────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVER (Node.js/Express)                  │
│  ┌─────────────┐  ┌─────────────────┐  ┌──────────────────┐     │
│  │  Employee   │  │  Chat Routes    │  │  Memory Routes   │     │
│  │  Routes     │  │                 │  │                  │     │
│  └─────────────┘  └─────────────────┘  └──────────────────┘     │
│         │                  │                     │              │
│         ▼                  ▼                     ▼              │
│  ┌─────────────┐  ┌─────────────────┐  ┌──────────────────┐     │
│  │  SQLite DB  │  │  Chat Service   │  │  mem0 Service    │     │
│  │ (Employees) │  │  (OpenAI +      │  │  (Memory Store)  │     │
│  │             │  │   Functions)    │  │                  │     │
│  └─────────────┘  └─────────────────┘  └──────────────────┘     │
│                           │                     │               │
│                           ▼                     ▼               │
│                  ┌─────────────────┐  ┌──────────────────┐      │
│                  │  Mock Task      │  │  mem0 Platform   │      │
│                  │  Systems        │  │  (Cloud API)     │      │
│                  └─────────────────┘  └──────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │   OpenAI API    │
                     │   (GPT-4o-mini) │
                     └─────────────────┘
```

## Project Structure

```
chat-with-memory-ability/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── EmployeeLogin.jsx    # Login/Register component
│   │   │   ├── ChatInterface.jsx    # Main chat UI
│   │   │   └── MemoriesModal.jsx    # Memory viewer modal
│   │   ├── services/
│   │   │   └── api.js               # API client
│   │   ├── App.jsx
│   │   └── index.css                # Tailwind + custom styles
│   ├── .env
│   └── package.json
│
├── server/                     # Node.js backend
│   ├── src/
│   │   ├── db/
│   │   │   └── database.js          # SQLite setup & queries
│   │   ├── routes/
│   │   │   ├── employeeRoutes.js    # Employee CRUD
│   │   │   ├── chatRoutes.js        # Chat endpoints
│   │   │   └── memoryRoutes.js      # Memory endpoints
│   │   ├── services/
│   │   │   ├── chatService.js       # OpenAI + memory analysis
│   │   │   ├── mem0Service.js       # mem0 integration
│   │   │   └── mockTaskSystems.js   # Mock task handlers
│   │   └── index.js                 # Express server
│   ├── data/                        # SQLite database (auto-created)
│   ├── .env
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- mem0 API key ([Get one here](https://app.mem0.ai))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd llm-mem
   ```

2. **Set up the server**
   ```bash
   cd server
   npm install

   # Create .env file
   cp .env.example .env
   ```

   Edit `.env` with your API keys:
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key
   MEM0_API_KEY=your-mem0-api-key
   PORT=3001
   ```

3. **Set up the client**
   ```bash
   cd ../client
   npm install

   # Create .env file
   cp .env.example .env
   ```

   The default `.env` should work:
   ```env
   VITE_API_URL=http://localhost:3001
   ```

### Running the Application

1. **Start the server** (Terminal 1)
   ```bash
   cd server
   npm run dev
   ```
   Server runs at `http://localhost:3001`

2. **Start the client** (Terminal 2)
   ```bash
   cd client
   npm run dev
   ```
   Client runs at `http://localhost:5173`

3. **Open the app** in your browser at `http://localhost:5173`

## API Reference

### Employee Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/employee` | Register a new employee |
| `GET` | `/api/employee/:employeeId` | Get employee by ID (login) |
| `PUT` | `/api/employee/:employeeId` | Update employee details |
| `GET` | `/api/employee` | List all employees |

**Register Employee**
```bash
curl -X POST http://localhost:3001/api/employee \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMP001",
    "name": "John Doe",
    "email": "john@example.com",
    "department": "Engineering"
  }'
```

### Chat Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Send a chat message |
| `GET` | `/api/chat/history/:employeeId` | Get chat history |
| `POST` | `/api/chat/new-session` | Start a new chat session |

**Send Message**
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMP001",
    "message": "Book a cab for tomorrow 9am from Koramangala to office"
  }'
```

**Response**
```json
{
  "message": "I've booked a cab for you...",
  "sessionId": 1,
  "memorySaved": {
    "category": "travel_preferences"
  }
}
```

### Memory Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/memories/:employeeId` | Get all memories for employee |
| `POST` | `/api/memories/:employeeId/search` | Search memories |
| `DELETE` | `/api/memories/:employeeId/:memoryId` | Delete specific memory |
| `DELETE` | `/api/memories/:employeeId` | Delete all memories |

**Get Memories**
```bash
curl http://localhost:3001/api/memories/EMP001
```

**Search Memories**
```bash
curl -X POST http://localhost:3001/api/memories/EMP001/search \
  -H "Content-Type: application/json" \
  -d '{"query": "food preferences"}'
```

## How Memory Works

### Memory Flow
```
User Message → Chat Service → Memory Analysis → Store (if meaningful)
                    │                               │
                    ▼                               ▼
              OpenAI GPT-4o-mini              mem0 Platform
              (Response Generation)          (Memory Storage)
```

### Smart Memory Storage

The application uses a two-step process to determine what to remember:

1. **Relevance Check**: An LLM classifier determines if the message contains new, meaningful information worth storing
2. **Category Classification**: If relevant, the memory is categorized for better organization

**Stored** (examples):
- "I'm vegetarian and allergic to nuts" → `food_preferences`
- "My home is in Koramangala" → `travel_preferences`
- "I usually work from 10am to 7pm" → `work_schedule`

**Not Stored** (examples):
- "Order my usual breakfast" (uses existing memory)
- "What's my leave balance?" (query, no new info)
- "Yes, confirm the booking" (acknowledgment)

### Memory Retrieval

When processing a new message:
1. Relevant memories are searched using semantic search
2. Top 5 matching memories are included in the LLM context
3. The assistant uses these memories to personalize responses

## Mock Task Systems

The application includes mock implementations for testing without real integrations:

### Cab Booking
- Book cabs with pickup/drop locations and time
- Cancel bookings
- View booking history
- Auto-generates driver details and fare estimates

### Food Ordering
- Order from a predefined menu
- Specify delivery location
- Cancel orders
- View order history

### Expense Reports
- Submit expenses with category and amount
- Categories: Travel, Meals, Office Supplies, Client Entertainment, Training, Equipment
- Track pending approvals

### Timesheet
- Log hours against projects
- View weekly summary
- Track remaining hours (40-hour week)
- Available projects: Project Alpha, Project Beta, Internal, Training, Meetings

### Leave Management
- Request different leave types: Casual, Sick, Earned, Comp Off
- Check leave balance
- View leave history
- Cancel pending requests

## Configuration

### Environment Variables

**Server** (`/server/.env`)
| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o-mini | Yes |
| `MEM0_API_KEY` | mem0 Platform API key | Yes |
| `PORT` | Server port (default: 3001) | No |

**Client** (`/client/.env`)
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes |

### Customization

**Change LLM Model**

Edit `server/src/services/chatService.js`:
```javascript
const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini', // Change to 'gpt-4o', 'gpt-4-turbo', etc.
  ...
});
```

**Add New Task Systems**

1. Add mock implementation in `server/src/services/mockTaskSystems.js`
2. Add tool definition in `server/src/services/chatService.js` (tools array)
3. Add tool execution handler in the `executeTool` function

**Add New Memory Categories**

1. Update `MEMORY_CATEGORIES` in `server/src/services/chatService.js`
2. Update the classifier prompt in `analyzeForMemory` method
3. Update `CATEGORY_CONFIG` in both:
   - `client/src/components/ChatInterface.jsx`
   - `client/src/components/MemoriesModal.jsx`

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 | UI framework |
| Styling | Tailwind CSS | Utility-first CSS |
| Build Tool | Vite | Fast dev server & bundler |
| Backend | Node.js + Express | REST API server |
| Database | SQLite (better-sqlite3) | Employee & chat storage |
| LLM | OpenAI GPT-4o-mini | Response generation & classification |
| Memory | mem0 Platform | Persistent memory storage |

## Development

### Running in Development Mode

```bash
# Server (with auto-reload)
cd server && npm run dev

# Client (with HMR)
cd client && npm run dev
```

### Database

The SQLite database is automatically created at `server/data/employees.db` with the following tables:

- `employees` - Employee records
- `chat_sessions` - Chat session tracking
- `chat_messages` - Message history

To reset the database, delete the `server/data` folder and restart the server.

### Debugging

**Server Logs**
- Memory storage events: `Memory stored with category: <category>`
- Tool execution: `Executing tool: <tool_name>`

**Check mem0 Dashboard**
- Visit [app.mem0.ai](https://app.mem0.ai) to view stored memories directly

## Limitations

- Mock task systems (no real bookings/orders)
- Single-user sessions (no real authentication)
- SQLite for simplicity (not production-ready for scale)
- No real-time updates (polling-based chat)

## Future Enhancements

- [ ] Real authentication system (OAuth, JWT)
- [ ] WebSocket for real-time chat
- [ ] Integration with real task systems (Uber API, food delivery APIs)
- [ ] Multi-language support
- [ ] Voice input/output
- [ ] Mobile app (React Native)
- [ ] Admin dashboard for memory management
- [ ] Analytics and usage tracking

## License

MIT License - feel free to use this project for learning and development.

## Acknowledgments

- [mem0](https://mem0.ai) - For the memory layer platform
- [OpenAI](https://openai.com) - For the GPT models
- [Tailwind CSS](https://tailwindcss.com) - For the styling framework
