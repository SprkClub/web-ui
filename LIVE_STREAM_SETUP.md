# Live Streaming Module Setup Guide

This guide explains how to set up the live streaming module using Agora SDK in the Sprkclub.fun application.

## Features

- ✅ Real-time video/audio streaming with Agora SDK
- ✅ Screen sharing capability
- ✅ Video filters and effects
- ✅ Live chat integration
- ✅ Trading interface during streams
- ✅ Viewer count tracking
- ✅ Mute/unmute audio and video controls

## Prerequisites

1. **Agora Account**: Sign up at [Agora.io](https://www.agora.io/)
2. **Agora Project**: Create a new project in Agora Console
3. **App ID & Certificate**: Get your App ID and App Certificate from Agora Console

## Installation

The Agora SDK is already added to `package.json`. Install dependencies:

```bash
npm install
```

For production, also install the Agora token generator:

```bash
npm install agora-access-token
```

## Environment Variables

Add the following to your `.env.local` file:

```env
# Agora Configuration
AGORA_APP_ID=your_agora_app_id_here
AGORA_APP_CERTIFICATE=your_agora_app_certificate_here
```

**Important**: Never commit your App Certificate to version control.

## Architecture

### Components

1. **GoLiveBroadcaster** (`src/components/GoLiveBroadcaster.jsx`)
   - Handles stream creation and broadcasting
   - Manages video/audio tracks
   - Controls for mute, video toggle, screen sharing
   - Video filters

2. **LiveStreamPlayer** (`src/components/LiveStreamPlayer.jsx`)
   - Displays live streams for viewers
   - Handles subscription to stream channels
   - Viewer count tracking

3. **Individual Stream Page** (`src/app/live/[channelName]/page.jsx`)
   - Full stream view with player
   - Live chat sidebar
   - Trading interface
   - Stream metadata

### API Routes

1. **Token Generation** (`src/app/api/live/token/route.js`)
   - Generates Agora RTC tokens for channel access
   - Supports publisher (broadcaster) and subscriber (viewer) roles
   - Token expires in 24 hours

## Usage

### For Creators (Broadcasting)

1. Navigate to `/live`
2. Scroll to "Start Your Own Stream" section
3. Enter stream title
4. Select video filter (optional)
5. Click "Go Live"
6. Grant camera/microphone permissions
7. Stream starts automatically

**Controls Available:**
- **Mute/Unmute**: Toggle audio
- **Video On/Off**: Toggle camera
- **Screen Share**: Share your screen instead of camera
- **End Stream**: Stop broadcasting

### For Viewers

1. Navigate to `/live`
2. Browse available live streams
3. Click on any stream card
4. Stream opens in full page with chat and trading
5. Use chat to interact (requires login)

## Development Mode

If Agora credentials are not configured, the system uses mock tokens for development. This allows you to test the UI and flow without a full Agora setup.

**Note**: Real video streaming requires valid Agora credentials.

## Production Setup

### 1. Install Agora Token Package

```bash
npm install agora-access-token
```

### 2. Update Token API Route

Update `src/app/api/live/token/route.js` to use the official token builder:

```javascript
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

// Replace buildTokenWithUid function with:
const token = RtcTokenBuilder.buildTokenWithUid(
  AGORA_APP_ID,
  AGORA_APP_CERTIFICATE,
  channelName,
  parseInt(uid) || 0,
  role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER,
  expirationTimeInSeconds
);
```

### 3. Configure Agora

1. Log in to [Agora Console](https://console.agora.io/)
2. Create a project or select existing one
3. Copy App ID and generate App Certificate
4. Add to environment variables
5. Enable video broadcasting in project settings

## Channel Naming

Channels are automatically named using the format:
```
stream_{username}_{timestamp}_{random}
```

Example: `stream_johndoe_1234567890_abc123`

## Permissions

The app requests the following browser permissions:
- **Camera**: For video streaming
- **Microphone**: For audio streaming
- **Screen**: For screen sharing (when requested)

## Browser Support

Agora SDK supports:
- Chrome 65+
- Firefox 60+
- Safari 11+
- Edge 79+

Mobile browsers have limited support. For best experience, use desktop browsers.

## Troubleshooting

### Stream Not Starting

1. Check camera/microphone permissions
2. Verify Agora credentials are correct
3. Check browser console for errors
4. Ensure HTTPS in production (required for camera/mic access)

### Can't See Stream

1. Verify channel name is correct
2. Check token generation endpoint
3. Ensure viewer has valid token
4. Check network connectivity

### Screen Share Not Working

1. Verify browser supports screen sharing
2. Check user granted screen share permission
3. Ensure not in incognito/private mode

## Security Considerations

1. **Token Generation**: Always generate tokens server-side
2. **Channel Names**: Validate and sanitize channel names
3. **User Authentication**: Verify users before allowing streams
4. **Rate Limiting**: Implement rate limiting on token endpoint
5. **HTTPS**: Use HTTPS in production for secure media access

## Future Enhancements

- [ ] Recording streams
- [ ] Clips and highlights
- [ ] Advanced video filters
- [ ] Multi-guest streams
- [ ] Stream scheduling
- [ ] Stream analytics
- [ ] Moderation tools
- [ ] Custom RTMP streaming

## API Reference

### Token Generation Endpoint

```
GET /api/live/token?channelName={channel}&role={publisher|subscriber}&uid={uid}
```

**Parameters:**
- `channelName` (required): Channel identifier
- `role` (optional): `publisher` or `subscriber` (default: `subscriber`)
- `uid` (optional): User ID (auto-generated if not provided)

**Response:**
```json
{
  "token": "agora_rtc_token",
  "appId": "your_app_id",
  "channelName": "stream_channel",
  "uid": "user_id"
}
```

## Support

For Agora-specific issues:
- [Agora Documentation](https://docs.agora.io/)
- [Agora Support](https://www.agora.io/en/contact-us/)

For application issues:
- Check application logs
- Review browser console errors
- Contact development team
