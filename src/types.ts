export interface Agent {
  id: string;
  name: string;
  elevenlabs_agent_id: string;
  elevenlabs_api_key: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  agent_id: string;
  started_at: string;
  ended_at: string | null;
  summary: string | null;
  status: 'active' | 'completed';
  elevenlabs_conversation_id?: string | null;
  call_successful?: string | null;
  call_summary_title?: string | null;
  evaluation_criteria_results?: any | null;
  data_collection_results?: any | null;
  analysis_fetched_at?: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
}

export type Page = 'dashboard' | 'settings' | 'conversation' | 'history';

export interface NavigationState {
  page: Page;
  agentId?: string;
  conversationId?: string;
}
