"use client"

import { useState, useEffect, useRef } from "react"
import { Shield, Phone, PhoneOff, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { findContactByPhoneNumber, type Contact } from "@/lib/utils/contacts"

interface Call {
  id: string;
  number: string;
  timestamp: Date;
  duration: number;
  status:
    | 'incoming'
    | 'diverted'
    | 'scam'
    | 'safe'
    | 'active'
    | 'error'
    | 'completed';
  transcript?: { speaker: string; text: string }[];
  scamScore?: number;
  scamKeywords?: string[];
}

export default function UserDashboard() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [incomingCall, setIncomingCall] = useState<string | null>(null);
  const [incomingCallContact, setIncomingCallContact] = useState<Contact | null>(null);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const isCleaningUpRef = useRef(false);
  const audioQueueRef = useRef<string[]>([]);
  const isPlayingAudioRef = useRef(false);

  const cleanup = () => {
    if (isCleaningUpRef.current) {
      console.log('[Cleanup] Already cleaning up, skipping');
      return;
    }

    isCleaningUpRef.current = true;
    console.log('[Cleanup] Starting cleanup');

    // Close WebSocket connection
    if (wsRef.current) {
      try {
        if (
          wsRef.current.readyState === WebSocket.OPEN ||
          wsRef.current.readyState === WebSocket.CONNECTING
        ) {
          wsRef.current.close(1000, 'Call ended by user');
          console.log('[Cleanup] WebSocket closed');
        }
      } catch (e) {
        console.error('[Cleanup] Error closing WebSocket:', e);
      }
      wsRef.current = null;
    }

    // Disconnect audio processor
    if (audioProcessorRef.current) {
      try {
        audioProcessorRef.current.disconnect();
        console.log('[Cleanup] Audio processor disconnected');
      } catch (e) {
        console.log('[Cleanup] Audio processor already disconnected');
      }
      audioProcessorRef.current = null;
    }

    // Disconnect audio source
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.disconnect();
        console.log('[Cleanup] Audio source disconnected');
      } catch (e) {
        console.log('[Cleanup] Audio source already disconnected');
      }
      audioSourceRef.current = null;
    }

    // Clear audio queue
    audioQueueRef.current = [];
    isPlayingAudioRef.current = false;

    // Stop all media tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
          console.log('[Cleanup] Stopped media track:', track.kind);
        } catch (e) {
          console.log('[Cleanup] Track already stopped:', track.kind);
        }
      });
      mediaStreamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      try {
        if (audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
          console.log('[Cleanup] Audio context closed');
        }
      } catch (e) {
        console.log('[Cleanup] Audio context already closed or error:', e);
      }
      audioContextRef.current = null;
    }

    isCleaningUpRef.current = false;
    console.log('[Cleanup] Cleanup completed');
  };

  useEffect(() => {
    return () => cleanup();
  }, []);

  // Simulate incoming call
  const simulateIncomingCall = () => {
    const phoneNumber = `+1 (${Math.floor(Math.random() * 900) + 100}) ${
      Math.floor(Math.random() * 900) + 100
    }-${Math.floor(Math.random() * 9000) + 1000}`;

    // Check if number is in contacts
    const contact = findContactByPhoneNumber(phoneNumber);

    // Only show popup if number is NOT in contacts
    if (!contact) {
      setIncomingCall(phoneNumber);
      setIncomingCallContact(null);
    } else {
      // Number is in contacts - don't show popup, just log it
      console.log('[Incoming Call] Number is in contacts, skipping popup:', contact.name);
      setIncomingCall(null);
      setIncomingCallContact(null);
    }
  };

  // Simulate conversation (scam or safe) for testing
  const simulateConversation = async (type: 'scam' | 'safe' = 'scam') => {
    try {
      // Fetch a simulated conversation
      const response = await fetch('/api/simulate-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, index: -1 }), // -1 for random
      });

      if (!response.ok) {
        throw new Error('Failed to fetch simulated conversation');
      }

      const data = await response.json();
      const { conversation } = data;

      // Create a call entry with the simulated transcript
      const phoneNumber = `+1 (${Math.floor(Math.random() * 900) + 100}) ${
        Math.floor(Math.random() * 900) + 100
      }-${Math.floor(Math.random() * 9000) + 1000}`;

      const newCall: Call = {
        id: Date.now().toString(),
        number: phoneNumber,
        timestamp: new Date(),
        duration: 0,
        status: 'active',
        transcript: conversation.transcript,
      };

      // Analyze the conversation for scam indicators
      const analyzeResponse = await fetch('/api/analyze-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: conversation.transcript }),
      });

      if (analyzeResponse.ok) {
        const analysis = await analyzeResponse.json();
        newCall.scamScore = analysis.scamScore;
        newCall.scamKeywords = analysis.keywords;

        // Determine status based on scam score
        if (analysis.scamScore > 60) {
          newCall.status = 'scam';
        } else {
          newCall.status = 'safe';
        }
      }

      // Set as active call and add to calls list
      setActiveCall(newCall);
      setCalls((prev) => [newCall, ...prev]);

      console.log('[Simulate] Conversation simulated:', {
        type,
        name: conversation.name,
        scamScore: newCall.scamScore,
        status: newCall.status,
      });
    } catch (error) {
      console.error('[Simulate] Error simulating conversation:', error);
      alert(
        `Failed to simulate conversation: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  };

  const handleUserAnswer = () => {
    if (!incomingCall) return;
    setIncomingCall(null);
    setIncomingCallContact(null);
  };

  const handleDivert = async () => {
    if (!incomingCall) return;

    const newCall: Call = {
      id: Date.now().toString(),
      number: incomingCall,
      timestamp: new Date(),
      duration: 0,
      status: 'active',
      transcript: [],
    };

    setActiveCall(newCall);
    setCalls((prev) => [newCall, ...prev]);
    setIncomingCall(null);
    setIncomingCallContact(null);
    setIsMonitoring(true);

    // Start AI conversation monitoring
    await startAIMonitoring(newCall);
  };

  const startAIMonitoring = async (call: Call) => {
    try {
      console.log('[AI Monitoring] Starting AI monitoring for call:', call.id);

      // Get signed URL for ElevenLabs
      const response = await fetch('/api/elevenlabs-signed-url');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to get signed URL: ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.signedUrl) {
        throw new Error(data.error || 'Failed to get signed URL from server');
      }

      console.log(
        '[AI Monitoring] Got signed URL, connecting to ElevenLabs...'
      );

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Setup audio context
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });

      // Connect to ElevenLabs WebSocket
      const ws = new WebSocket(data.signedUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[AI Monitoring] WebSocket connected to ElevenLabs');
        console.log(
          '[AI Monitoring] Starting conversation - agent will begin speaking'
        );
        // The agent should start responding automatically when it receives audio
        // Make sure audio is being sent from the microphone
      };

      ws.onmessage = async (event) => {
        // Don't process messages if we're cleaning up
        if (isCleaningUpRef.current) {
          return;
        }

        try {
          const eventData = JSON.parse(event.data);
          console.log('[AI Monitoring] Received event:', eventData.type);

          if (
            eventData.type === 'user_transcript' &&
            eventData.user_transcription_event
          ) {
            const userText = eventData.user_transcription_event.user_transcript;
            console.log('[AI Monitoring] Caller said:', userText);
            setActiveCall((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                transcript: [
                  ...(prev.transcript || []),
                  { speaker: 'Caller', text: userText },
                ],
              };
            });
          }

          if (
            eventData.type === 'agent_response' &&
            eventData.agent_response_event
          ) {
            const agentText = eventData.agent_response_event.agent_response;
            console.log('[AI Monitoring] AI Agent responded:', agentText);
            setActiveCall((prev) => {
              if (!prev) return prev;
              const newTranscript = [
                ...(prev.transcript || []),
                { speaker: 'AI Agent', text: agentText },
              ];

              // Analyze conversation for scam indicators
              analyzeConversation(call.id, newTranscript);

              return {
                ...prev,
                transcript: newTranscript,
              };
            });
          }

          if (eventData.type === 'audio' && eventData.audio_event) {
            // Only play audio if not cleaning up
            if (!isCleaningUpRef.current) {
              playAudio(eventData.audio_event.audio_base_64);
            }
          }

          // Handle other event types
          if (eventData.type === 'conversation_initiation_event') {
            console.log(
              '[AI Monitoring] Conversation initiated - agent is ready'
            );
            setActiveCall((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                status: 'active',
              };
            });
          }

          if (eventData.type === 'conversation_end_event') {
            console.log('[AI Monitoring] Conversation ended by agent');
            setActiveCall((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                status: 'completed',
              };
            });
            // Don't cleanup here, let user control it
          }

          // Handle errors from ElevenLabs
          if (eventData.type === 'error') {
            console.error('[AI Monitoring] Error from ElevenLabs:', eventData);
            setActiveCall((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                status: 'error',
              };
            });
          }
        } catch (error) {
          console.error(
            '[AI Monitoring] Error processing WebSocket message:',
            error
          );
        }
      };

      ws.onerror = (error) => {
        console.error('[AI Monitoring] WebSocket error:', error);
        // Update UI to show error
        setActiveCall((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: 'error',
          };
        });
      };

      ws.onclose = (event) => {
        console.log('[AI Monitoring] WebSocket closed', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });

        // Handle quota limit error specifically
        if (event.code === 1002 && event.reason?.includes('quota')) {
          console.error('[AI Monitoring] Quota limit exceeded');
          setActiveCall((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              status: 'error',
            };
          });
          alert(
            'ElevenLabs API quota limit exceeded. Please check your account limits or upgrade your plan.\n\n' +
              'The conversation could not continue due to quota restrictions.'
          );
          cleanup();
          setIsMonitoring(false);
          return;
        }

        // Only cleanup if it was an unexpected close
        if (!isCleaningUpRef.current && event.code !== 1000) {
          console.log(
            '[AI Monitoring] Unexpected WebSocket close, cleaning up...'
          );
          // Don't cleanup automatically - let user see what happened
          // cleanup();
          // setIsMonitoring(false);
        }
      };

      // Start sending audio
      const source = audioContextRef.current.createMediaStreamSource(stream);
      audioSourceRef.current = source;

      const processor = audioContextRef.current.createScriptProcessor(
        4096,
        1,
        1
      );
      audioProcessorRef.current = processor;

      let audioChunkCount = 0;
      processor.onaudioprocess = (e) => {
        // Check if we're cleaning up or WebSocket is closed
        if (isCleaningUpRef.current || ws.readyState !== WebSocket.OPEN) {
          return;
        }

        try {
          const inputData = e.inputBuffer.getChannelData(0);

          // Check if there's actual audio input (not silence)
          const hasAudio = inputData.some((sample) => Math.abs(sample) > 0.01);

          const pcm16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcm16[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
          }

          if (ws.readyState === WebSocket.OPEN) {
            audioChunkCount++;
            // Log every 50 chunks (roughly every second) to track audio flow
            if (audioChunkCount % 50 === 0) {
              console.log(
                `[Audio] Sent ${audioChunkCount} audio chunks to agent${
                  hasAudio ? ' (audio detected)' : ' (silence)'
                }`
              );
            }

            ws.send(
              JSON.stringify({
                user_audio_chunk: btoa(
                  String.fromCharCode(...new Uint8Array(pcm16.buffer))
                ),
              })
            );
          }
        } catch (error) {
          console.error('[Audio] Error processing audio:', error);
        }
      };

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);

      console.log('[Audio] Audio processing started');
    } catch (error) {
      console.error('[AI Monitoring] Error starting AI monitoring:', error);

      // Cleanup on error
      cleanup();
      setIsMonitoring(false);

      // Update call status to show error
      setActiveCall((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: 'diverted',
        };
      });

      // Show error to user (you can add a toast notification here)
      alert(
        `Failed to start AI monitoring: ${
          error instanceof Error ? error.message : 'Unknown error'
        }\n\nPlease check:\n1. Your ElevenLabs API key is set in environment variables\n2. Your ElevenLabs Agent ID is correct\n3. Your microphone permissions are granted`
      );
    }
  };

  const processAudioQueue = async () => {
    // Don't process if already playing or cleaning up
    if (
      isPlayingAudioRef.current ||
      isCleaningUpRef.current ||
      !audioContextRef.current
    ) {
      return;
    }

    // If queue is empty, nothing to do
    if (audioQueueRef.current.length === 0) {
      return;
    }

    // Mark as playing
    isPlayingAudioRef.current = true;

    // Get the next audio chunk from queue
    const base64Audio = audioQueueRef.current.shift();
    if (!base64Audio) {
      isPlayingAudioRef.current = false;
      return;
    }

    try {
      // Resume audio context if suspended (required by some browsers)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const audioBuffer = audioContextRef.current.createBuffer(
        1,
        float32Array.length,
        24000
      );
      audioBuffer.getChannelData(0).set(float32Array);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = 0.75;
      source.connect(audioContextRef.current.destination);

      // Add onended handler to process next chunk in queue
      source.onended = () => {
        try {
          source.disconnect();
        } catch (e) {
          // Ignore disconnect errors
        }

        // Mark as not playing and process next chunk
        isPlayingAudioRef.current = false;
        processAudioQueue();
      };

      source.start();
    } catch (error) {
      // Only log if not cleaning up (to avoid spam during cleanup)
      if (!isCleaningUpRef.current) {
        console.error('[Audio] Error playing audio:', error);
      }
      // Mark as not playing and try next chunk
      isPlayingAudioRef.current = false;
      processAudioQueue();
    }
  };

  const playAudio = (base64Audio: string) => {
    // Don't queue audio if we're cleaning up
    if (isCleaningUpRef.current || !audioContextRef.current) {
      return;
    }

    // Add to queue
    audioQueueRef.current.push(base64Audio);

    // Start processing queue if not already playing
    processAudioQueue();
  };

  const analyzeConversation = async (
    callId: string,
    transcript: { speaker: string; text: string }[]
  ) => {
    try {
      const response = await fetch('/api/analyze-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });

      if (response.ok) {
        const result = await response.json();
        setActiveCall((prev) => {
          if (!prev || prev.id !== callId) return prev;
          return {
            ...prev,
            scamScore: result.scamScore,
            scamKeywords: result.keywords,
          };
        });
      }
    } catch (error) {
      console.error('[v0] Error analyzing conversation:', error);
    }
  };

  const endCall = () => {
    if (!activeCall) return;

    console.log('[End Call] Ending call:', activeCall.id);

    // Cleanup first to stop all audio and WebSocket
    cleanup();

    const duration = Math.floor(
      (Date.now() - activeCall.timestamp.getTime()) / 1000
    );
    const isScam = (activeCall.scamScore || 0) > 60;

    const updatedCall: Call = {
      ...activeCall,
      duration,
      status: isScam ? 'scam' : 'safe',
    };

    setCalls((prev) =>
      prev.map((c) => (c.id === activeCall.id ? updatedCall : c))
    );
    setActiveCall(null);
    setIsMonitoring(false);

    console.log('[End Call] Call ended, status:', updatedCall.status);
  };

  const getStatusBadge = (status: Call['status']) => {
    switch (status) {
      case 'scam':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Scam Detected
          </Badge>
        );
      case 'safe':
        return (
          <Badge className="gap-1 bg-green-600">
            <CheckCircle className="h-3 w-3" />
            Safe
          </Badge>
        );
      case 'diverted':
        return <Badge variant="secondary">Diverted to AI</Badge>;
      case 'active':
        return (
          <Badge className="gap-1 bg-blue-600">
            <Phone className="h-3 w-3" />
            Active
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">
              Anti-Scam
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link href="/user" className="text-sm text-foreground font-medium">
              Dashboard
            </Link>
            <Link
              href="/admin"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Call Protection Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitor and manage your protected calls
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => simulateConversation('scam')}
              disabled={!!incomingCall || isMonitoring}
              variant="destructive"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Simulate Scam Call
            </Button>
            <Button
              onClick={() => simulateConversation('safe')}
              disabled={!!incomingCall || isMonitoring}
              variant="outline"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Simulate Safe Call
            </Button>
            <Button
              onClick={simulateIncomingCall}
              disabled={!!incomingCall || isMonitoring}
            >
              <Phone className="mr-2 h-4 w-4" />
              Simulate Incoming Call
            </Button>
          </div>
        </div>

        {activeCall && (
          <Card className="p-6 mb-8 bg-card border-blue-600">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Active Call Monitoring
                </h3>
                <p className="text-sm text-muted-foreground">
                  {activeCall.number}
                </p>
              </div>
              <Button variant="destructive" onClick={endCall}>
                <PhoneOff className="mr-2 h-4 w-4" />
                End Call
              </Button>
            </div>

            {activeCall.scamScore !== undefined && (
              <div className="mb-4 p-4 rounded-lg bg-background">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    Scam Risk Level
                  </span>
                  <span className="text-2xl font-bold text-foreground">
                    {activeCall.scamScore}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      activeCall.scamScore > 70
                        ? 'bg-red-600'
                        : activeCall.scamScore > 40
                        ? 'bg-yellow-600'
                        : 'bg-green-600'
                    }`}
                    style={{ width: `${activeCall.scamScore}%` }}
                  />
                </div>
                {activeCall.scamKeywords &&
                  activeCall.scamKeywords.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {activeCall.scamKeywords.map((keyword, idx) => (
                        <Badge
                          key={idx}
                          variant="destructive"
                          className="text-xs"
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  )}
              </div>
            )}

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {activeCall.transcript?.map((entry, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg ${
                    entry.speaker === 'AI Agent' ? 'bg-primary/10' : 'bg-muted'
                  }`}
                >
                  <p className="text-xs font-semibold text-foreground mb-1">
                    {entry.speaker}
                  </p>
                  <p className="text-sm text-foreground">{entry.text}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Calls
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {calls.length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Phone className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Scam Blocked
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {calls.filter((c) => c.status === 'scam').length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-600/10">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Safe Calls</p>
                <p className="text-3xl font-bold text-foreground">
                  {calls.filter((c) => c.status === 'safe').length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-600/10">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-card border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Recent Calls
          </h2>
          <div className="space-y-3">
            {calls.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No calls yet. Simulate an incoming call to get started.
              </p>
            ) : (
              calls.map((call) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-background"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {call.number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {call.timestamp.toLocaleString()} • {call.duration}s
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {call.scamScore !== undefined && (
                      <span className="text-sm text-muted-foreground">
                        Risk: {call.scamScore}%
                      </span>
                    )}
                    {getStatusBadge(call.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </main>

      {incomingCall && !incomingCallContact && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="p-8 max-w-md w-full mx-4 bg-card border-border">
            <div className="text-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
                <Phone className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Incoming Call
              </h3>
              <p className="text-2xl font-bold text-foreground mb-1">
                {incomingCall}
              </p>
              <p className="text-sm text-muted-foreground">
                Unknown number - not in contacts
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleUserAnswer}
                className="w-full h-12 bg-transparent"
                variant="outline"
              >
                <Phone className="mr-2 h-5 w-5" />
                Answer Myself
              </Button>
              <Button onClick={handleDivert} className="w-full h-12">
                <Shield className="mr-2 h-5 w-5" />
                Divert to AI Protection
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

