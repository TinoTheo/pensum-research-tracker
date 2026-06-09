import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createDefaultAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@pensum-tracker.com' },
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        name: 'System Administrator',
        email: 'admin@pensum-tracker.com',
        password: hashedPassword,
        role: 'ADMIN',
        department: 'IT',
        isActive: true,
      },
    });

    console.log('✅ Default admin user created successfully!');
    console.log('📧 Email: admin@pensum-tracker.com');
    console.log('🔑 Password: admin123');
    console.log('👤 User ID:', admin.id);
    console.log('');
    console.log('⚠️  Please change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultAdmin();
