import { NextResponse } from 'next/server';
import { inMemoryStore, connectToDatabase } from '@/lib/db';
import { UserModel } from '@/models/User';
import { Address } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Customer email is required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    let user: any = null;
    try {
      user = await UserModel.findOne({
        email: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
      }).lean();
    } catch (err) {}

    if (!user) {
      user = inMemoryStore.findUserByEmail(cleanEmail);
    }

    const addresses = user ? user.addresses || [] : [];

    return NextResponse.json({
      success: true,
      addresses,
    });
  } catch (error: any) {
    console.error('Error fetching user addresses:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { email, action, address, addresses: newAddressesArray, index } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Customer email is required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    let user: any = null;
    try {
      user = await UserModel.findOne({
        email: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
      });
    } catch (err) {}

    let memoryUser = inMemoryStore.findUserByEmail(cleanEmail);

    let currentAddresses: Address[] = user?.addresses
      ? [...user.addresses]
      : memoryUser?.addresses
      ? [...memoryUser.addresses]
      : [];

    if (action === 'sync' && Array.isArray(newAddressesArray)) {
      currentAddresses = newAddressesArray;
    } else if (action === 'add' && address) {
      const isFirst = currentAddresses.length === 0;
      const newAddress: Address = {
        fullName: address.fullName?.trim() || '',
        phone: address.phone?.trim() || '',
        email: address.email?.trim() || cleanEmail,
        street: address.street?.trim() || '',
        city: address.city?.trim() || '',
        state: address.state?.trim() || '',
        pincode: address.pincode?.trim() || '',
        isDefault: isFirst || Boolean(address.isDefault),
      };

      if (newAddress.isDefault) {
        currentAddresses = currentAddresses.map((a) => ({ ...a, isDefault: false }));
      }
      currentAddresses.unshift(newAddress);
    } else if (action === 'edit' && address && typeof index === 'number' && index >= 0 && index < currentAddresses.length) {
      const updatedAddress: Address = {
        fullName: address.fullName?.trim() || currentAddresses[index].fullName,
        phone: address.phone?.trim() || currentAddresses[index].phone,
        email: address.email?.trim() || currentAddresses[index].email,
        street: address.street?.trim() || currentAddresses[index].street,
        city: address.city?.trim() || currentAddresses[index].city,
        state: address.state?.trim() || currentAddresses[index].state,
        pincode: address.pincode?.trim() || currentAddresses[index].pincode,
        isDefault: Boolean(address.isDefault),
      };

      if (updatedAddress.isDefault) {
        currentAddresses = currentAddresses.map((a) => ({ ...a, isDefault: false }));
      }
      currentAddresses[index] = updatedAddress;

      // Ensure at least one default address exists
      if (!currentAddresses.some((a) => a.isDefault) && currentAddresses.length > 0) {
        currentAddresses[0].isDefault = true;
      }
    } else if (action === 'delete' && typeof index === 'number' && index >= 0 && index < currentAddresses.length) {
      const wasDefault = currentAddresses[index].isDefault;
      currentAddresses.splice(index, 1);
      if (wasDefault && currentAddresses.length > 0) {
        currentAddresses[0].isDefault = true;
      }
    } else if (action === 'setDefault' && typeof index === 'number' && index >= 0 && index < currentAddresses.length) {
      currentAddresses = currentAddresses.map((a, i) => ({
        ...a,
        isDefault: i === index,
      }));
    }

    // Save to MongoDB if UserModel exists
    if (user) {
      user.addresses = currentAddresses;
      await user.save();
    }

    // Save to inMemoryStore
    if (memoryUser) {
      memoryUser.addresses = currentAddresses;
    }

    return NextResponse.json({
      success: true,
      message: 'Delivery addresses updated successfully.',
      addresses: currentAddresses,
    });
  } catch (error: any) {
    console.error('Error updating user addresses:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error updating addresses' },
      { status: 500 }
    );
  }
}
