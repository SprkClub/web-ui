import { NextResponse } from 'next/server';
import { PrivyClient } from '@privy-io/server-auth';
import { getCollection } from '@/lib/mongodb';
import { generateToken, serializeUser } from '@/lib/auth';

const privyClient = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  process.env.PRIVY_APP_SECRET
);

// Admin usernames (lowercase)
const ADMIN_USERNAMES = ['iathulnambiar'];

// Track if we've tried to fix indexes
let indexFixAttempted = false;

export async function POST(request) {
  try {
    const { privyId, twitter, wallet, email } = await request.json();

    if (!privyId) {
      return NextResponse.json({ error: 'Missing Privy ID' }, { status: 400 });
    }

    const usersCol = await getCollection('users');
    const now = new Date();

    // One-time fix for legacy indexes that cause duplicate key errors
    if (!indexFixAttempted) {
      indexFixAttempted = true;
      const legacyIndexes = ['email_1', 'username_1'];
      for (const idx of legacyIndexes) {
        try {
          await usersCol.dropIndex(idx);
          console.log(`Dropped legacy ${idx} index`);
        } catch (e) {
          // Index doesn't exist or already dropped, ignore
        }
      }
    }

    // Check if user is admin by Twitter username
    const isAdminUser = twitter?.username &&
      ADMIN_USERNAMES.includes(twitter.username.toLowerCase());

    // Build update object
    const updateFields = {
      privyId,
      updatedAt: now,
    };

    if (twitter) {
      updateFields.twitterId = twitter.id;
      updateFields.twitterUsername = twitter.username;
      updateFields.twitterName = twitter.name;
      if (twitter.profileImage) {
        updateFields.profileImage = twitter.profileImage;
      }
    }

    if (wallet) {
      updateFields.walletAddress = wallet.address;
      updateFields.walletType = wallet.type;
    }

    if (email) {
      updateFields.email = email;
    }

    // Build query to find existing user
    const findQuery = {
      $or: [
        { privyId },
        ...(twitter?.id ? [{ twitterId: twitter.id }] : []),
        ...(wallet?.address ? [{ walletAddress: wallet.address }] : []),
      ],
    };

    // Always set isAdmin in updateFields (not in $setOnInsert to avoid conflict)
    updateFields.isAdmin = isAdminUser || false;

    // Use findOneAndUpdate with upsert for atomic operation
    const result = await usersCol.findOneAndUpdate(
      findQuery,
      {
        $set: updateFields,
        $setOnInsert: {
          isCreator: false,
          creatorStatus: null,
          followers: [],
          following: [],
          createdAt: now,
        },
      },
      {
        upsert: true,
        returnDocument: 'after',
      }
    );

    const user = result;

    // Generate JWT token
    const token = generateToken(user);

    const response = NextResponse.json({
      user: serializeUser(user),
      synced: true,
    });

    // Set auth cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Privy sync error:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
