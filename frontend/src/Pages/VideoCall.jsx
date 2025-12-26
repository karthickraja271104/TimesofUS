import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Phone, PhoneOff, Home, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import Peer from "peerjs";
import "./VideoCall.css";

export default function VideoCall() {
  const [peerId, setPeerId] = useState(null);
  const [remotePeerId, setRemotePeerId] = useState("");
  const [callActive, setCallActive] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const callRef = useRef(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Initialize PeerJS and Socket.io
  useEffect(() => {
    // Socket.io connection
    socketRef.current = io(window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Socket.io connected:', socketRef.current.id);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('❌ Socket.io connection error:', error);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.warn('⚠️ Socket.io disconnected:', reason);
    });

    // PeerJS setup with STUN servers for better NAT traversal
    peerRef.current = new Peer({
      config: {
        iceServers: [
          { urls: ['stun:stun.l.google.com:19302'] },
          { urls: ['stun:stun1.l.google.com:19302'] },
          { urls: ['stun:stun2.l.google.com:19302'] },
          { urls: ['stun:stun3.l.google.com:19302'] },
          { urls: ['stun:stun4.l.google.com:19302'] }
        ]
      }
    });

    // Get peer ID
    peerRef.current.on('open', (id) => {
      setPeerId(id);
      console.log('✅ Peer ID obtained:', id);
      console.log('📝 This is the PeerJS ID, not Socket.io ID');
      
      // Wait for socket to be ready, then emit the PEERJS ID (not socket ID)
      if (socketRef.current.connected) {
        socketRef.current.emit('user-joined', id);  // Send PeerJS ID
        console.log('📤 Emitted user-joined with PeerJS ID:', id);
      } else {
        console.warn('⚠️ Socket not connected yet, waiting...');
        socketRef.current.once('connect', () => {
          socketRef.current.emit('user-joined', id);  // Send PeerJS ID
          console.log('📤 Emitted user-joined (after connect) with PeerJS ID:', id);
        });
      }
    });

    peerRef.current.on('error', (error) => {
      console.error('❌ PeerJS error:', error);
      const errorMessage = 
        error.type === 'peer-unavailable' 
          ? 'Peer is not available. They may have disconnected or are unreachable.'
          : error.type === 'network'
          ? 'Network error. Check your connection, firewall, or try with a different network.'
          : error.type === 'socket-closed'
          ? 'Connection to signaling server lost.'
          : error.type === 'socket-error'
          ? 'Socket error. The signaling server may be down.'
          : `Peer connection error: ${error.message || error.type}. Error code: ${error.type}`;
      
      console.error('Error type:', error.type);
      console.error('Error message:', error.message);
      alert(errorMessage);
    });

    // Handle incoming call
    peerRef.current.on('call', async (call) => {
      console.log('📞 Incoming call from:', call.peer);
      setRemotePeerId(call.peer);
      setCallActive(true);
      
      try {
        console.log('🎬 Requesting camera/mic for incoming call...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: { ideal: 1280 }, height: { ideal: 720 } }, 
          audio: true 
        });
        
        console.log('✅ Got local stream for incoming call');
        console.log('   Stream ID:', stream.id);
        console.log('   Tracks:', stream.getTracks().length);
        
        localStreamRef.current = stream;
        
        // Wait for DOM to render video element
        // React needs time to paint the DOM after setState
        let retries = 0;
        const maxRetries = 20;
        while (!localVideoRef.current && retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 50));
          retries++;
        }
        
        if (localVideoRef.current) {
          console.log('   Attaching local stream to video element (retry count:', retries, ')...');
          localVideoRef.current.srcObject = stream;
          
          // Ensure video plays
          try {
            await localVideoRef.current.play();
            console.log('✅ Local video playing');
          } catch (playErr) {
            console.error('⚠️  Play error (may be okay):', playErr.message);
            // Some browsers auto-play restricted video, this is expected
          }
          
          console.log('✅ Local video ref set for incoming call');
        } else {
          console.error('❌ Local video ref not available! (waited', retries * 50, 'ms)');
          alert('Video element failed to mount. Please try again.');
        }
        
        // Answer the call with local stream
        console.log('📞 Answering call with stream...');
        call.answer(stream);
        console.log('✅ Call answered with local stream');
        
        // Set up call handlers to receive remote stream
        handleCall(call);
      } catch (error) {
        console.error('❌ Error accessing media for incoming call:', error);
        alert(`Could not access camera/microphone: ${error.message}`);
      }
    });

    // Socket listeners
    socketRef.current.on('user-online', (data) => {
      console.log('👤 User online event received:', data);
      console.log('   User ID (PeerJS ID):', data.userId);
      setOnlineUsers((prev) => {
        // Now userId IS the PeerJS peer ID
        const exists = prev.some(u => u.peerId === data.userId);
        if (!exists) {
          console.log('✅ Adding user with Peer ID:', data.userId);
          return [...prev, { peerId: data.userId, socketId: data.socketId }];
        }
        return prev;
      });
    });

    // Listen for existing users (sent when we join)
    socketRef.current.on('existing-users', (users) => {
      console.log('📋 Received existing users:', users);
      setOnlineUsers((prev) => {
        // Filter out any duplicates that might already exist
        const existingPeerIds = new Set(prev.map(u => u.peerId));
        const newUsers = users.filter(u => !existingPeerIds.has(u.userId));
        if (newUsers.length > 0) {
          console.log('✅ Adding', newUsers.length, 'existing users');
          return [...prev, ...newUsers.map(u => ({ peerId: u.userId, socketId: u.socketId }))];
        }
        return prev;
      });
    });

    socketRef.current.on('user-offline', (socketId) => {
      console.log('👤 User offline:', socketId);
      setOnlineUsers((prev) =>
        prev.filter((user) => user.socketId !== socketId)
      );
    });

    socketRef.current.on('call-ended', () => {
      console.log('📞 Call ended by remote peer');
      endCall();
    });

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      socketRef.current.disconnect();
      peerRef.current.destroy();
    };
  }, []);

  // Handle incoming/outgoing call
  const handleCall = (call) => {
    callRef.current = call;
    console.log('📞 handleCall: Setting up listeners for call:', call.peer);

    // Handle remote stream
    const handleRemoteStream = (remoteStream) => {
      console.log('✅ Got remote stream from peer:', call.peer);
      console.log('   Stream ID:', remoteStream.id);
      console.log('   Tracks:', remoteStream.getTracks().length);
      
      if (remoteVideoRef.current) {
        console.log('   Attaching remote stream to video element...');
        remoteVideoRef.current.srcObject = remoteStream;
        
        // Ensure video plays
        try {
          remoteVideoRef.current.play().catch(err => {
            console.error('⚠️  Play error (may be okay):', err.message);
          });
        } catch (e) {
          console.error('❌ Error calling play():', e);
        }
        
        console.log('✅ Remote video ref set');
      } else {
        console.error('❌ Remote video ref not available!');
      }
    };
    
    // Wait for remote stream
    call.on('stream', handleRemoteStream);

    call.on('close', () => {
      console.log('📞 Call closed');
      endCall();
    });

    call.on('error', (err) => {
      console.error('❌ Call error:', err);
      const errorMessage = err.type === 'peer-unavailable'
        ? 'Unable to reach peer. They may be offline or unreachable.'
        : err.type === 'network'
        ? 'Network error during call. Check your connection.'
        : `Call error: ${err.message || err.type}`;
      alert(errorMessage);
      endCall();
    });
  };

  // Initiate call
  const initiateCall = async (targetPeerId) => {
    if (!peerId) {
      console.error('❌ No peer ID available');
      return;
    }

    console.log('📞 Initiating call to peer:', targetPeerId);
    console.log('   From peer:', peerId);

    try {
      console.log('🎬 Requesting camera/mic access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });

      console.log('✅ Got local stream:', stream.id);
      console.log('   Tracks:', stream.getTracks().length);
      
      localStreamRef.current = stream;
      
      // Show call UI immediately before attaching video
      setCallActive(true);
      setRemotePeerId(targetPeerId);
      console.log('✅ Call UI activated');
      
      // Wait longer for DOM to render video element
      // React needs time to paint the DOM after setState
      let retries = 0;
      const maxRetries = 20;
      while (!localVideoRef.current && retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 50));
        retries++;
      }
      
      if (localVideoRef.current) {
        console.log('   Attaching local stream to video element (retry count:', retries, ')...');
        localVideoRef.current.srcObject = stream;
        
        // Ensure video plays
        try {
          await localVideoRef.current.play();
          console.log('✅ Local video playing');
        } catch (playErr) {
          console.error('⚠️  Play error (may be okay):', playErr.message);
          // Some browsers auto-play restricted video, this is expected
        }
        
        console.log('✅ Local video element ready');
      } else {
        console.error('❌ Local video ref not available! (waited', retries * 50, 'ms)');
        setCallActive(false);
        alert('Video element failed to mount. Please try again.');
      }

      console.log('📞 Creating PeerJS call with ID:', targetPeerId);
      const call = peerRef.current.call(targetPeerId, stream);
      console.log('✅ Call object created, waiting for connection...');
      handleCall(call);
    } catch (error) {
      console.error('❌ Error accessing media devices:', error);
      setCallActive(false);
      alert(`Could not access camera/microphone: ${error.message}\n\nMake sure you:\n1. Have a working camera/microphone\n2. Granted browser permission\n3. No other app is using camera`);
    }
  };

  // End call
  const endCall = () => {
    console.log('📞 Ending call...');
    if (callRef.current) {
      callRef.current.close();
      callRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log('🔴 Stopped track:', track.kind);
      });
      localStreamRef.current = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    
    setCallActive(false);
    setRemotePeerId("");
    setSelectedUser(null);
    setIsMicOn(true);
    setIsVideoOn(true);
    
    // Notify the other user that call was ended
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('end-call');
      console.log('📤 Sent end-call notification to other user');
    }
    console.log('✅ Call ended');
  };

  // Toggle microphone
  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMicOn(!isMicOn);
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOn(!isVideoOn);
    }
  };

  return (
    <div className="videocall-container">
      {/* Header */}
      <div className="videocall-header">
        <Link to="/timeline" className="home-btn">
          <Home size={24} />
        </Link>
        <h1>💕 Video Call</h1>
        <div className="peer-id">ID: {peerId?.substring(0, 8)}...</div>
      </div>

      {/* Main Content */}
      <div className="videocall-content">
        {!callActive ? (
          <div className="user-selection">
            <h2>Select a user to call</h2>
            {onlineUsers.length === 0 || onlineUsers.every(u => u.peerId === peerId) ? (
              <p className="no-users">No other users online</p>
            ) : (
              <div className="users-grid">
                {onlineUsers
                  .filter(user => user.peerId !== peerId) // Filter out current user
                  .map((user) => (
                  <motion.button
                    key={user.peerId}
                    className={`user-card ${
                      selectedUser === user.peerId ? "selected" : ""
                    }`}
                    onClick={() => {
                      setSelectedUser(user.peerId);
                      console.log('👤 Selected user with Peer ID:', user.peerId);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="user-avatar">👤</div>
                    <p>{user.peerId.substring(0, 8)}</p>
                  </motion.button>
                ))}
              </div>
            )}

            {selectedUser && (
              <motion.button
                className="call-button"
                onClick={() => initiateCall(selectedUser)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Phone size={24} />
                Call Now
              </motion.button>
            )}
          </div>
        ) : (
          <div className="video-container">
            {/* Remote Video */}
            <div className="remote-video-wrapper">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                muted={false}
                className="remote-video"
              />
              <div className="remote-label">Partner</div>
            </div>

            {/* Local Video */}
            <div className="local-video-wrapper">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="local-video"
              />
              <div className="local-label">You</div>
            </div>

            {/* Controls */}
            <div className="call-controls">
              <motion.button
                className={`control-btn ${isMicOn ? "active" : "inactive"}`}
                onClick={toggleMic}
                whileTap={{ scale: 0.9 }}
              >
                {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
              </motion.button>

              <motion.button
                className={`control-btn ${isVideoOn ? "active" : "inactive"}`}
                onClick={toggleVideo}
                whileTap={{ scale: 0.9 }}
              >
                {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
              </motion.button>

              <motion.button
                className="end-call-btn"
                onClick={endCall}
                whileTap={{ scale: 0.9 }}
              >
                <PhoneOff size={24} />
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
