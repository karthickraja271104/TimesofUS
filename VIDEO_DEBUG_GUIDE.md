# WebRTC Video Call - Detailed Debugging & Testing Guide

## Quick Status Check

### What's Working ✅

1. **User Discovery**: Users can see each other online
2. **Peer Connection**: PeerJS connects between users with correct peer IDs
3. **Call Signaling**: Call object is created and transmitted
4. **Stream Capture**: Both users can access their camera/microphone
5. **UI Activation**: Call UI shows immediately when call starts

### What's Being Fixed 🔧

1. **Local Video Display**: User's own camera feed showing on their screen
2. **Remote Video Display**: Partner's camera feed showing on both screens
3. **Stream Attachment Timing**: Ensuring streams attach when refs are ready
4. **CSS Rendering**: Video elements filling container properly

## Step-by-Step Testing Guide

### Test Setup

- **Browser A (Caller)**: Chrome, Firefox, or Edge on Machine 1
- **Browser B (Receiver)**: Chrome, Firefox, or Edge on Machine 2
- **Network**: Same network or with proper port forwarding
- **Backend**: Running on `http://localhost:5000`
- **Frontend**: Running on `http://localhost:5173`

### Pre-Test Checklist

- [ ] Both browsers have camera/microphone
- [ ] Permissions granted (check address bar camera/mic icons)
- [ ] No other app using camera
- [ ] Both users see each other in online users list
- [ ] Browser console open (F12)

### Test Scenario 1: Caller Side (Should See Both Videos)

**Steps:**

1. Open Browser A and navigate to http://localhost:5173
2. Wait for "Peer ID loaded: [ID]" message
3. Open Browser B on same/different machine
4. In Browser A, wait to see Browser B's peer ID in online users
5. In Browser A, click on Browser B's user button
6. Click "Call Now"

**Expected Console Output (Browser A):**

```
✅ Peer ID loaded: [YOUR-PEER-ID]
📞 Initiating call to peer: [PARTNER-PEER-ID]
   From peer: [YOUR-PEER-ID]
🎬 Requesting camera/mic access...
✅ Got local stream: [stream-id]
   Tracks: 2
✅ Call UI activated
   Attaching local stream to video element...
✅ Local video playing
✅ Local video element ready
📞 Creating PeerJS call with ID: [PARTNER-PEER-ID]
✅ Call object created, waiting for connection...
📞 handleCall: Setting up listeners for call: [PARTNER-PEER-ID]
```

**Expected Visual (Browser A):**

- Call UI appears immediately (within 500ms)
- Your video appears in bottom-right corner (180x180px with mirror effect)
- Black area in main screen for remote video (will fill when partner answers)

**After Partner Answers (Browser A):**

```
✅ Got remote stream from peer: [PARTNER-PEER-ID]
   Stream ID: [remote-stream-id]
   Tracks: 2
   Attaching remote stream to video element...
✅ Remote video ref set
```

**Expected Visual (Browser A - After Answer):**

- Partner's video fills main screen
- Your video still visible in bottom-right corner
- Both videos showing live feed

---

### Test Scenario 2: Receiver Side (Should See Both Videos)

**Steps:**

1. Open Browser B and navigate to http://localhost:5173
2. Wait for "Peer ID loaded: [ID]" message
3. Caller (Browser A) initiates call (see Scenario 1)
4. Call should be automatically answered

**Expected Console Output (Browser B - Auto Answer):**

```
✅ Peer ID loaded: [YOUR-PEER-ID]
👤 User online event received: {userId: "[CALLER-PEER-ID]", socketId: "..."}
✅ Adding user with Peer ID: [CALLER-PEER-ID]

[Caller clicks "Call Now"]

📞 Incoming call from: [CALLER-PEER-ID]
🎬 Requesting camera/mic for incoming call...
✅ Got local stream for incoming call
   Stream ID: [stream-id]
   Tracks: 2
   Attaching local stream to video element...
✅ Local video playing
✅ Local video ref set for incoming call
📞 Answering call with stream...
✅ Call answered with local stream
📞 handleCall: Setting up listeners for call: [CALLER-PEER-ID]
```

**Immediately After Answering:**

```
✅ Got remote stream from peer: [CALLER-PEER-ID]
   Stream ID: [remote-stream-id]
   Tracks: 2
   Attaching remote stream to video element...
✅ Remote video ref set
```

**Expected Visual (Browser B):**

- Your video appears in bottom-right corner immediately
- Caller's video fills main screen after connection
- Both videos showing live feed

---

## Debugging: Videos Not Showing

### Issue: Caller's Local Video Black/Missing

**Root Causes:**

1. Camera permission denied
2. Camera already in use by another app
3. VideoRef not properly mounted when stream attached
4. CSS hiding the video element

**Debugging Steps:**

1. **Check Console for Errors:**

   ```javascript
   // Should see this WITHOUT errors:
   ✅ Got local stream
   ✅ Local video playing
   ```

   If you see: `Error playing local video`, check browser restrictions

2. **Inspect Video Element:**

   - Open DevTools (F12)
   - Find `<video ref={localVideoRef}...>` element
   - Right-click → Inspect element
   - Check:
     - Width/height: Should be 180px (local video wrapper)
     - srcObject: Should show `MediaStream {id: "..."}`
     - Computed styles: Should NOT have `display: none`

3. **Check Camera Permission:**

   - Chrome: Click camera icon in address bar
   - Verify "Allow" selected
   - Refresh page
   - Try again

4. **Verify CSS:**

   ```css
   /* Should all be true: */
   .local-video-wrapper {
     width: 180px;
     height: 180px;
     display: flex;
     overflow: hidden;
   }

   .local-video {
     width: 100%;
     height: 100%;
     object-fit: cover;
     display: block;
   }
   ```

5. **Test Direct MediaStream:**
   Open browser console and run:
   ```javascript
   navigator.mediaDevices
     .getUserMedia({
       video: { width: { ideal: 1280 }, height: { ideal: 720 } },
       audio: true,
     })
     .then((stream) => {
       console.log("✅ Camera works!", stream);
       stream.getTracks().forEach((t) => t.stop()); // Stop immediately
     })
     .catch((err) => {
       console.error("❌ Camera blocked:", err);
     });
   ```

---

### Issue: Remote Video Black/Missing

**Root Causes:**

1. Remote stream not arriving from peer
2. Remote stream not being attached to video element
3. Connection not established (peer unavailable)
4. CSS hiding the remote video element

**Debugging Steps:**

1. **Check Console for Remote Stream Event:**

   ```javascript
   // Should see this:
   ✅ Got remote stream from peer: [PARTNER-ID]
   Tracks: 2
   ✅ Remote video ref set
   ```

   If NOT seen:

   - Partner's stream isn't being sent
   - Check partner's console for errors
   - Verify peer connection established

2. **Inspect Remote Video Element:**

   - Open DevTools → Elements
   - Find `<video ref={remoteVideoRef}...>` element
   - Check:
     - Width/height: Should be 100% of video-container
     - srcObject: Should show `MediaStream {id: "..."}` (if stream arrived)
     - Computed styles: Should NOT have `display: none`, `visibility: hidden`

3. **Check Remote Peer Status:**

   ```javascript
   // In browser console (Chrome DevTools):
   // 1. Ctrl+Shift+I to open DevTools
   // 2. More Tools → WebRTC internals
   // 3. Look for:
   //    - "Candidate Pairs" section
   //    - Status should be "connected" or "completed"
   //    - Has "in-use" state
   ```

4. **Test Peer Connection:**

   - Verify both users can see each other in online list
   - Check console: "Initiating call to peer: [ID]" message
   - Verify partner receives: "Incoming call from: [ID]" message

5. **Verify CSS:**

   ```css
   /* Should all be true: */
   .video-container {
     width: 100%;
     max-width: 900px;
     aspect-ratio: 16 / 9;
     background: #000;
     display: flex;
   }

   .remote-video-wrapper {
     width: 100%;
     height: 100%;
     display: flex;
   }

   .remote-video {
     width: 100%;
     height: 100%;
     object-fit: cover;
     display: block;
   }
   ```

---

### Issue: Both Sides See All Black

**Root Causes:**

1. Neither user can access camera
2. Network/Firewall blocking WebRTC
3. PeerJS initialization failed
4. Both users offline (server issue)

**Debugging Steps:**

1. **Verify Peer IDs Loaded:**
   Console should show early:

   ```javascript
   ✅ Peer ID loaded: [YOUR-ID]
   ```

   If NOT seen → PeerJS initialization failed

2. **Verify User Discovery:**
   Console should show:

   ```javascript
   👤 User online event received: {userId: "[PEER-ID]"}
   ✅ Adding user with Peer ID: [PEER-ID]
   ```

   If NOT seen → Socket.io connection issue

3. **Check Network Issues:**

   - Open DevTools → Network tab
   - Look for WebSocket connection (ws://)
   - Should show connected with `101 Switching Protocols`
   - If failed: Backend not running or firewall blocking

4. **Check STUN Servers:**

   ```javascript
   // PeerJS should try these STUN servers:
   stun:stun.l.google.com:19302
   stun:stun1.l.google.com:19302
   stun:stun2.l.google.com:19302
   stun:stun3.l.google.com:19302
   stun:stun4.l.google.com:19302

   // In Chrome: More Tools → WebRTC internals
   // Check: IceServers should show above URLs
   ```

5. **Verify Backend Running:**

   ```bash
   # Terminal 1: Check backend
   curl http://localhost:5000/api/memories
   # Should return: []

   # If error: Backend not running
   cd backend
   npm start
   ```

6. **Check Camera Access Again:**
   - Try in a fresh browser/incognito window
   - Verify all permissions
   - Check if another tab using camera
   - Try different camera app first (Zoom, Teams) to verify camera works

---

## Console Logging Guide

### Normal Flow Console Output

**User Joins:**

```
✅ Peer ID loaded: peer_abc123xyz789def
🔗 Connected to Socket.io
📞 PeerJS peer created
👤 User online event received: {userId: "peer_def456uvw012abc", socketId: "socket_001"}
✅ Adding user with Peer ID: peer_def456uvw012abc
```

**Caller Makes Call:**

```
📞 Initiating call to peer: peer_def456uvw012abc
   From peer: peer_abc123xyz789def
🎬 Requesting camera/mic access...
✅ Got local stream: stream_001
   Tracks: 2
✅ Call UI activated
   Attaching local stream to video element...
✅ Local video playing
✅ Local video element ready
📞 Creating PeerJS call with ID: peer_def456uvw012abc
✅ Call object created, waiting for connection...
📞 handleCall: Setting up listeners for call: peer_def456uvw012abc
```

**Receiver Answers:**

```
📞 Incoming call from: peer_abc123xyz789def
🎬 Requesting camera/mic for incoming call...
✅ Got local stream for incoming call
   Stream ID: stream_002
   Tracks: 2
   Attaching local stream to video element...
✅ Local video playing
✅ Local video ref set for incoming call
📞 Answering call with stream...
✅ Call answered with local stream
📞 handleCall: Setting up listeners for call: peer_abc123xyz789def
```

**Streams Exchange:**

```
✅ Got remote stream from peer: peer_abc123xyz789def
   Stream ID: stream_003
   Tracks: 2
   Attaching remote stream to video element...
✅ Remote video ref set
```

---

## Error Reference

### `Error: Could not connect to peer`

- **Cause**: Peer ID doesn't match, peer offline, firewall blocking
- **Fix**: Verify peer IDs, refresh both pages, check STUN servers

### `NotAllowedError: Permission denied`

- **Cause**: Camera/mic permission not granted
- **Fix**: Grant permission in browser, check settings

### `NotFoundError: Requested device not found`

- **Cause**: No camera/mic detected
- **Fix**: Connect camera, use different device

### `Empty console, no logs at all`

- **Cause**: JavaScript errors preventing execution
- **Fix**: Check for errors in red, refresh page

### `WebSocket closed`

- **Cause**: Backend server not running
- **Fix**: `cd backend && npm start`

---

## Performance Monitoring

### Check Video Quality:

1. Right-click on video element
2. "Inspect" or DevTools Elements
3. Monitor:
   - `videoWidth` and `videoHeight`
   - Should be close to 1280x720 (configured resolution)

### Check Stream Stats:

In Chrome, enable WebRTC stats:

1. DevTools → More Tools → WebRTC internals
2. Look for:
   - Bytes sent/received
   - Packets lost (should be 0)
   - Jitter (lower is better)

### Network Bandwidth:

DevTools → Network → WS (WebSocket) tab:

- Should show low latency (<100ms)
- Messages flowing continuously

---

## Quick Fixes Checklist

If videos not showing:

1. [ ] Refresh both pages
2. [ ] Grant camera/mic permissions
3. [ ] Verify both peer IDs visible in online list
4. [ ] Check console for "Got local stream" message
5. [ ] Inspect `<video>` element has `srcObject`
6. [ ] Check CSS: video should not be `display: none`
7. [ ] Verify backend running: `npm start` in backend folder
8. [ ] Try different camera (if available)
9. [ ] Try incognito/private window
10. [ ] Restart both browser windows
11. [ ] Restart backend server
12. [ ] Check firewall isn't blocking port 5000

---

## Performance Expectations

| Metric                       | Expected Value |
| ---------------------------- | -------------- |
| Initial load                 | < 2 seconds    |
| Time to show local video     | < 500ms        |
| Time to receive remote video | 1-3 seconds    |
| Latency (Round-trip)         | 50-200ms       |
| Video resolution             | 1280x720p      |
| Frame rate                   | 24-30 fps      |
| Bandwidth (1 stream)         | 500-2000 kbps  |
| Bandwidth (2 streams)        | 1-4 mbps       |

---

## Advanced Debugging

### Enable Extra Console Logging:

Edit VideoCall.jsx and add to handleRemoteStream:

```javascript
console.log("Stream metadata:", {
  width: remoteVideoRef.current.videoWidth,
  height: remoteVideoRef.current.videoHeight,
  paused: remoteVideoRef.current.paused,
  played: remoteVideoRef.current.played,
  duration: remoteVideoRef.current.duration,
});
```

### Monitor Stream Tracks:

```javascript
if (remoteStream) {
  remoteStream.getTracks().forEach((track, i) => {
    console.log(`Track ${i}:`, {
      kind: track.kind,
      enabled: track.enabled,
      readyState: track.readyState,
      settings: track.getSettings(),
    });
  });
}
```

### Check Media Devices:

```javascript
navigator.mediaDevices.enumerateDevices().then((devices) => {
  devices.forEach((dev) => console.log(`${dev.kind}: ${dev.label}`));
});
```

---

## Support Resources

- **MDN WebRTC Guide**: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API
- **PeerJS Docs**: https://peerjs.com/docs.html
- **Socket.io Events**: https://socket.io/docs/v4/events/
- **Chrome WebRTC Internals**: chrome://webrtc-internals
- **Firefox WebRTC Stats**: about:webrtc
