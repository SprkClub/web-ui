# Super Admin Panel Documentation

## Overview

The Super Admin Panel provides comprehensive administrative controls for managing users, moderating posts, and monitoring platform activity.

## Access

The admin panel is accessible at `/admin` and requires:
1. User authentication (logged in)
2. Admin role verification (user must have `role: "admin"` in the database)

## Features

### 1. Dashboard
- **Statistics Overview**: View key platform metrics including:
  - Total Users
  - Total Posts
  - Pending Verifications
  - Pending Moderation
  - Active Users
  - Total Likes/Comments

### 2. User Management
- **View All Users**: Browse all registered users with pagination
- **User Details**: View complete user profiles including:
  - Username, Email, Wallet Address
  - Role (user/creator/admin)
  - Verification Status
  - Account Creation Date
  - Last Login
- **User Verification**: Manually verify user accounts
- **Role Management**: Update user roles (user/creator/admin)
- **User Actions**: View, update, or delete user accounts

### 3. Post Moderation
- **View All Posts**: Browse all posts with filtering options
- **Post Details**: View complete post information including:
  - Creator information
  - Post content and images
  - Engagement metrics (likes, comments, views)
  - Post status
- **Moderation Actions**:
  - **Approve**: Approve pending posts
  - **Reject**: Reject posts that violate guidelines
  - **Delete**: Permanently remove posts

### 4. Settings
- Platform configuration (coming soon)
- System settings (coming soon)

## API Routes

### Frontend API Routes (Next.js)
All admin routes are prefixed with `/api/admin/`:

- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/users` - Get all users (with pagination and filters)
- `GET /api/admin/users/:id` - Get single user
- `PATCH /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `POST /api/admin/users/:id/verify` - Verify user
- `GET /api/admin/posts` - Get all posts (with pagination and filters)
- `GET /api/admin/posts/:id` - Get single post
- `PATCH /api/admin/posts/:id` - Update post
- `DELETE /api/admin/posts/:id` - Delete post
- `POST /api/admin/posts/:id/moderate` - Moderate post (approve/reject/delete)

### Backend API Routes
The frontend routes proxy to the backend API. See `backend/ADMIN_API.md` for complete backend API documentation.

## Authentication & Authorization

### Admin Middleware
The admin panel uses `src/lib/adminMiddleware.js` to verify admin access:
- Checks JWT token from cookies
- For Twitter users: Verifies role in backend database
- For wallet users: Checks against admin wallet list in environment variables

### Environment Variables
Add admin wallet addresses to `.env`:
```
ADMIN_WALLETS=wallet1,wallet2,wallet3
```

For Twitter users, set `role: "admin"` in the database.

## Security Considerations

1. **Access Control**: All admin routes check for admin role before processing
2. **Token Validation**: JWT tokens are verified on every request
3. **Backend Verification**: Frontend routes proxy to backend which performs additional authorization checks
4. **Audit Trail**: Consider logging all admin actions for security auditing

## Usage

### Accessing the Admin Panel
1. Log in with an admin account
2. Navigate to `/admin`
3. If not an admin, you'll see an "Access Denied" message

### Verifying Users
1. Go to "Users" tab
2. Find the user you want to verify
3. Click "Verify" button next to unverified users

### Moderating Posts
1. Go to "Posts" tab
2. Review posts that need moderation
3. Use action buttons:
   - **Approve**: Makes post visible to all users
   - **Reject**: Hides post from public view
   - **Delete**: Permanently removes post

## Future Enhancements

- [ ] Advanced filtering and search
- [ ] Bulk actions (verify multiple users, moderate multiple posts)
- [ ] Activity logs and audit trail
- [ ] Analytics dashboard with charts
- [ ] Email notifications for admin actions
- [ ] Content flagging system
- [ ] Automated moderation rules
- [ ] User ban/suspend functionality
- [ ] Export data functionality

