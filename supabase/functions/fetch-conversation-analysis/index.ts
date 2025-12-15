import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RequestBody {
  conversationId: string;
  elevenLabsConversationId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { conversationId, elevenLabsConversationId }: RequestBody = await req.json();

    console.log('Fetching analysis for:', { conversationId, elevenLabsConversationId });

    if (!conversationId || !elevenLabsConversationId) {
      return new Response(
        JSON.stringify({ error: 'Conversation ID and ElevenLabs Conversation ID are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('agent_id')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return new Response(
        JSON.stringify({ error: 'Conversation not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('elevenlabs_api_key')
      .eq('id', conversation.agent_id)
      .single();

    if (agentError || !agent) {
      return new Response(
        JSON.stringify({ error: 'Agent not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversations/${elevenLabsConversationId}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': agent.elevenlabs_api_key,
        },
      }
    );

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text();
      console.error('ElevenLabs API error:', errorText);
      return new Response(
        JSON.stringify({
          error: 'Failed to fetch conversation analysis from ElevenLabs',
          details: errorText
        }),
        {
          status: elevenLabsResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const conversationData = await elevenLabsResponse.json();
    const analysis = conversationData.analysis || {};

    const updateData = {
      summary: analysis.transcript_summary || null,
      call_successful: analysis.call_successful || null,
      call_summary_title: analysis.call_summary_title || null,
      evaluation_criteria_results: analysis.evaluation_criteria_results || null,
      data_collection_results: analysis.data_collection_results || null,
      analysis_fetched_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from('conversations')
      .update(updateData)
      .eq('id', conversationId);

    if (updateError) {
      console.error('Error updating conversation:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update conversation with analysis' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: updateData
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
