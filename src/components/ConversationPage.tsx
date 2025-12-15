import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, PhoneOff, Radio, Zap, Loader2 } from 'lucide-react';
import { Conversation as ElevenLabsConversation } from '@elevenlabs/client';
import { supabase } from '../lib/supabase';
import type { Agent, Conversation, Message } from '../types';
import VoiceAnimation from './VoiceAnimation';
import ChatInterface from './ChatInterface';
import CallSummary from './CallSummary';
import TypingStatus from './TypingStatus';

interface ConversationPageProps {
  agentId: string;
  conversationId?: string;
  onBack: () => void;
}

export default function ConversationPage({ agentId, conversationId, onBack }: ConversationPageProps) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const elevenLabsConversationRef = useRef<any>(null);
  const messagesRef = useRef<Message[]>([]);
  const conversationRef = useRef<Conversation | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);

  useEffect(() => {
    loadData();

    return () => {
      if (elevenLabsConversationRef.current) {
        try {
          elevenLabsConversationRef.current.endSession();
        } catch (error) {
          console.error('Error ending session:', error);
        }
      }
    };
  }, [agentId, conversationId]);

  const loadData = async () => {
    try {
      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .single();

      if (agentError) throw agentError;
      setAgent(agentData);

      if (conversationId) {
        const { data: convData, error: convError } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .single();

        if (convError) throw convError;
        setConversation(convData);

        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('timestamp', { ascending: true });

        if (messagesError) throw messagesError;
        setMessages(messagesData || []);

        if (convData.status === 'completed') {
          setShowSummary(true);
          setIsActive(false);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startConversation = async () => {
    if (!agent || !conversation || isActive) return;

    setIsConnecting(true);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-conversation-token`;
      const tokenResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agentId: agent.id }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(errorData.error || 'Failed to get conversation token');
      }

      const { signedUrl } = await tokenResponse.json();

      const sessionPromise = ElevenLabsConversation.startSession({
        signedUrl,
        onConnect: async () => {
          setIsActive(true);
          setIsConnecting(false);

          if (elevenLabsConversationRef.current) {
            try {
              const convId = elevenLabsConversationRef.current.getId();
              console.log('ElevenLabs Conversation ID from onConnect:', convId);

              if (convId && conversationRef.current) {
                const { error: updateError } = await supabase
                  .from('conversations')
                  .update({ elevenlabs_conversation_id: convId })
                  .eq('id', conversationRef.current.id);

                if (updateError) {
                  console.error('Failed to save ElevenLabs conversation ID:', updateError);
                } else {
                  console.log('Successfully saved ElevenLabs conversation ID:', convId);
                  const updatedConv = { ...conversationRef.current, elevenlabs_conversation_id: convId };
                  setConversation(updatedConv);
                  conversationRef.current = updatedConv;
                }
              } else {
                console.warn('No ElevenLabs conversation ID available in onConnect');
              }
            } catch (error) {
              console.error('Error getting conversation ID in onConnect:', error);
            }
          }
        },
        onDisconnect: async () => {
          setIsActive(false);
          setIsSpeaking(false);

          if (conversationRef.current && conversationRef.current.status !== 'completed') {
            await handleEndCallInternal();
          }
        },
        onMessage: async (message) => {
          handleNewMessage(message.source === 'ai' ? 'agent' : 'user', message.message);

          if (elevenLabsConversationRef.current && conversationRef.current && !conversationRef.current.elevenlabs_conversation_id) {
            try {
              const convId = elevenLabsConversationRef.current.getId();
              console.log('ElevenLabs Conversation ID from onMessage:', convId);

              if (convId) {
                const { error: updateError } = await supabase
                  .from('conversations')
                  .update({ elevenlabs_conversation_id: convId })
                  .eq('id', conversationRef.current.id);

                if (updateError) {
                  console.error('Failed to save ElevenLabs conversation ID in onMessage:', updateError);
                } else {
                  console.log('Successfully saved ElevenLabs conversation ID in onMessage:', convId);
                  const updatedConv = { ...conversationRef.current, elevenlabs_conversation_id: convId };
                  setConversation(updatedConv);
                  conversationRef.current = updatedConv;
                }
              }
            } catch (error) {
              console.error('Error getting conversation ID in onMessage:', error);
            }
          }
        },
        onError: (error) => {
          console.error('ElevenLabs error:', error);
          setIsConnecting(false);
          setIsActive(false);
        },
      });

      const elevenLabsConversationInstance = await sessionPromise;
      elevenLabsConversationRef.current = elevenLabsConversationInstance;
      elevenLabsConversationInstance.setVolume(1.0);

    } catch (error) {
      console.error('Error starting conversation:', error);
      setIsConnecting(false);
      alert('Failed to start conversation. Please check your Agent ID and API Key.');
    }
  };

  const handleNewMessage = async (role: 'user' | 'agent', content: string) => {
    if (!conversation || !content.trim()) return;

    const existingMessage = messages.find((m) => m.content === content && m.role === role);
    if (existingMessage) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          role,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      setMessages((prev) => [...prev, data]);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!conversation) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          role: 'user',
          content,
        })
        .select()
        .single();

      if (error) throw error;
      setMessages((prev) => [...prev, data]);

      if (elevenLabsConversationRef.current && isActive) {
        elevenLabsConversationRef.current.sendTextMessage(content);
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const handleEndCallInternal = async () => {
    const currentConversation = conversationRef.current;
    if (!currentConversation) return;

    try {
      const summary = generateSummary(messagesRef.current);

      const { error } = await supabase
        .from('conversations')
        .update({
          ended_at: new Date().toISOString(),
          status: 'completed',
          summary,
        })
        .eq('id', currentConversation.id);

      if (error) throw error;

      setConversation({
        ...currentConversation,
        ended_at: new Date().toISOString(),
        status: 'completed',
        summary,
      });

      setIsActive(false);
      setShowSummary(true);
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const handleEndCall = async () => {
    if (!conversation) return;

    if (elevenLabsConversationRef.current) {
      try {
        await elevenLabsConversationRef.current.endSession();
      } catch (error) {
        console.error('Error ending session:', error);
      }
    }

    await handleEndCallInternal();
  };

  const generateSummary = (msgs: Message[]): string => {
    if (msgs.length === 0) return 'No messages in this conversation.';

    const topics: string[] = [];
    const userMsgs = msgs.filter((m) => m.role === 'user');

    if (userMsgs.length > 0) {
      topics.push(`User asked ${userMsgs.length} question${userMsgs.length > 1 ? 's' : ''}`);
    }

    topics.push(`Total of ${msgs.length} messages exchanged`);

    return topics.join('. ') + '.';
  };

  const handleRefreshAnalysis = async () => {
    if (!conversation?.elevenlabs_conversation_id) {
      alert('Unable to refresh: Conversation ID not found. This may happen if the call was interrupted during connection.');
      return;
    }

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-conversation-analysis`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: conversation.id,
          elevenLabsConversationId: conversation.elevenlabs_conversation_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Analysis fetch error:', errorData);

        if (response.status === 404) {
          alert('Analysis not ready yet. ElevenLabs is still processing this conversation. Please wait a minute and try again.');
        } else {
          alert(`Failed to fetch analysis: ${errorData.error || 'Unknown error'}. Check console for details.`);
        }
        return;
      }

      const { analysis } = await response.json();

      setConversation({
        ...conversation,
        ...analysis,
      });

      await loadData();
    } catch (error) {
      console.error('Error refreshing analysis:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-slate-950 to-black">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-cyan-500 font-['Share_Tech_Mono'] text-lg">&gt; LOADING NEURAL AGENT...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-slate-950 to-black">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4 font-['Orbitron'] uppercase">Agent Not Found</p>
          <button
            onClick={onBack}
            className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all shadow-[0_0_30px_rgba(0,255,255,0.4)] border border-cyan-400/50 font-['Orbitron'] font-bold uppercase tracking-wider"
          >
            Return to Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />

      <div className="relative bg-black/60 backdrop-blur-sm border-b border-cyan-500/20 shadow-[0_0_30px_rgba(0,255,255,0.1)] px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={onBack}
              className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-all border border-cyan-500/30 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500 tracking-wider uppercase glitch">
                  {agent.name}
                </h1>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(0,255,255,0.8)]" />
              </div>
              <div className="mt-1 font-['Share_Tech_Mono'] text-sm">
                {isActive ? (
                  <span className="text-green-400 flex items-center space-x-2">
                    <Radio className="w-4 h-4 animate-pulse" />
                    <span>NEURAL LINK ACTIVE</span>
                  </span>
                ) : isConnecting ? (
                  <span className="text-yellow-400 flex items-center space-x-2">
                    <Zap className="w-4 h-4 animate-pulse" />
                    <span>ESTABLISHING CONNECTION...</span>
                  </span>
                ) : (
                  <span className="text-cyan-500">READY FOR INTERFACE</span>
                )}
              </div>
            </div>
          </div>

          {isActive && !showSummary && (
            <button
              onClick={handleEndCall}
              className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg hover:from-red-700 hover:to-red-900 transition-all shadow-[0_0_30px_rgba(255,0,0,0.4)] border border-red-500/50 hover:shadow-[0_0_40px_rgba(255,0,0,0.6)] font-['Orbitron'] font-semibold uppercase tracking-wider"
            >
              <PhoneOff className="w-5 h-5" />
              <span>TERMINATE</span>
            </button>
          )}
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div className="relative bg-gradient-to-br from-black via-slate-950 to-black border border-cyan-500/30 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,255,255,0.2)]" style={{ height: '500px' }}>
              <div className="scanline" />

              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5" />

              <div className="absolute inset-0">
                <VoiceAnimation isActive={isActive && isSpeaking} />
              </div>

              {!isActive && !showSummary && (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-8">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-cyan-500/20 pulse-ring" />
                    <div className="absolute inset-0 rounded-full bg-cyan-500/20 pulse-ring" style={{ animationDelay: '1s' }} />
                    <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 via-blue-500 to-cyan-600 flex items-center justify-center border-4 border-cyan-400/50 shadow-[0_0_60px_rgba(0,255,255,0.6)]">
                      <Radio className="w-16 h-16 text-white animate-pulse" />
                    </div>
                  </div>

                  {isConnecting ? (
                    <div className="bg-black/80 backdrop-blur-sm px-8 py-4 rounded-lg border border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
                      <TypingStatus
                        messages={[
                          'INITIALIZING NEURAL INTERFACE...',
                          'ESTABLISHING QUANTUM LINK...',
                          'SYNCHRONIZING AI MATRIX...',
                          'LOADING COGNITIVE PROTOCOLS...',
                          'CALIBRATING VOICE SYNTHESIS...',
                        ]}
                        speed={40}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={startConversation}
                      className="group relative px-10 py-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 text-white rounded-lg transition-all shadow-[0_0_40px_rgba(0,255,255,0.4)] border border-cyan-400/50 hover:shadow-[0_0_60px_rgba(0,255,255,0.6)] hover:scale-105 font-['Orbitron'] font-bold text-lg uppercase tracking-widest overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                      <span className="relative flex items-center space-x-3">
                        <Radio className="w-6 h-6" />
                        <span>INITIATE LINK</span>
                      </span>
                    </button>
                  )}
                </div>
              )}

              {isActive && !showSummary && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                  <div className="bg-black/90 backdrop-blur-sm px-8 py-4 rounded-lg border border-green-500/50 shadow-[0_0_30px_rgba(0,255,0,0.3)] flex items-center space-x-4">
                    <div className="relative w-4 h-4">
                      <div className="absolute inset-0 bg-green-400 rounded-full animate-ping" />
                      <div className="relative w-4 h-4 bg-green-400 rounded-full" />
                    </div>
                    <span className="text-green-400 font-['Share_Tech_Mono'] font-bold tracking-wider uppercase">
                      VOICE CHANNEL ACTIVE
                    </span>
                  </div>
                </div>
              )}
            </div>

            {showSummary && conversation && (
              <CallSummary
                conversation={conversation}
                messages={messages}
                onRefresh={handleRefreshAnalysis}
              />
            )}
          </div>

          <div style={{ height: showSummary ? 'auto' : '500px' }}>
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isActive={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
