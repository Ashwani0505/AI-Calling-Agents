import { useEffect, useState } from 'react';
import { Clock, Bot, Calendar, ChevronRight, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Conversation, Agent } from '../types';

interface HistoryPageProps {
  onConversationClick: (agentId: string, conversationId: string) => void;
}

interface ConversationWithAgent extends Conversation {
  agent_name?: string;
  duration_minutes?: number;
}

export default function HistoryPage({ onConversationClick }: HistoryPageProps) {
  const [conversations, setConversations] = useState<ConversationWithAgent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data: conversationsData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .order('started_at', { ascending: false });

      if (convError) throw convError;

      const { data: agentsData, error: agentError } = await supabase
        .from('agents')
        .select('id, name');

      if (agentError) throw agentError;

      const agentMap = new Map<string, string>();
      agentsData?.forEach((agent: Agent) => {
        agentMap.set(agent.id, agent.name);
      });

      const conversationsWithAgents = conversationsData?.map(conv => {
        let durationMinutes;
        if (conv.started_at && conv.ended_at) {
          const start = new Date(conv.started_at);
          const end = new Date(conv.ended_at);
          durationMinutes = Math.round((end.getTime() - start.getTime()) / 1000 / 60);
        }

        return {
          ...conv,
          agent_name: agentMap.get(conv.agent_id) || 'Unknown Agent',
          duration_minutes: durationMinutes
        };
      });

      setConversations(conversationsWithAgents || []);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500 mb-3 font-['Orbitron'] tracking-wider uppercase">
          CONVERSATION HISTORY
        </h2>
        <p className="text-cyan-500/80 font-['Share_Tech_Mono']">&gt; ALL NEURAL LINK SESSIONS LOGGED</p>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-20 bg-gradient-to-br from-black via-slate-950 to-black border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,255,255,0.2)]">
          <Clock className="w-24 h-24 text-cyan-500/40 mx-auto mb-6 animate-pulse" />
          <h3 className="text-2xl font-bold text-cyan-400 mb-3 font-['Orbitron']">NO HISTORY FOUND</h3>
          <p className="text-cyan-500/60 font-['Share_Tech_Mono']">&gt; START A CONVERSATION TO SEE IT HERE</p>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onConversationClick(conv.agent_id, conv.id)}
              className="group w-full bg-gradient-to-br from-black via-slate-950 to-black border border-cyan-500/30 rounded-xl p-6 hover:border-cyan-400/60 transition-all hover:shadow-[0_0_40px_rgba(0,255,255,0.3)] text-left relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-cyan-500 via-blue-500 to-cyan-600 w-12 h-12 rounded-lg flex items-center justify-center shadow-[0_0_30px_rgba(0,255,255,0.4)] border border-cyan-400/50">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-cyan-300 font-['Orbitron'] uppercase">
                        {conv.agent_name}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-2 text-cyan-500/70 text-sm font-['Share_Tech_Mono']">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(conv.started_at)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-cyan-500/70 text-sm font-['Share_Tech_Mono']">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(conv.started_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-cyan-500/60 font-['Share_Tech_Mono']">STATUS:</span>
                      {conv.status === 'completed' ? (
                        <span className="flex items-center space-x-1 text-green-400 font-['Share_Tech_Mono'] font-bold">
                          <CheckCircle className="w-4 h-4" />
                          <span>COMPLETED</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 text-yellow-400 font-['Share_Tech_Mono'] font-bold">
                          <Clock className="w-4 h-4" />
                          <span>ACTIVE</span>
                        </span>
                      )}
                    </div>
                    {conv.duration_minutes !== undefined && (
                      <div className="flex items-center space-x-2">
                        <span className="text-cyan-500/60 font-['Share_Tech_Mono']">DURATION:</span>
                        <span className="text-cyan-400 font-['Share_Tech_Mono'] font-bold">
                          {conv.duration_minutes} MIN
                        </span>
                      </div>
                    )}
                    {conv.call_successful !== null && (
                      <div className="flex items-center space-x-2">
                        <span className="text-cyan-500/60 font-['Share_Tech_Mono']">OUTCOME:</span>
                        {conv.call_successful === 'true' ? (
                          <span className="flex items-center space-x-1 text-green-400 font-['Share_Tech_Mono'] font-bold">
                            <CheckCircle className="w-4 h-4" />
                            <span>SUCCESS</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1 text-red-400 font-['Share_Tech_Mono'] font-bold">
                            <XCircle className="w-4 h-4" />
                            <span>FAILED</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {conv.call_summary_title && (
                    <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3">
                      <p className="text-cyan-300/90 font-['Share_Tech_Mono'] text-sm">
                        {conv.call_summary_title}
                      </p>
                    </div>
                  )}

                  {conv.evaluation_criteria_results && (
                    <div className="flex items-center space-x-4 text-xs">
                      {Object.entries(conv.evaluation_criteria_results).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <span className="text-cyan-500/60 font-['Share_Tech_Mono'] uppercase">{key}:</span>
                          <span className="text-cyan-400 font-['Share_Tech_Mono'] font-bold">{value}/10</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="ml-4 text-cyan-400 group-hover:text-cyan-300 transition-colors">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
