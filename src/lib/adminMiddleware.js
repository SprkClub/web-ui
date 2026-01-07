import { getCurrentUser } from './auth';
import { getCollection } from './mongodb';

// Admin usernames (Twitter handles without @)
const ADMIN_USERNAMES = ['iathulnambiar'];

export async function checkAdmin(request) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      console.log('Admin check: No user found in request');
      return { isAdmin: false, error: 'Not authenticated' };
    }

    console.log('Admin check for user:', {
      id: user._id?.toString(),
      twitterUsername: user.twitterUsername,
      isAdmin: user.isAdmin
    });

    // Check if user is admin by database flag OR by Twitter username
    const isAdminByUsername = user.twitterUsername &&
      ADMIN_USERNAMES.includes(user.twitterUsername.toLowerCase());

    // If admin by username but flag not set, update the database
    if (isAdminByUsername && !user.isAdmin) {
      console.log('Setting isAdmin flag for:', user.twitterUsername);
      try {
        const usersCol = await getCollection('users');
        await usersCol.updateOne(
          { _id: user._id },
          { $set: { isAdmin: true } }
        );
        user.isAdmin = true;
      } catch (updateError) {
        console.error('Error setting admin flag:', updateError);
      }
    }

    if (!user.isAdmin && !isAdminByUsername) {
      console.log('Admin check failed: not admin');
      return { isAdmin: false, error: 'Not authorized' };
    }

    return { isAdmin: true, user };
  } catch (error) {
    console.error('Admin check error:', error);
    return { isAdmin: false, error: 'Internal server error' };
  }
}

export async function requireAdmin(request) {
  const { isAdmin, user, error } = await checkAdmin(request);
  if (!isAdmin) throw new Error(error || 'Admin access required');
  return user;
}
