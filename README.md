# AME AI Bot - Domestic Violence Support Chatbot

A confidential, AI-powered chatbot designed to provide 24/7 support for domestic violence survivors. Built with Next.js 15, TypeScript, and OpenAI GPT-4.

## Features

- **Confidential & Anonymous**: No login required, complete privacy protection
- **Color-Coded Severity System**: Visual indicators for message urgency (Low/Medium/High/Emergency)
- **Context Retention**: Optional conversation memory for better support
- **Voice Input/Output**: Speech-to-text and text-to-speech capabilities
- **Multi-language Support**: English and Hindi support
- **Emergency Escalation**: Immediate access to emergency resources
- **Resource Database**: Comprehensive directory of support services
- **Safety Planning**: Guidance for emergency situations

## Tech Stack

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB with Mongoose
- **AI**: OpenAI GPT-4 for intelligent responses
- **UI Components**: Custom components with Radix UI primitives
- **Styling**: Tailwind CSS with custom color scheme

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud instance)
- OpenAI API key

### Installation

1. **Clone and install dependencies**:
   ```bash
   cd "/Users/ravi/development/Ame AI Bot"
   npm install
   ```

2. **Environment Setup**:
   ```bash
   # Create .env.local file (already created)
   OPENAI_API_KEY=your_openai_api_key
   MONGODB_URI=mongodb://localhost:27017/ame-ai-bot
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Database Setup**:
   ```bash
   # Start MongoDB (if running locally)
   mongod
   
   # Seed initial resources
   npm run seed
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Access the Application**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Color Scheme

The application uses AME's brand colors:

- **Primary**: `#FDEBD0` (Warm cream)
- **Secondary/CTA**: `#DD4B4F` (Coral red)
- **Accent**: `#FFA36A` (Orange)
- **Background**: `#FDEBD0`
- **Text**: `#000000` (Black)

## Severity Levels

- **Low** (Yellow): General questions, information requests
- **Medium** (Orange): Concerns, stress, need for support
- **High** (Red): Fear, harassment, unsafe situations
- **Emergency** (Dark Red): Immediate danger, violence, crisis

## API Endpoints

### Chat API
- `POST /api/chat` - Send message and get AI response
- `GET /api/chat?sessionId=xxx` - Retrieve chat session

### Resources API
- `GET /api/resources` - Get support resources (with optional filters)
- `POST /api/resources` - Add new resource (admin only)

## Key Components

- **ChatInterface**: Main chat component with settings and controls
- **ChatMessage**: Individual message display with severity indicators
- **ChatInput**: Message input with voice support
- **EmergencyButton**: Emergency resources access
- **Resource System**: Database of support services and contacts

## Safety Features

1. **Emergency Detection**: AI automatically detects high-severity messages
2. **Emergency Button**: Always-visible access to emergency contacts
3. **Resource Recommendations**: Context-aware service suggestions
4. **Confidentiality**: No user data stored without explicit consent
5. **Anonymous Access**: No registration or login required

## Emergency Resources

The chatbot provides immediate access to:

- **Police**: 100
- **Women Helpline**: 181
- **Medical Emergency**: 108
- **Domestic Violence Hotline**: 1091
- **Child Helpline**: 1098

## Development

### Project Structure
```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── ui/            # Reusable UI components
│   ├── ChatInterface.tsx
│   ├── ChatMessage.tsx
│   ├── ChatInput.tsx
│   └── EmergencyButton.tsx
├── lib/               # Utility functions
│   ├── mongodb.ts     # Database connection
│   ├── openai.ts      # AI integration
│   ├── utils.ts       # Helper functions
│   └── seed-resources.ts
└── models/            # Database models
    ├── ChatSession.ts
    └── Resource.ts
```

### Adding New Resources

Use the seed script or API to add new support resources:

```bash
npm run seed
```

### Customizing AI Responses

Modify the system prompt in `src/lib/openai.ts` to adjust AI behavior and responses.

## Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy to Vercel/Netlify**:
   - Connect your GitHub repository
   - Set environment variables
   - Deploy automatically

3. **Database**: Use MongoDB Atlas for production database

## Contributing

This is a specialized application for domestic violence support. Please ensure any contributions maintain the safety, confidentiality, and supportive nature of the platform.

## Support

For technical support or questions about the AME AI Bot, please contact the development team.

---

**Note**: This application is designed for domestic violence survivors and maintains strict confidentiality. All interactions are anonymous and secure.