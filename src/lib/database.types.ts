export interface Database {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string;
          name: string;
          elevenlabs_agent_id: string;
          elevenlabs_api_key: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          elevenlabs_agent_id: string;
          elevenlabs_api_key: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          elevenlabs_agent_id?: string;
          elevenlabs_api_key?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          agent_id: string;
          started_at: string;
          ended_at: string | null;
          summary: string | null;
          status: string;
          elevenlabs_conversation_id: string | null;
          call_successful: string | null;
          call_summary_title: string | null;
          evaluation_criteria_results: any | null;
          data_collection_results: any | null;
          analysis_fetched_at: string | null;
        };
        Insert: {
          id?: string;
          agent_id: string;
          started_at?: string;
          ended_at?: string | null;
          summary?: string | null;
          status?: string;
          elevenlabs_conversation_id?: string | null;
          call_successful?: string | null;
          call_summary_title?: string | null;
          evaluation_criteria_results?: any | null;
          data_collection_results?: any | null;
          analysis_fetched_at?: string | null;
        };
        Update: {
          id?: string;
          agent_id?: string;
          started_at?: string;
          ended_at?: string | null;
          summary?: string | null;
          status?: string;
          elevenlabs_conversation_id?: string | null;
          call_successful?: string | null;
          call_summary_title?: string | null;
          evaluation_criteria_results?: any | null;
          data_collection_results?: any | null;
          analysis_fetched_at?: string | null;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: string;
          content: string;
          timestamp: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: string;
          content: string;
          timestamp?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: string;
          content?: string;
          timestamp?: string;
        };
      };
    };
  };
}
