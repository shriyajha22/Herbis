import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { inMemoryStore, connectToDatabase } from '@/lib/db';
import { UserModel } from '@/models/User';
import { loginSchema } from '@/lib/validators';
import { checkAuthRateLimit, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'Contact.primebrew@gmail.com').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured');

// Ensure the admin user account exists in MongoDB Atlas with a valid bcrypt hash
async function ensureAdminInDatabase(cleanEmail: string) {
  if (mongoose.connection.readyState !== 1) return null;

  try {
    // 1. Look up existing admin account by normalized email or admin role
    let adminUser = await UserModel.findOne({
      $or: [
        { email: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        { role: 'admin' },
      ],
    });

    let passwordHash = ADMIN_PASSWORD_HASH;
    if (!passwordHash && ADMIN_PASSWORD) {
      passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    }

    if (!adminUser) {
      if (!passwordHash) {
        console.warn('⚠️ Admin account cannot be seeded: neither ADMIN_PASSWORD nor ADMIN_PASSWORD_HASH is set.');
        return null;
      }
      // Seed missing admin user record in MongoDB Atlas
      adminUser = await UserModel.create({
        _id: 'usr-admin',
        name: 'PrimeBrew Admin',
        email: cleanEmail,
        role: 'admin',
        addresses: [],
        wishlist: [],
        walletBalance: 1000,
        passwordHash,
      });
      console.log('✅ Admin user account seeded into MongoDB Atlas');
    } else {
      // Update normalized email if needed
      if (adminUser.email.toLowerCase() !== cleanEmail && cleanEmail === ADMIN_EMAIL) {
        adminUser.email = cleanEmail;
      }
      if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
      }

      // If ADMIN_PASSWORD env variable is configured, check if password in DB matches
      if (ADMIN_PASSWORD && adminUser.passwordHash) {
        const matchesEnv = await bcrypt.compare(ADMIN_PASSWORD, adminUser.passwordHash);
        if (!matchesEnv) {
          adminUser.passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
        }
      } else if (!adminUser.passwordHash && passwordHash) {
        adminUser.passwordHash = passwordHash;
      }

      if (adminUser.isModified()) {
        await adminUser.save();
      }
    }

    return adminUser;
  } catch (err) {
    console.error('Error ensuring admin user in database:', err);
    return null;
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = await checkAuthRateLimit(ip);
  if (!rateLimit.success) {
    return NextResponse.json(
      { success: false, message: rateLimit.message },
      { status: 429 }
    );
  }

  try {
    await connectToDatabase();

    const body = await request.json();
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.errors[0]?.message || 'Invalid email or password' },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;
    const cleanEmail = email.trim().toLowerCase();
    const isDbConnected = mongoose.connection.readyState === 1;

    // 1. Verify DB Connection status & ensure Admin Account exists in MongoDB Atlas
    let dbAdmin: any = null;
    if (isDbConnected) {
      dbAdmin = await ensureAdminInDatabase(cleanEmail);
    }

    // 2. Validate email match (case-insensitive & trimmed)
    let isAdminEmailMatch = cleanEmail === ADMIN_EMAIL;
    if (dbAdmin && dbAdmin.email.toLowerCase() === cleanEmail) {
      isAdminEmailMatch = true;
    }

    if (!isAdminEmailMatch && (!dbAdmin || dbAdmin.role !== 'admin')) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    let isPasswordValid = false;

    // 3. Verify submitted password against stored bcrypt hash in MongoDB Atlas
    if (dbAdmin && dbAdmin.passwordHash) {
      isPasswordValid = await bcrypt.compare(password, dbAdmin.passwordHash);
    }

    // 4. Verify against process.env.ADMIN_PASSWORD_HASH if configured
    if (!isPasswordValid && ADMIN_PASSWORD_HASH) {
      isPasswordValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    }

    // 5. Verify against process.env.ADMIN_PASSWORD if configured
    if (!isPasswordValid && ADMIN_PASSWORD && password === ADMIN_PASSWORD) {
      isPasswordValid = true;
      // Sync bcrypt hash to MongoDB Atlas for future logins
      if (dbAdmin) {
        dbAdmin.passwordHash = await bcrypt.hash(password, 10);
        await dbAdmin.save();
      }
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const adminUser = {
      _id: dbAdmin ? dbAdmin._id.toString() : 'usr-admin',
      name: dbAdmin ? dbAdmin.name : 'PrimeBrew Admin',
      email: dbAdmin ? dbAdmin.email : ADMIN_EMAIL,
      role: 'admin',
      addresses: dbAdmin ? dbAdmin.addresses || [] : [],
      wishlist: dbAdmin ? dbAdmin.wishlist || [] : [],
      walletBalance: dbAdmin ? dbAdmin.walletBalance || 1000 : 1000,
    };

    // Sign real signed JWT token for Admin
    const token = jwt.sign(
      { userId: adminUser._id, email: adminUser.email, role: 'admin', name: adminUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      success: true,
      message: 'Admin authentication successful',
      user: adminUser,
    });

    // Set HTTP-only admin session cookies
    response.cookies.set('pbh_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    response.cookies.set('pbh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Error during admin login:', error);
    return NextResponse.json(
      { success: false, message: 'Authentication server error' },
      { status: 500 }
    );
  }
}
