# AME AI Bot - Developer Documentation

## 🚀 Project Overview

The AME AI Bot is a confidential, intelligent AI-powered chatbox for AME, a non-profit organization supporting domestic violence survivors. It provides 24/7 support, immediate information, guidance, and connections to essential services while maintaining privacy and autonomy.

### Key Features
- **Confidential & Anonymous Access**: No personal identifying information required
- **Natural Language Understanding**: Processes free-text inputs
- **Predefined Support Categories**: Legal, medical, shelter, psychological, self-care, safety planning
- **Resource Recommendations**: Helplines, partner organizations, local services
- **Voice Input/Output**: Speech-to-text and text-to-speech capabilities
- **Multi-language Support**: English and Hindi
- **Admin Dashboard**: AI training, rule management, user management
- **Authentication System**: Role-based access control

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI components
- **Database**: MongoDB Atlas (Cloud)
- **Authentication**: JWT tokens, bcrypt password hashing
- **AI**: OpenAI API
- **Voice**: Web Speech API
- **Deployment**: Vercel

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard pages
│   │   ├── login/         # Admin login page
│   │   └── page.tsx       # Main admin dashboard
│   ├── api/               # API routes
│   │   ├── admin/         # Admin-specific APIs
│   │   ├── auth/          # Authentication APIs
│   │   ├── chat/          # Chat functionality
│   │   └── resources/     # Resource management
│   └── page.tsx           # Main chat interface
├── components/            # React components
│   ├── admin/             # Admin dashboard components
│   └── ui/                # Reusable UI components
├── contexts/              # React contexts
├── lib/                   # Utility libraries
├── models/                # MongoDB models
└── types/                 # TypeScript type definitions
```

## 🔧 Environment Setup

### Required Environment Variables

Create a `.env.local` file with the following variables:

```bash
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# OpenAI API Key
OPENAI_API_KEY=sk-proj-your-openai-api-key

# JWT Secret (Use a strong, random string)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ame-ai-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

4. **Create initial admin user**
   ```bash
   npm run create-admin
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🚨 Common Mistakes & Solutions

### 1. **Build Failures Due to Linter Errors**

**❌ Mistake**: Pushing code without fixing TypeScript/ESLint errors
**✅ Solution**: Always test builds locally before pushing

```bash
# Always run before pushing
npm run build
```

**Prevention**: 
- Use proper TypeScript types
- Fix ESLint warnings/errors
- Test builds in CI/CD pipeline

### 2. **Environment Variables Not Loading**

**❌ Mistake**: Not loading environment variables in scripts
**✅ Solution**: Always use dotenv for standalone scripts

```typescript
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
```

**Prevention**:
- Always load environment variables in scripts
- Use proper environment variable names
- Test scripts independently

### 3. **MongoDB Connection Issues**

**❌ Mistake**: Assuming local MongoDB when using MongoDB Atlas
**✅ Solution**: Always verify your MongoDB setup

```typescript
// Correct way to handle MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}
```

**Prevention**:
- Document your database setup clearly
- Use environment-specific configurations
- Test database connections

### 4. **TypeScript Type Errors**

**❌ Mistake**: Using `any` types and ignoring TypeScript errors
**✅ Solution**: Use proper types and assertions

```typescript
// Bad
const data: any = response.data;

// Good
interface ApiResponse {
  success: boolean;
  data: User[];
}
const data: ApiResponse = response.data;
```

**Prevention**:
- Define proper interfaces
- Use type assertions carefully
- Enable strict TypeScript checking

### 5. **Authentication Security Issues**

**❌ Mistake**: Hardcoding JWT secrets or using weak passwords
**✅ Solution**: Use strong, environment-based secrets

```typescript
// Bad
const JWT_SECRET = 'secret123';

// Good
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters');
}
```

**Prevention**:
- Use strong, random secrets
- Rotate secrets regularly
- Never commit secrets to version control

### 6. **API Route Parameter Handling**

**❌ Mistake**: Not handling Next.js 15 async params correctly
**✅ Solution**: Properly await params in API routes

```typescript
// Correct for Next.js 15
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Use id...
}
```

**Prevention**:
- Keep up with Next.js version changes
- Read migration guides
- Test API routes thoroughly

## 🔐 Security Best Practices

### Authentication
- Use strong JWT secrets (minimum 32 characters)
- Implement proper password hashing (bcrypt with salt rounds ≥ 12)
- Use HTTPS in production
- Implement token expiration
- Validate all inputs

### Database Security
- Use connection strings with proper authentication
- Implement proper user roles and permissions
- Use environment variables for sensitive data
- Regular security audits

### API Security
- Validate all request parameters
- Implement rate limiting
- Use proper CORS settings
- Sanitize user inputs

## 🚀 Deployment Checklist

### Before Deployment
- [ ] All environment variables configured
- [ ] Build passes without errors
- [ ] Database connection tested
- [ ] Authentication working
- [ ] Admin user created
- [ ] Security headers configured

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy and test all functionality
4. Monitor logs for errors

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration/login
- [ ] Chat functionality
- [ ] Admin dashboard access
- [ ] User management
- [ ] API endpoints
- [ ] Voice features
- [ ] Mobile responsiveness

### Automated Testing
```bash
# Run linting
npm run lint

# Run build test
npm run build

# Type checking
npx tsc --noEmit
```

## 📊 Monitoring & Debugging

### Logging
- Use console.log for development
- Implement proper logging in production
- Monitor API response times
- Track user interactions

### Error Handling
- Implement try-catch blocks
- Provide meaningful error messages
- Log errors for debugging
- Handle network failures gracefully

## 🔄 Maintenance

### Regular Tasks
- Update dependencies
- Monitor security vulnerabilities
- Backup database
- Review and rotate secrets
- Performance optimization

### Code Quality
- Follow TypeScript best practices
- Use ESLint rules consistently
- Write meaningful commit messages
- Document complex logic
- Regular code reviews

## 📞 Support & Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs)

### Troubleshooting
1. Check environment variables
2. Verify database connection
3. Review console logs
4. Test API endpoints
5. Check network connectivity

## 🎯 Future Improvements

### Planned Features
- Advanced analytics dashboard
- Multi-language support expansion
- Mobile app development
- Advanced AI training capabilities
- Integration with external services

### Technical Debt
- Implement comprehensive testing
- Add performance monitoring
- Improve error handling
- Enhance security measures
- Optimize database queries

---

**Remember**: Always test locally before pushing, use proper environment variables, and follow security best practices!
