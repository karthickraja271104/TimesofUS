# Video Stream Display Fix Guide

## Overview

This document outlines the fixes applied to resolve video stream display issues in the WebRTC video call feature where:

- **Caller**: Could see own video but remote video was black
- **Receiver**: All videos were black (no local or remote video)

## Root Causes Identified

### 1. **Async/Timing Issues**

- Video elements were being referenced before the DOM was ready
- Streams were being attached without waiting for component mount

### 2. **CSS Rendering Problems**

- Remote video used `object-fit: contain` which could leave black borders
- Video elements weren't explicitly set to `display: block`

### 3. **Incomplete Stream Attachment**

- Receiver wasn't properly waiting for video ref before attaching stream
- `play()` method wasn't being called after srcObject assignment in all cases

### 4. **Missing Error Handling**

- Play errors were stopping execution instead of being handled gracefully

## Fixes Applied

### 1. Enhanced Incoming Call Handler (`peerRef.current.on('call')`)

**Changes:**

- Converted to async function for better flow control
- Added explicit `setCallActive(true)` immediately (UI appears instantly)
- Added `await new Promise(resolve => setTimeout(resolve, 0))` to ensure DOM is ready
- Used `async/await` instead of `.then()` chains for cleaner code
- Wrapped `play()` in proper try-catch to handle browser restrictions
- Added detailed console logging at each step

```javascript
peerRef.current.on('call', async (call) => {
  console.log('📞 Incoming call from:', call.peer);
  setRemotePeerId(call.peer);
  setCallActive(true);  // Show UI immediately

  try {
    const stream = await navigator.mediaDevices.getUserMedia({...});
    localStreamRef.current = stream;

    // Wait for DOM to be ready
    await new Promise(resolve => setTimeout(resolve, 0));

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      try {
        await localVideoRef.current.play();
      } catch (playErr) {
        console.error('⚠️  Play error (may be okay):', playErr.message);
      }
    }

    call.answer(stream);
    handleCall(call);  // Set up to receive remote stream
  } catch (error) {
    console.error('❌ Error:', error);
  }
});
```

### 2. Simplified `handleCall()` Function

**Changes:**

- Removed `onloadedmetadata` listener (unnecessary)
- Simplified stream attachment logic
- Better error messages for debugging
- Consistent play() error handling

```javascript
const handleCall = (call) => {
  call.on("stream", (remoteStream) => {
    console.log("✅ Got remote stream from peer");

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;

      try {
        remoteVideoRef.current.play();
      } catch (playErr) {
        console.error("⚠️  Play error (may be okay):", playErr.message);
      }
    }
  });

  // ... close and error handlers
};
```

### 3. Improved `initiateCall()` Function

**Changes:**

- Moved UI activation to before stream attachment (shows UI immediately)
- Added DOM readiness wait before setting refs
- Changed from `.play().catch()` to `async/await` try-catch
- Cleaner error handling and messaging

```javascript
const initiateCall = async (targetPeerId) => {
  const stream = await navigator.mediaDevices.getUserMedia({...});
  localStreamRef.current = stream;

  // Show UI immediately
  setCallActive(true);
  setRemotePeerId(targetPeerId);

  // Wait for DOM to render
  await new Promise(resolve => setTimeout(resolve, 0));

  if (localVideoRef.current) {
    localVideoRef.current.srcObject = stream;
    try {
      await localVideoRef.current.play();
    } catch (playErr) {
      console.error('⚠️  Play error (may be okay):', playErr.message);
    }
  }

  const call = peerRef.current.call(targetPeerId, stream);
  handleCall(call);
};
```

### 4. CSS Improvements (VideoCall.css)

**Changes Made:**

#### Remote Video Styling

```css
.remote-video {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Changed from 'contain' */
  background: #000;
  display: block;
}
```

#### Video Control Hiding

```css
.remote-video::-webkit-media-controls {
  display: none !important;
}

video::-moz-media-controls {
  display: none !important;
}
```

#### Local Video Styling

```css
.local-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
  background: #000;
  display: block;
}
```

**Why These Changes:**

- `object-fit: cover` ensures video fills entire container without letterboxing
- `display: block` ensures proper rendering (default for video elements)
- Hiding media controls prevents UI clutter in full-screen calls
- Background color ensures no flickering

## Key Technical Details

### MediaStream Lifecycle

1. **getUserMedia()**: Requests camera/mic permissions
2. **srcObject Assignment**: Connects stream to video element
3. **play()**: Starts playback (may fail in some browsers - handled gracefully)
4. **Remote Stream**: Arrives via PeerJS 'stream' event, attached to remoteVideoRef

### Browser Compatibility Notes

- **Chrome/Edge**: Always supports `play()` after srcObject assignment
- **Firefox**: May auto-play video even without calling `play()`
- **Safari**: May require user interaction to play video
- **Chrome (HTTPS only)**: Some autoplay restrictions may apply

### Why the Receiver Had Black Screens

The receiver needs to:

1. **Receive incoming call** → `peerRef.current.on('call')`
2. **Request its own camera/mic** → `getUserMedia()`
3. **Attach local stream to video** → `localVideoRef.current.srcObject = stream`
4. **Answer the call** → `call.answer(stream)`
5. **Wait for remote stream** → Listen on `call.on('stream')`
6. **Attach remote stream** → `remoteVideoRef.current.srcObject = remoteStream`

The fix ensures all these steps happen in the correct order with proper timing.

## Testing the Fix

### Test Scenario 1: Caller Sees Both Videos

1. Open app in Browser A (caller), get Peer ID
2. Open app in Browser B (receiver), get Peer ID
3. Caller clicks "Call Now" on Receiver's Peer ID
4. Check Console: You should see logs like:
   - "📞 Initiating call to peer: [ID]"
   - "✅ Got local stream"
   - "✅ Set local video element"
   - "✅ Call object created"
   - Eventually: "✅ Got remote stream from peer"
5. Caller should see: Own video in top-right corner + Partner's video filling main area

### Test Scenario 2: Receiver Sees Both Videos

1. When Caller initiates, Receiver should automatically see:
   - Incoming call UI (optional, depending on implementation)
   - Own video in top-right corner immediately
   - Partner's video (after connection establishes)
2. Receiver's console should show:
   - "📞 Incoming call from: [ID]"
   - "✅ Got local stream for incoming call"
   - "✅ Call answered with local stream"
   - "✅ Got remote stream from peer"

### Expected Console Output

```
📞 Initiating call to peer: abc123xyz789
   From peer: def456uvw012
🎬 Requesting camera/mic access...
✅ Got local stream: [stream-id]
   Tracks: 2
✅ Call UI activated
   Attaching local stream to video element...
✅ Local video playing
✅ Local video element ready
📞 Creating PeerJS call with ID: abc123xyz789
✅ Call object created, waiting for connection...
📞 handleCall: Setting up listeners for call: abc123xyz789
✅ Got remote stream from peer: abc123xyz789
   Stream ID: [remote-stream-id]
   Tracks: 2
   Attaching remote stream to video element...
✅ Remote video ref set
```

## Debugging Checklist

If videos still don't display:

1. **Check Browser Console**

   - Look for errors in the sequence above
   - Check for camera/mic permission denied
   - Look for "Could not connect to peer" errors

2. **Verify Video Elements**

   - Open DevTools → Elements tab
   - Find `<video>` tags
   - Right-click → Inspect
   - Check if `srcObject` is set (should show MediaStream)
   - Check CSS: `width`, `height`, `object-fit`

3. **Test Media Access**

   - Verify camera/mic work in browser settings
   - No other app should be using camera
   - Try disabling extensions that might block media

4. **Network Issues**

   - Ensure both users are connected to same/reachable network
   - Check for firewall blocking WebRTC
   - Verify STUN servers are reachable:
     - stun:stun.l.google.com:19302
     - stun:stun1-4.l.google.com:19302

5. **PeerJS Connection**
   - Check if both users can see each other (user list)
   - Verify peer IDs match in console logs
   - Check browser's WebRTC statistics (Chrome DevTools → More Tools → WebRTC internals)

## Files Modified

1. **frontend/src/Pages/VideoCall.jsx**

   - `peerRef.current.on('call')` handler
   - `handleCall()` function
   - `initiateCall()` function

2. **frontend/src/Pages/VideoCall.css**
   - `.remote-video` styling (object-fit change)
   - Added `.remote-video::-webkit-media-controls`
   - Added `video::-moz-media-controls`
   - `.local-video` styling

## Performance Considerations

- Stream attachment is O(1) operation
- Each video element can handle HD/FHD streams (720p recommended)
- Browser handles hardware acceleration for video playback
- No additional latency from these changes

## Future Improvements

1. **Add video quality detection** to adjust resolution based on bandwidth
2. **Implement fallback UIs** if video fails to load
3. **Add video source switching** to switch between cameras
4. **Implement screen sharing** for desktop sharing
5. **Add bandwidth adaptation** for poor connections

## References

- [WebRTC MediaStream API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream)
- [HTML Video Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video)
- [PeerJS Documentation](https://peerjs.com/)
- [object-fit CSS Property](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit)
