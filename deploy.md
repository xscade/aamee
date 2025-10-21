# AME AI Bot - Deployment Guide

## Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set up Environment Variables**:
   ```bash
   # Copy the .env.local file (already created)
   # Make sure your OpenAI API key is set
   ```

3. **Start MongoDB** (if using local instance):
   ```bash
   mongod
   ```

4. **Seed the Database**:
   ```bash
   npm run seed
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```

6. **Access the Application**:
   Open [http://localhost:3000](http://localhost:3000)

## Production Deployment

### Option 1: Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set environment variables in Vercel dashboard:
     - `OPENAI_API_KEY`: Your OpenAI API key
     - `MONGODB_URI`: Your MongoDB connection string
     - `NEXT_PUBLIC_APP_URL`: Your production URL

3. **Database Setup**:
   - Use MongoDB Atlas for production database
   - Update `MONGODB_URI` in environment variables
   - Run seeding script after deployment

### Option 2: Netlify

1. **Build the Project**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Drag and drop the `out` folder to Netlify
   - Or connect your GitHub repository
   - Set environment variables in Netlify dashboard

### Option 3: Docker

1. **Create Dockerfile**:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and Run**:
   ```bash
   docker build -t ame-ai-bot .
   docker run -p 3000:3000 ame-ai-bot
   ```

## Environment Variables

Required environment variables:

```env
OPENAI_API_KEY=your_openai_api_key_here
MONGODB_URI=mongodb://localhost:27017/ame-ai-bot
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production, use:
```env
OPENAI_API_KEY=your_openai_api_key_here
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ame-ai-bot
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Database Setup

### Local MongoDB
```bash
# Install MongoDB
brew install mongodb-community  # macOS
# or
sudo apt-get install mongodb    # Ubuntu

# Start MongoDB
mongod

# Seed database
npm run seed
```

### MongoDB Atlas (Cloud)
1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a new cluster
3. Get connection string
4. Update `MONGODB_URI` environment variable
5. Run seeding script

## Features Implemented

✅ **Core Features**:
- Confidential AI chatbot with no login required
- Color-coded severity system (Low/Medium/High/Emergency)
- Context retention with anonymity options
- Voice input/output functionality
- Multi-language support (English/Hindi)
- Emergency escalation and safety planning
- Resource database and referral system

✅ **Safety Features**:
- Emergency button with immediate access to helplines
- Safety planning guide with downloadable plan
- Severity detection and appropriate resource suggestions
- Confidential session management

✅ **Technical Features**:
- Next.js 15 with App Router
- TypeScript for type safety
- MongoDB with Mongoose for data persistence
- Tailwind CSS with custom AME color scheme
- OpenAI GPT-4 integration
- Responsive design for mobile and desktop

## Security Considerations

- All conversations are confidential and anonymous
- No user data is stored without explicit consent
- API keys are properly secured in environment variables
- Emergency resources are easily accessible
- Voice data is processed locally (browser-based)

## Support

For technical issues or questions:
1. Check the console for error messages
2. Verify environment variables are set correctly
3. Ensure MongoDB is running and accessible
4. Check OpenAI API key validity and quota

## License

This project is developed for AME (non-profit organization) for domestic violence support.
