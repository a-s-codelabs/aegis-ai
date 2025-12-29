/**
 * WAV File Writer Utility
 * 
 * Converts audio chunks (base64 PCM16) into a WAV file.
 * Supports merging multiple audio chunks into a single file.
 */

/**
 * Convert base64 PCM16 audio chunks to WAV file buffer
 * 
 * @param chunks - Array of audio chunks with base64 PCM16 data
 * @param sampleRate - Audio sample rate (default: 24000 for ElevenLabs, 16000 for realtime media)
 * @param channels - Number of audio channels (default: 1 for mono)
 * @returns WAV file as Buffer
 */
export function createWavFile(
  chunks: Array<{ base64Data: string }>,
  sampleRate: number = 24000,
  channels: number = 1
): Buffer {
  // Decode all base64 chunks to PCM16 data
  const pcm16Arrays: Int16Array[] = [];
  
  for (const chunk of chunks) {
    try {
      // Decode base64 to binary
      const binaryString = atob(chunk.base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Convert to Int16Array (PCM16)
      const pcm16 = new Int16Array(bytes.buffer);
      pcm16Arrays.push(pcm16);
    } catch (error) {
      console.error('[WavWriter] Error decoding chunk:', error);
      // Skip invalid chunks
      continue;
    }
  }

  // Calculate total length
  const totalSamples = pcm16Arrays.reduce((sum, arr) => sum + arr.length, 0);
  const dataSize = totalSamples * 2; // 2 bytes per sample (Int16)
  const fileSize = 36 + dataSize; // WAV header (44 bytes) - 8 bytes = 36 + data

  // Create WAV file buffer
  const buffer = Buffer.alloc(44 + dataSize);

  // WAV Header
  let offset = 0;

  // RIFF header
  buffer.write('RIFF', offset); offset += 4;
  buffer.writeUInt32LE(fileSize, offset); offset += 4;
  buffer.write('WAVE', offset); offset += 4;

  // fmt chunk
  buffer.write('fmt ', offset); offset += 4;
  buffer.writeUInt32LE(16, offset); offset += 4; // fmt chunk size
  buffer.writeUInt16LE(1, offset); offset += 2; // audio format (1 = PCM)
  buffer.writeUInt16LE(channels, offset); offset += 2; // number of channels
  buffer.writeUInt32LE(sampleRate, offset); offset += 4; // sample rate
  buffer.writeUInt32LE(sampleRate * channels * 2, offset); offset += 4; // byte rate
  buffer.writeUInt16LE(channels * 2, offset); offset += 2; // block align
  buffer.writeUInt16LE(16, offset); offset += 2; // bits per sample

  // data chunk
  buffer.write('data', offset); offset += 4;
  buffer.writeUInt32LE(dataSize, offset); offset += 4;

  // Write PCM16 data
  for (const pcm16 of pcm16Arrays) {
    for (let i = 0; i < pcm16.length; i++) {
      buffer.writeInt16LE(pcm16[i], offset);
      offset += 2;
    }
  }

  return buffer;
}

/**
 * Create merged WAV file from input and output audio chunks
 * Interleaves caller and AI audio by timestamp
 * 
 * @param inputChunks - Caller audio chunks
 * @param outputChunks - AI agent audio chunks
 * @param sampleRate - Audio sample rate
 * @returns WAV file as Buffer
 */
export function createMergedWavFile(
  inputChunks: Array<{ base64Data: string; timestamp: number }>,
  outputChunks: Array<{ base64Data: string; timestamp: number }>,
  sampleRate: number = 24000
): Buffer {
  // Merge chunks by timestamp
  const allChunks = [...inputChunks, ...outputChunks];
  allChunks.sort((a, b) => a.timestamp - b.timestamp);

  // Convert to format expected by createWavFile
  return createWavFile(
    allChunks.map(chunk => ({ base64Data: chunk.base64Data })),
    sampleRate,
    1
  );
}

/**
 * Create separate WAV files for input and output
 * 
 * @param inputChunks - Caller audio chunks
 * @param outputChunks - AI agent audio chunks
 * @param sampleRate - Audio sample rate
 * @returns Object with input and output WAV buffers
 */
export function createSeparateWavFiles(
  inputChunks: Array<{ base64Data: string }>,
  outputChunks: Array<{ base64Data: string }>,
  sampleRate: number = 24000
): { input: Buffer; output: Buffer } {
  return {
    input: createWavFile(inputChunks, sampleRate, 1),
    output: createWavFile(outputChunks, sampleRate, 1),
  };
}

