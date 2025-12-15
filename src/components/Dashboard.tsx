import { useEffect, useState } from 'react';
import { Bot, Plus, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Agent } from '../types';

interface DashboardProps {
  onAgentClick: (agentId: string, conversationId: string) => void;
}

export default function Dashboard({ onAgentClick }: DashboardProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentClick = async (agentId: string) => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          agent_id: agentId,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      onAgentClick(agentId, data.id);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500 mb-3 font-['Orbitron'] tracking-wider uppercase">
          NEURAL AGENTS
        </h2>
        <p className="text-cyan-500/80 font-['Share_Tech_Mono']">&gt; SELECT AN AI ENTITY TO INITIALIZE CONNECTION</p>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-20 bg-gradient-to-br from-black via-slate-950 to-black border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,255,255,0.2)]">
          <Bot className="w-24 h-24 text-cyan-500/40 mx-auto mb-6 animate-pulse" />
          <h3 className="text-2xl font-bold text-cyan-400 mb-3 font-['Orbitron']">NO AGENTS DETECTED</h3>
          <p className="text-cyan-500/60 mb-8 font-['Share_Tech_Mono']">&gt; CONFIGURE YOUR FIRST NEURAL AGENT IN SETTINGS</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all shadow-[0_0_30px_rgba(0,255,255,0.4)] border border-cyan-400/50 font-['Orbitron'] font-bold uppercase tracking-wider"
          >
            <Plus className="w-6 h-6" />
            <span>ACCESS SETTINGS</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => handleAgentClick(agent.id)}
              className="group relative bg-gradient-to-br from-black via-slate-950 to-black border border-cyan-500/30 rounded-2xl p-8 hover:border-cyan-400/60 transition-all hover:shadow-[0_0_40px_rgba(0,255,255,0.3)] hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="scanline opacity-0 group-hover:opacity-100" />

              <div className="relative">
                <div className="relative bg-gradient-to-br from-cyan-500 via-blue-500 to-cyan-600 w-20 h-20 rounded-xl flex items-center justify-center mb-5 shadow-[0_0_40px_rgba(0,255,255,0.4)] border-2 border-cyan-400/50 group-hover:shadow-[0_0_60px_rgba(0,255,255,0.6)]">
                  <Bot className="w-10 h-10 text-white" />
                  <div className="absolute -inset-2 border-2 border-cyan-400/30 rounded-xl animate-ping" />
                </div>

                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-3 font-['Orbitron'] uppercase">{agent.name}</h3>

                <div className="flex items-center space-x-3 text-sm">
                  <div className="relative w-3 h-3">
                    <div className="absolute inset-0 bg-green-400 rounded-full animate-ping" />
                    <div className="relative w-3 h-3 bg-green-400 rounded-full shadow-[0_0_10px_rgba(0,255,0,0.6)]" />
                  </div>
                  <span className="text-green-400 font-['Share_Tech_Mono'] font-bold uppercase">ONLINE</span>
                </div>
              </div>

              <div className="absolute top-4 right-4">
                <div className="w-3 h-3 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_15px_rgba(0,255,255,0.8)] animate-pulse" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
