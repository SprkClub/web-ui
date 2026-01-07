import { NextResponse } from 'next/server';
import { requireAuth, serializeUser } from '@/lib/auth';
import * as User from '@/lib/models/User';
import { uploadToCloudinary } from '@/lib/cloudinary';

// PATCH /api/users/profile - Update my profile
export async function PATCH(request) {
  try {
    const user = await requireAuth(request);

    const contentType = request.headers.get('content-type') || '';

    let bio, displayName, profileImage;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      bio = formData.get('bio');
      displayName = formData.get('displayName');
      const file = formData.get('profileImage');

      if (file && file.size > 0) {
        const result = await uploadToCloudinary(file, 'profiles');
        profileImage = result.secure_url;
      }
    } else {
      const body = await request.json();
      bio = body.bio;
      displayName = body.displayName;
      profileImage = body.profileImage;
    }

    const updated = await User.updateProfile(user._id.toString(), {
      bio,
      displayName,
      profileImage
    });

    return NextResponse.json({ user: serializeUser(updated) });
  } catch (error) {
    if (error.message === 'Not authenticated') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
