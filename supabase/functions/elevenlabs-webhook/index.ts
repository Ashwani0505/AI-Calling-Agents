import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

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

    const payload = await req.json();
    console.log('Received ElevenLabs webhook:', JSON.stringify(payload, null, 2));

    const conversationId = payload.conversation_id;
    const analysis = payload.analysis || {};

    if (!conversationId) {
      console.error('No conversation_id in webhook payload');
      return new Response(
        JSON.stringify({ error: 'Missing conversation_id' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: conversation, error: findError } = await supabase
      .from('conversations')
      .select('id')
      .eq('elevenlabs_conversation_id', conversationId)
      .maybeSingle();

    if (findError) {
      console.error('Error finding conversation:', findError);
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!conversation) {
      console.log('Conversation not found for ElevenLabs ID:', conversationId);
      return new Response(
        JSON.stringify({ error: 'Conversation not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

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
      .eq('id', conversation.id);

    if (updateError) {
      console.error('Error updating conversation:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update conversation' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Successfully updated conversation:', conversation.id);

    return new Response(
      JSON.stringify({ success: true, message: 'Analysis updated' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});