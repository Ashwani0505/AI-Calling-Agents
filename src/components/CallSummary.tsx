import { useState } from 'react';
import { Clock, MessageSquare, TrendingUp, RefreshCw, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import type { Conversation, Message } from '../types';

interface CallSummaryProps {
  conversation: Conversation;
  messages: Message[];
  onRefresh?: () => void;
}

export default function CallSummary({ conversation, messages, onRefresh }: CallSummaryProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshAnalysis = async () => {
    if (!onRefresh) return;

    if (!conversation.elevenlabs_conversation_id) {
      alert('Unable to refresh: Conversation ID not found. This may happen if the call was interrupted during connection.');
      return;
    }

    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };
  const calculateDuration = () => {
    if (!conversation.started_at || !conversation.ended_at) return '0m 0s';
    const start = new Date(conversation.started_at);
    const end = new Date(conversation.ended_at);
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const userMessages = messages.filter((m) => m.role === 'user');
  const agentMessages = messages.filter((m) => m.role === 'agent');

  return (
    <div className="relative bg-gradient-to-br from-black via-slate-950 to-black border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,255,255,0.2)] overflow-hidden">
      <div className="scanline" />
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5" />

      <div className="relative flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-cyan-500 via-blue-500 to-cyan-600 w-12 h-12 rounded-lg flex items-center justify-center shadow-[0_0_30px_rgba(0,255,255,0.4)] border-2 border-cyan-400/50">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-['Orbitron'] uppercase tracking-wide">
              SESSION ANALYTICS
            </h3>
            <p className="text-sm text-cyan-500/80 font-['Share_Tech_Mono']">&gt; TRANSMISSION COMPLETE</p>
          </div>
        </div>
        {onRefresh && (
          <button
            onClick={handleRefreshAnalysis}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all shadow-[0_0_20px_rgba(0,255,255,0.3)] border border-cyan-400/50 disabled:opacity-50 disabled:cursor-not-allowed font-['Share_Tech_Mono'] text-sm uppercase"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'SYNCING...' : 'REFRESH'}</span>
          </button>
        )}
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-black/60 border border-cyan-500/30 rounded-xl p-5 backdrop-blur-sm hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] transition-all">
          <div className="flex items-center space-x-3 mb-3">
            <Clock className="w-6 h-6 text-cyan-400" />
            <span className="text-sm text-cyan-500/80 font-['Share_Tech_Mono'] uppercase">Duration</span>
          </div>
          <p className="text-3xl font-bold text-cyan-300 font-['Orbitron']">{calculateDuration()}</p>
        </div>

        <div className="bg-black/60 border border-cyan-500/30 rounded-xl p-5 backdrop-blur-sm hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] transition-all">
          <div className="flex items-center space-x-3 mb-3">
            <MessageSquare className="w-6 h-6 text-cyan-400" />
            <span className="text-sm text-cyan-500/80 font-['Share_Tech_Mono'] uppercase">Messages</span>
          </div>
          <p className="text-3xl font-bold text-cyan-300 font-['Orbitron']">{messages.length}</p>
          <p className="text-xs text-cyan-600 mt-2 font-['Share_Tech_Mono']">
            {userMessages.length} USER / {agentMessages.length} AI
          </p>
        </div>

        {conversation.call_successful && (
          <div className="bg-black/60 border border-cyan-500/30 rounded-xl p-5 backdrop-blur-sm hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] transition-all">
            <div className="flex items-center space-x-3 mb-3">
              {conversation.call_successful === 'success' && <CheckCircle2 className="w-6 h-6 text-green-400" />}
              {conversation.call_successful === 'failure' && <XCircle className="w-6 h-6 text-red-400" />}
              {conversation.call_successful === 'unknown' && <HelpCircle className="w-6 h-6 text-yellow-400" />}
              <span className="text-sm text-cyan-500/80 font-['Share_Tech_Mono'] uppercase">Status</span>
            </div>
            <p className={`text-2xl font-bold font-['Orbitron'] uppercase ${
              conversation.call_successful === 'success' ? 'text-green-400' :
              conversation.call_successful === 'failure' ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {conversation.call_successful}
            </p>
          </div>
        )}
      </div>

      <div className="relative bg-black/60 border border-cyan-500/30 rounded-xl p-5 backdrop-blur-sm mb-6">
        <h4 className="text-sm font-bold text-cyan-400 mb-3 font-['Orbitron'] uppercase tracking-wider">
          {conversation.call_summary_title || 'Session Summary'}
        </h4>
        {conversation.summary ? (
          <p className="text-cyan-100 leading-relaxed font-['Rajdhani'] font-medium">{conversation.summary}</p>
        ) : (
          <p className="text-cyan-400/60 italic font-['Rajdhani']">No summary available</p>
        )}
        {!conversation.analysis_fetched_at && !conversation.call_successful && conversation.elevenlabs_conversation_id && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-xs text-yellow-400 font-['Share_Tech_Mono']">
              Waiting for advanced analysis from ElevenLabs. Click REFRESH to check for updates.
            </p>
          </div>
        )}
        {!conversation.elevenlabs_conversation_id && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-xs text-red-400 font-['Share_Tech_Mono']">
              Unable to fetch advanced analysis: Session ID not captured. This may occur if the connection was interrupted.
            </p>
          </div>
        )}
        {conversation.analysis_fetched_at && (
          <p className="text-xs text-cyan-600/60 mt-3 font-['Share_Tech_Mono']">
            Last synced: {new Date(conversation.analysis_fetched_at).toLocaleString()}
          </p>
        )}
      </div>

      {conversation.evaluation_criteria_results && Object.keys(conversation.evaluation_criteria_results).length > 0 && (
        <div className="relative bg-black/60 border border-cyan-500/30 rounded-xl p-5 backdrop-blur-sm mb-6">
          <h4 className="text-sm font-bold text-cyan-400 mb-4 font-['Orbitron'] uppercase tracking-wider">Evaluation Criteria</h4>
          <div className="space-y-3">
            {Object.entries(conversation.evaluation_criteria_results).map(([key, value]: [string, any]) => (
              <div key={key} className="bg-black/40 border border-cyan-500/20 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-cyan-300 font-['Share_Tech_Mono'] font-semibold">{key}</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    value.result === 'pass' ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                    value.result === 'fail' ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
                    'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                  }`}>
                    {value.result?.toUpperCase() || 'N/A'}
                  </span>
                </div>
                {value.rationale && (
                  <p className="text-xs text-cyan-200/70 font-['Rajdhani']">{value.rationale}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {conversation.data_collection_results && Object.keys(conversation.data_collection_results).length > 0 && (
        <div className="relative bg-black/60 border border-cyan-500/30 rounded-xl p-5 backdrop-blur-sm mb-6">
          <h4 className="text-sm font-bold text-cyan-400 mb-4 font-['Orbitron'] uppercase tracking-wider">Collected Data</h4>
          <div className="space-y-3">
            {Object.entries(conversation.data_collection_results).map(([key, value]: [string, any]) => (
              <div key={key} className="bg-black/40 border border-cyan-500/20 rounded-lg p-3">
                <span className="text-sm text-cyan-300 font-['Share_Tech_Mono'] font-semibold block mb-2">{key}</span>
                <div className="text-cyan-100 font-['Rajdhani']">
                  {typeof value === 'object' ? (
                    <div className="space-y-1">
                      {value.value && <p className="text-sm">{value.value}</p>}
                      {value.reasoning && <p className="text-xs text-cyan-200/70 mt-1">{value.reasoning}</p>}
                    </div>
                  ) : (
                    <p className="text-sm">{String(value)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div className="relative mt-6">
          <h4 className="text-sm font-bold text-cyan-400 mb-4 font-['Orbitron'] uppercase tracking-wider">Transmission Log</h4>
          <div className="space-y-3">
            <div className="bg-black/60 border border-cyan-500/30 rounded-lg p-4 flex justify-between items-center backdrop-blur-sm hover:border-cyan-400/50 transition-all">
              <span className="text-sm text-cyan-500 font-['Share_Tech_Mono'] uppercase">First Signal</span>
              <span className="text-sm text-cyan-300 font-['Share_Tech_Mono'] font-bold">
                {new Date(messages[0].timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="bg-black/60 border border-cyan-500/30 rounded-lg p-4 flex justify-between items-center backdrop-blur-sm hover:border-cyan-400/50 transition-all">
              <span className="text-sm text-cyan-500 font-['Share_Tech_Mono'] uppercase">Final Signal</span>
              <span className="text-sm text-cyan-300 font-['Share_Tech_Mono'] font-bold">
                {new Date(messages[messages.length - 1].timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="bg-black/60 border border-cyan-500/30 rounded-lg p-4 flex justify-between items-center backdrop-blur-sm hover:border-cyan-400/50 transition-all">
              <span className="text-sm text-cyan-500 font-['Share_Tech_Mono'] uppercase">Avg Response</span>
              <span className="text-sm text-cyan-300 font-['Share_Tech_Mono'] font-bold">~2s</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
