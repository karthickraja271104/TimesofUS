# 🏗️ Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       FRONTEND (React)                       │
│  http://localhost:5173                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Landing Page          Timeline Page                        │
│  ├─ Floating Hearts    ├─ Memory Cards                      │
│  ├─ Heart Animation    ├─ Navigation                        │
│  └─ Link to Timeline   ├─ RedString                         │
│                        └─ Add Memory Modal                  │
│                                                              │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP Requests
                         │ (Axios)
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express)                        │
│  http://localhost:5000/api                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Routes:                                                     │
│  ├─ POST   /memories      → Create memory                  │
│  ├─ GET    /memories      → Get all memories               │
│  ├─ GET    /memories/:id  → Get one memory                 │
│  ├─ PUT    /memories/:id  → Update memory                  │
│  └─ DELETE /memories/:id  → Delete memory                  │
│                                                              │
│  Middleware:                                                 │
│  ├─ Multer (file upload)                                   │
│  ├─ CORS (cross-origin)                                    │
│  └─ Error Handler                                          │
│                                                              │
└────────────┬───────────────────┬──────────────────┬─────────┘
             │ Database          │ File Storage     │ Media
             ↓                   ↓                  ↓
      ┌────────────┐      ┌──────────────┐    ┌─────────┐
      │  MongoDB   │      │ Cloudinary   │    │ Multer  │
      │   Atlas    │      │  (images,    │    │ (temp   │
      │ (memories) │      │  videos,     │    │ upload) │
      │            │      │  audio)      │    │         │
      └────────────┘      └──────────────┘    └─────────┘
```

## Data Flow - Creating a Memory

```
1. User Action
   └─ User clicks + button → AddMemoryModal opens

2. Form Input
   └─ User fills: title, message, date
   └─ User selects media file

3. Form Submission
   └─ FormData created with all fields
   └─ File attached (if selected)
   └─ API call: POST /api/memories

4. Backend Processing
   ├─ Multer intercepts file
   ├─ File validation (size, type)
   ├─ Upload to Cloudinary
   │  └─ Receive: URL, publicId, type
   ├─ Create MongoDB document
   │  ├─ title
   │  ├─ message
   │  ├─ date
   │  └─ media: { type, url, publicId }
   └─ Return created memory object

5. Frontend Update
   ├─ Modal closes
   ├─ Memory added to state
   ├─ MemoryCard rendered
   └─ Timeline refreshes
```

## Data Flow - Viewing Timeline

```
1. Component Mount
   └─ TimeLine.jsx loads

2. useEffect Hook
   └─ Calls fetchMemories()

3. API Request
   └─ GET /api/memories

4. Backend Processing
   ├─ Query MongoDB for all memories
   ├─ Sort by date (newest first)
   └─ Format response with media URLs

5. Frontend Update
   ├─ Memories loaded into state
   ├─ MemoryCards rendered
   ├─ Media displayed
   │  ├─ Images: <img src={url}>
   │  ├─ Videos: <video src={url} controls>
   │  └─ Audio: <audio src={url} controls>
   └─ Timeline ready to navigate
```

## Data Model - Memory

```javascript
Memory Document Structure:
{
  _id: ObjectId,
  title: String (required),
  message: String (required),
  date: Date (required, indexed),
  media: {
    type: "image" | "video" | "audio" | null,
    url: "https://res.cloudinary.com/...",
    publicId: "memories/..."
  },
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

Example Document:
{
  _id: ObjectId("65abcdef123456"),
  title: "Our First Date",
  message: "We had coffee at that beautiful cafe in downtown...",
  date: 2024-12-24,
  media: {
    type: "image",
    url: "https://res.cloudinary.com/dxxxx/image/upload/v1234567890/memories/photo.jpg",
    publicId: "memories/photo"
  },
  createdAt: 2024-12-24T10:30:00Z,
  updatedAt: 2024-12-24T10:30:00Z
}
```

## API Request/Response Examples

### Create Memory

```
REQUEST:
POST /api/memories
Content-Type: multipart/form-data

title=Our First Date
message=We had coffee at that beautiful cafe...
date=2024-12-24
media=<binary file>

RESPONSE (201 Created):
{
  "success": true,
  "message": "Memory created successfully",
  "data": {
    "id": "65abcdef123456",
    "title": "Our First Date",
    "message": "We had coffee at that beautiful cafe...",
    "date": "2024-12-24T00:00:00.000Z",
    "media": {
      "type": "image",
      "url": "https://res.cloudinary.com/...",
      "publicId": "memories/..."
    },
    "createdAt": "2024-12-24T10:30:00.000Z"
  }
}
```

### Get All Memories

```
REQUEST:
GET /api/memories

RESPONSE (200 OK):
{
  "success": true,
  "count": 3,
  "data": [
    { memory object 1 },
    { memory object 2 },
    { memory object 3 }
  ]
}
```

### Delete Memory

```
REQUEST:
DELETE /api/memories/65abcdef123456

RESPONSE (200 OK):
{
  "success": true,
  "message": "Memory deleted successfully"
}

Backend also:
1. Deletes media from Cloudinary using publicId
2. Deletes document from MongoDB
```

## File Upload Flow

```
┌─────────────────┐
│ User selects    │
│ file            │
└────────┬────────┘
         │
         ↓
┌─────────────────────┐
│ File in FormData    │ ← 5MB (img), 20MB (video), 10MB (audio)
│ + other form fields │
└────────┬────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│ POST /api/memories (multipart)      │
│ Multer middleware intercepts        │
└────────┬────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ File validation                      │
│ ├─ Check MIME type                  │
│ ├─ Check file size                  │
│ └─ Reject if invalid                │
└────────┬─────────────────────────────┘
         │ (Valid)
         ↓
┌──────────────────────────────────────┐
│ Upload to Cloudinary                │
│ ├─ Stream file from memory           │
│ ├─ Auto-detect resource type         │
│ └─ Return URL + publicId             │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ Save to MongoDB                      │
│ ├─ title, message, date              │
│ └─ media: { type, url, publicId }    │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ Return to frontend                   │
│ Display memory with media            │
└──────────────────────────────────────┘
```

## Component Interactions

```
App.jsx
├─ Router setup
│
├─ LandingPage
│  ├─ FloatingHearts (background animation)
│  ├─ Animated heart (link to timeline)
│  └─ Link to="/timeline"
│
└─ TimeLine
   ├─ fetchMemories() [API call]
   ├─ Memory state management
   ├─ Navigation (previous/next)
   ├─ Displays multiple MemoryCard components
   │  └─ Each memory → MemoryCard
   │     ├─ Shows title, message, date
   │     └─ Shows media (image/video/audio)
   ├─ RedString (decorative connector)
   └─ AddMemoryModal (for creating memories)
      ├─ Form inputs
      ├─ File upload with preview
      └─ API call: createMemory()
```

## Error Handling Flow

```
User Action
    ↓
Try API Call
    ↓
    ├─ Success (200/201)
    │  └─ Update UI, show data
    │
    └─ Error
       ├─ Validation Error (400)
       │  └─ Show: "Please fill all fields"
       │
       ├─ File Size Error (413)
       │  └─ Show: "File too large"
       │
       ├─ File Type Error (400)
       │  └─ Show: "Unsupported file type"
       │
       ├─ Cloudinary Error
       │  └─ Show: "Upload failed"
       │
       ├─ MongoDB Error
       │  └─ Show: "Database error"
       │
       ├─ Network Error
       │  └─ Show: "Server not responding"
       │
       └─ Unknown Error (500)
          └─ Show: "Something went wrong"
```

## State Management

```
Frontend State:

LandingPage:
├─ FloatingHearts (generated on render)
└─ Heart animation state (Framer Motion)

TimeLine:
├─ memories[] (array of memory objects)
├─ activeIndex (currently selected memory)
├─ isLoading (loading state)
├─ error (error message)
└─ isModalOpen (modal visibility)

AddMemoryModal:
├─ formData { title, message, date }
├─ mediaFile (selected file)
├─ mediaPreview (preview data)
├─ mediaType ("image" | "video" | "audio")
├─ isLoading (submission in progress)
└─ error (form error message)

MemoryCard:
└─ Props only (no internal state)
   ├─ memory object
   ├─ isActive (boolean)
   └─ index (number)
```

## Security Considerations

```
Frontend:
├─ API URL in .env (not hardcoded)
├─ File validation before upload
├─ Error messages sanitized
└─ No sensitive data in localStorage

Backend:
├─ Credentials in .env (not in code)
├─ CORS configured for specific origin
├─ Request validation
├─ File type/size validation
├─ MongoDB query protection
├─ API error messages don't expose internals
└─ Cloudinary API Secret never exposed to frontend

Database:
├─ Connection string secured
├─ IP whitelisting
└─ Strong password required

File Storage:
├─ Files uploaded to Cloudinary (not server)
├─ Cloudinary manages security
└─ publicId stored in DB for deletion
```

---

This architecture ensures:
✅ Clean separation of concerns  
✅ Scalable design  
✅ Secure data handling  
✅ Responsive user experience  
✅ Persistent storage  
✅ Global file delivery (via Cloudinary)
