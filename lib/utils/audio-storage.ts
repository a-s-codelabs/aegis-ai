/**
 * Audio Storage Utility
 * 
 * Handles uploading audio files to cloud storage.
 * Supports multiple storage backends: S3, Supabase, or local filesystem.
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export interface StorageConfig {
  type: 'local' | 's3' | 'supabase';
  // Local storage config
  localPath?: string;
  // S3 config
  s3Bucket?: string;
  s3Region?: string;
  s3AccessKeyId?: string;
  s3SecretAccessKey?: string;
  // Supabase config
  supabaseUrl?: string;
  supabaseKey?: string;
  supabaseBucket?: string;
}

/**
 * Upload audio file to storage and return public URL
 */
export async function uploadAudioFile(
  buffer: Buffer,
  filename: string,
  config: StorageConfig
): Promise<string> {
  switch (config.type) {
    case 'local':
      return await uploadToLocal(buffer, filename, config.localPath || './public/recordings');
    
    case 's3':
      return await uploadToS3(buffer, filename, config);
    
    case 'supabase':
      return await uploadToSupabase(buffer, filename, config);
    
    default:
      throw new Error(`Unsupported storage type: ${config.type}`);
  }
}

/**
 * Upload to local filesystem (for development)
 */
async function uploadToLocal(
  buffer: Buffer,
  filename: string,
  basePath: string
): Promise<string> {
  try {
    // Ensure directory exists
    await mkdir(basePath, { recursive: true });
    
    // Write file
    const filePath = join(basePath, filename);
    await writeFile(filePath, buffer);
    
    // Return public URL (relative to public folder)
    const publicPath = basePath.replace('./public', '');
    return `${publicPath}/${filename}`;
  } catch (error) {
    console.error('[AudioStorage] Error uploading to local:', error);
    throw new Error(`Failed to save audio file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload to AWS S3
 */
async function uploadToS3(
  buffer: Buffer,
  filename: string,
  config: StorageConfig
): Promise<string> {
  // Dynamic import to avoid bundling AWS SDK in client
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
  
  if (!config.s3Bucket || !config.s3Region) {
    throw new Error('S3 configuration missing: bucket and region required');
  }

  const s3Client = new S3Client({
    region: config.s3Region,
    credentials: config.s3AccessKeyId && config.s3SecretAccessKey ? {
      accessKeyId: config.s3AccessKeyId,
      secretAccessKey: config.s3SecretAccessKey,
    } : undefined,
  });

  const command = new PutObjectCommand({
    Bucket: config.s3Bucket,
    Key: `recordings/${filename}`,
    Body: buffer,
    ContentType: 'audio/wav',
    ACL: 'public-read',
  });

  try {
    await s3Client.send(command);
    // Return public URL
    return `https://${config.s3Bucket}.s3.${config.s3Region}.amazonaws.com/recordings/${filename}`;
  } catch (error) {
    console.error('[AudioStorage] Error uploading to S3:', error);
    throw new Error(`Failed to upload to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload to Supabase Storage
 */
async function uploadToSupabase(
  buffer: Buffer,
  filename: string,
  config: StorageConfig
): Promise<string> {
  if (!config.supabaseUrl || !config.supabaseKey || !config.supabaseBucket) {
    throw new Error('Supabase configuration missing: url, key, and bucket required');
  }

  try {
    const formData = new FormData();
    const blob = new Blob([buffer], { type: 'audio/wav' });
    formData.append('file', blob, filename);

    const response = await fetch(
      `${config.supabaseUrl}/storage/v1/object/${config.supabaseBucket}/${filename}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.supabaseKey}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase upload failed: ${errorText}`);
    }

    // Return public URL
    return `${config.supabaseUrl}/storage/v1/object/public/${config.supabaseBucket}/${filename}`;
  } catch (error) {
    console.error('[AudioStorage] Error uploading to Supabase:', error);
    throw new Error(`Failed to upload to Supabase: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get storage configuration from environment variables
 */
export function getStorageConfig(): StorageConfig {
  const storageType = (process.env.AUDIO_STORAGE_TYPE || 'local') as 'local' | 's3' | 'supabase';

  if (storageType === 's3') {
    return {
      type: 's3',
      s3Bucket: process.env.S3_BUCKET,
      s3Region: process.env.S3_REGION || 'us-east-1',
      s3AccessKeyId: process.env.S3_ACCESS_KEY_ID,
      s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    };
  }

  if (storageType === 'supabase') {
    return {
      type: 'supabase',
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_ANON_KEY,
      supabaseBucket: process.env.SUPABASE_STORAGE_BUCKET || 'recordings',
    };
  }

  // Default to local
  return {
    type: 'local',
    localPath: process.env.AUDIO_STORAGE_PATH || './public/recordings',
  };
}

