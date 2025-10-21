import dotenv from 'dotenv';
import connectDB from './mongodb';
import User from '@/models/User';

// Load environment variables
dotenv.config({ path: '.env.local' });

export async function createAdminUser() {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@ame.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return { success: true, message: 'Admin user already exists' };
    }

    // Create admin user
    const adminUser = new User({
      email: 'admin@ame.com',
      password: 'admin123', // Change this in production
      role: 'admin',
      isActive: true
    });

    await adminUser.save();

    console.log('Admin user created successfully');
    console.log('Email: admin@ame.com');
    console.log('Password: admin123');
    console.log('⚠️  Please change the password after first login!');

    return { 
      success: true, 
      message: 'Admin user created successfully',
      credentials: {
        email: 'admin@ame.com',
        password: 'admin123'
      }
    };

  } catch (error) {
    console.error('Error creating admin user:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Run if called directly
if (require.main === module) {
  createAdminUser().then(result => {
    console.log(result);
    process.exit(0);
  });
}
