# Database Schema for Call Logs with Audio

## Call Recordings Table

```sql
CREATE TABLE call_recordings (
  id SERIAL PRIMARY KEY,
  conversation_id VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  audio_url TEXT,
  duration INTEGER NOT NULL, -- Duration in seconds
  risk_score INTEGER, -- 0-100
  status VARCHAR(20) NOT NULL, -- 'scam', 'safe', 'unknown'
  transcript JSONB, -- Array of { speaker, text, timestamp }
  keywords TEXT[], -- Array of detected scam keywords
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_call_recordings_conversation_id ON call_recordings(conversation_id);
CREATE INDEX idx_call_recordings_phone_number ON call_recordings(phone_number);
CREATE INDEX idx_call_recordings_created_at ON call_recordings(created_at DESC);
CREATE INDEX idx_call_recordings_status ON call_recordings(status);
```

## Example Queries

### Get call with audio URL
```sql
SELECT 
  conversation_id,
  phone_number,
  audio_url,
  duration,
  risk_score,
  status,
  transcript,
  keywords,
  created_at
FROM call_recordings
WHERE conversation_id = $1;
```

### Get recent calls with audio
```sql
SELECT 
  conversation_id,
  phone_number,
  audio_url,
  duration,
  risk_score,
  status,
  created_at
FROM call_recordings
WHERE audio_url IS NOT NULL
ORDER BY created_at DESC
LIMIT 100;
```

### Update call with audio URL
```sql
UPDATE call_recordings
SET 
  audio_url = $1,
  duration = $2,
  updated_at = NOW()
WHERE conversation_id = $3;
```

## Prisma Schema (Alternative)

```prisma
model CallRecording {
  id             Int       @id @default(autoincrement())
  conversationId String    @unique @map("conversation_id")
  phoneNumber    String    @map("phone_number")
  audioUrl       String?   @map("audio_url")
  duration       Int       // Duration in seconds
  riskScore      Int?      @map("risk_score")
  status         String    // 'scam', 'safe', 'unknown'
  transcript     Json?     // Array of { speaker, text, timestamp }
  keywords       String[]  // Array of detected scam keywords
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  @@index([conversationId])
  @@index([phoneNumber])
  @@index([createdAt(sort: Desc)])
  @@index([status])
  @@map("call_recordings")
}
```

