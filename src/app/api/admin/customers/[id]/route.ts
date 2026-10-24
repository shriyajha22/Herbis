import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { inMemoryStore, connectToDatabase } from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';
import { UserModel } from '@/models/User';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 1. Verify authenticated admin session
  const auth = verifyAdminToken(request);
  if (!auth.isAuthorized) {
    return auth.errorResponse!;
  }

  try {
    await connectToDatabase();

    const customerId = params?.id;
    if (!customerId || typeof customerId !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Valid customer ID is required.' },
        { status: 400 }
      );
    }

    const cleanId = customerId.trim();

    // 2. Find target customer in MongoDB UserModel or inMemoryStore
    let targetUser: any = null;

    // Check MongoDB first if valid ObjectId or query
    if (mongoose.Types.ObjectId.isValid(cleanId)) {
      targetUser = await UserModel.findById(cleanId).lean();
    }
    
    if (!targetUser) {
      targetUser = await UserModel.findOne({
        $or: [
          { _id: cleanId },
          { email: cleanId.toLowerCase() }
        ]
      }).lean();
    }

    // Check inMemoryStore fallback
    if (!targetUser) {
      targetUser = inMemoryStore.users.find(
        (u) => u._id === cleanId || u.email.toLowerCase() === cleanId.toLowerCase()
      );
    }

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'Customer account not found.' },
        { status: 404 }
      );
    }

    // 3. Security Check: Prevent deleting admin accounts
    if (targetUser.role === 'admin' || targetUser.email.toLowerCase() === 'contact.primebrew@gmail.com') {
      return NextResponse.json(
        { success: false, message: 'Security restriction: Administrator accounts cannot be deleted.' },
        { status: 403 }
      );
    }

    // 4. Perform MongoDB Deletion
    let deletedCount = 0;
    try {
      const dbResult = await UserModel.deleteOne({
        $or: [
          { _id: targetUser._id },
          { email: targetUser.email.toLowerCase() }
        ]
      });
      deletedCount = dbResult.deletedCount || 0;
    } catch (dbErr) {
      console.warn('MongoDB customer deletion warning:', dbErr);
    }

    // 5. Remove from inMemoryStore & active sessions
    inMemoryStore.deleteUser(targetUser._id);
    inMemoryStore.deleteUser(targetUser.email);
    inMemoryStore.setUserOffline(targetUser.email);

    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully.',
      deletedCustomer: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
      },
    });
  } catch (error: any) {
    console.error('Error deleting customer account:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error processing customer deletion.' },
      { status: 500 }
    );
  }
}
