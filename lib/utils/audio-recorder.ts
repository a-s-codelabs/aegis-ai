/**
 * Audio Recorder Utility
 * 
 * Captures and buffers audio chunks from ElevenLabs WebSocket messages.
 * Supports both audio_input (caller) and audio_output (AI agent) streams.
 * Merges audio into a single WAV file when call ends.
 */

export interface AudioChunk {
  type: 'input' | 'output';
  base64Data: string;
  timestamp: number;
}

export class AudioRecorder {
  private inputChunks: AudioChunk[] = [];
  private outputChunks: AudioChunk[] = [];
  private conversationId: string;
  private startTime: number;

  constructor(conversationId: string) {
    this.conversationId = conversationId;
    this.startTime = Date.now();
  }

  /**
   * Add an audio chunk from the WebSocket message
   * Handles both audio_input (caller) and audio_output (AI agent)
   */
  addChunk(type: 'input' | 'output', base64Data: string) {
    const chunk: AudioChunk = {
      type,
      base64Data,
      timestamp: Date.now() - this.startTime,
    };

    if (type === 'input') {
      this.inputChunks.push(chunk);
    } else {
      this.outputChunks.push(chunk);
    }
  }

  /**
   * Get all audio chunks (for merging)
   */
  getAllChunks(): AudioChunk[] {
    // Merge input and output chunks by timestamp
    const allChunks = [...this.inputChunks, ...this.outputChunks];
    return allChunks.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get separate input and output chunks
   */
  getSeparateChunks(): { input: AudioChunk[]; output: AudioChunk[] } {
    return {
      input: this.inputChunks,
      output: this.outputChunks,
    };
  }

  /**
   * Get conversation duration in milliseconds
   */
  getDuration(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Clear all chunks (for cleanup)
   */
  clear() {
    this.inputChunks = [];
    this.outputChunks = [];
  }

  /**
   * Get chunk count for debugging
   */
  getStats() {
    return {
      inputChunks: this.inputChunks.length,
      outputChunks: this.outputChunks.length,
      totalChunks: this.inputChunks.length + this.outputChunks.length,
      duration: this.getDuration(),
    };
  }
}

