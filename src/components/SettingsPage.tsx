import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, Bot, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Agent } from '../types';

export default function SettingsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState({ name: '', elevenlabs_agent_id: '', elevenlabs_api_key: '' });
  const [saving, setSaving] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.elevenlabs_agent_id.trim() || !formData.elevenlabs_api_key.trim()) return;

    setSaving(true);
    try {
      if (editingAgent) {
        const { error } = await supabase
          .from('agents')
          .update({
            name: formData.name,
            elevenlabs_agent_id: formData.elevenlabs_agent_id,
            elevenlabs_api_key: formData.elevenlabs_api_key,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingAgent.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('agents')
          .insert({
            name: formData.name,
            elevenlabs_agent_id: formData.elevenlabs_agent_id,
            elevenlabs_api_key: formData.elevenlabs_api_key,
          });

        if (error) throw error;
      }

      setFormData({ name: '', elevenlabs_agent_id: '', elevenlabs_api_key: '' });
      setShowForm(false);
      setEditingAgent(null);
      loadAgents();
    } catch (error) {
      console.error('Error saving agent:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (agent: Agent) => {
    console.log('Edit clicked for agent:', agent.id);
    setEditingAgent(agent);
    setFormData({ name: agent.name, elevenlabs_agent_id: agent.elevenlabs_agent_id, elevenlabs_api_key: agent.elevenlabs_api_key });
    setShowForm(true);
  };

  const handleDelete = async (agentId: string) => {
    console.log('Delete clicked for agent:', agentId);
    if (!confirm('Are you sure you want to delete this agent? This will also delete all associated conversations.')) {
      return;
    }

    try {
      const { error } = await supabase.from('agents').delete().eq('id', agentId);
      if (error) throw error;
      loadAgents();
    } catch (error) {
      console.error('Error deleting agent:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAgent(null);
    setFormData({ name: '', elevenlabs_agent_id: '', elevenlabs_api_key: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Agent Settings</h2>
          <p className="text-slate-400">Manage your ElevenLabs voice agents</p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Add Agent button clicked');
              setShowForm(true);
            }}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/25"
            style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}
          >
            <Plus className="w-5 h-5" />
            <span>Add Agent</span>
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 mb-8" style={{ position: 'relative', zIndex: 20, pointerEvents: 'auto' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              {editingAgent ? 'Edit Agent' : 'Add New Agent'}
            </h3>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Cancel clicked');
                handleCancel();
              }}
              className="text-slate-400 hover:text-white transition-colors"
              style={{ pointerEvents: 'auto' }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={(e) => {
            console.log('Form submitted');
            handleSubmit(e);
          }} className="space-y-6" style={{ pointerEvents: 'auto' }}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Agent Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => {
                  console.log('Name changed:', e.target.value);
                  setFormData({ ...formData, name: e.target.value });
                }}
                placeholder="e.g., Customer Support Agent"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                style={{ pointerEvents: 'auto' }}
                required
              />
            </div>

            <div>
              <label htmlFor="elevenlabs_agent_id" className="block text-sm font-medium text-slate-300 mb-2">
                ElevenLabs Agent ID
              </label>
              <input
                type="text"
                id="elevenlabs_agent_id"
                value={formData.elevenlabs_agent_id}
                onChange={(e) => {
                  console.log('Agent ID changed:', e.target.value);
                  setFormData({ ...formData, elevenlabs_agent_id: e.target.value });
                }}
                placeholder="e.g., KVY8nZJPWxqz9SDFAxxxxx"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                style={{ pointerEvents: 'auto' }}
                required
              />
              <p className="mt-2 text-xs text-slate-500">
                Find your Agent ID in the ElevenLabs Conversational AI dashboard
              </p>
            </div>

            <div>
              <label htmlFor="elevenlabs_api_key" className="block text-sm font-medium text-slate-300 mb-2">
                ElevenLabs API Key
              </label>
              <input
                type="password"
                id="elevenlabs_api_key"
                value={formData.elevenlabs_api_key}
                onChange={(e) => {
                  console.log('API Key changed');
                  setFormData({ ...formData, elevenlabs_api_key: e.target.value });
                }}
                placeholder="sk_..."
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                style={{ pointerEvents: 'auto' }}
                required
              />
              <p className="mt-2 text-xs text-slate-500">
                Get your API key from the ElevenLabs API Keys page
              </p>
            </div>

            <div className="flex space-x-4" style={{ pointerEvents: 'auto' }}>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ pointerEvents: 'auto' }}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>{editingAgent ? 'Update Agent' : 'Create Agent'}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Cancel button clicked');
                  handleCancel();
                }}
                className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                style={{ pointerEvents: 'auto' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {agents.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl">
            <Bot className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No agents yet. Click "Add Agent" to create your first one.</p>
          </div>
        ) : (
          agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1 min-w-0">
                  <div className="bg-gradient-to-br from-cyan-500 to-blue-500 w-12 h-12 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/25 flex-shrink-0">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-semibold text-white mb-1">{agent.name}</h4>
                    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 mt-2">
                      <p className="text-xs text-slate-500 mb-1">Agent ID:</p>
                      <p className="text-xs text-slate-300 font-mono break-all">
                        {agent.elevenlabs_agent_id}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Created {new Date(agent.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4 flex-shrink-0" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEdit(agent);
                    }}
                    className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-700/50 rounded-lg transition-all cursor-pointer"
                    title="Edit agent"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(agent.id);
                    }}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-all cursor-pointer"
                    title="Delete agent"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
