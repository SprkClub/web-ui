import jwt from 'jsonwebtoken';
import { findById, findByTwitterId, findByWallet } from './models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Get user from request (from cookie or header)
export async function getCurrentUser(request) {
  const token = request.cookies.get('auth-token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get fresh user data from DB
    let user = null;
    if (decoded.userId) {
      user = await findById(decoded.userId);
    } else if (decoded.type === 'twitter' && decoded.id) {
      user = await findByTwitterId(decoded.id);
    } else if (decoded.walletAddress) {
      user = await findByWallet(decoded.walletAddress);
    }

    return user;
  } catch (error) {
    return null;
  }
}

// Check if user is authenticated
export async function requireAuth(request) {
  const user = await getCurrentUser(request);
  if (!user) throw new Error('Not authenticated');
  if (user.isBanned) throw new Error('Account is banned');
  return user;
}

// Check if user is admin
export async function requireAdmin(request) {
  const user = await requireAuth(request);
  if (!user.isAdmin) throw new Error('Admin access required');
  return user;
}

// Check if user is creator
export async function requireCreator(request) {
  const user = await requireAuth(request);
  if (!user.isCreator || user.creatorStatus !== 'approved') {
    throw new Error('Creator access required');
  }
  return user;
}

// Admin usernames who can post
const ADMIN_USERNAMES = ['iathulnambiar'];

// Check if user can create posts (admin or approved creator)
export async function requirePostAccess(request) {
  const user = await requireAuth(request);
  const isAdminByUsername = user.twitterUsername &&
    ADMIN_USERNAMES.includes(user.twitterUsername.toLowerCase());

  // Must be admin OR approved creator
  const isApprovedCreator = user.isCreator && user.creatorStatus === 'approved';

  if (!user.isAdmin && !isAdminByUsername && !isApprovedCreator) {
    throw new Error('Only approved creators and admins can create posts');
  }
  return user;
}

// Generate JWT token
export function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      type: user.twitterId ? 'twitter' : 'wallet'
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Serialize user for response (remove sensitive fields)
export function serializeUser(user) {
  if (!user) return null;
  const { _id, twitterId, twitterUsername, twitterName, walletAddress, walletType,
    displayName, bio, profileImage, isAdmin, isCreator, creatorStatus,
    followers, following, createdAt } = user;

  return {
    id: _id.toString(),
    twitterId,
    twitterUsername,
    twitterName,
    walletAddress,
    walletType,
    displayName: displayName || twitterName,
    bio,
    profileImage,
    isAdmin,
    isCreator,
    creatorStatus,
    followersCount: followers?.length || 0,
    followingCount: following?.length || 0,
    createdAt
  };
}
