// functions/api/newsletter.js
// Debug version with better error handling

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Debug: Check if API key exists
    console.log('API Key exists:', !!env.PLUNK_API_KEY);
    
    if (!env.PLUNK_API_KEY) {
      console.error('PLUNK_API_KEY not found in environment');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Server configuration error' 
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    const formData = await request.formData();
    const email = formData.get('email');
    const source = formData.get('source') || 'website';

    console.log('Email received:', email);

    if (!email || !isValidEmail(email)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Please provide a valid email address' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Simplified: Just add contact as subscribed (remove double opt-in for now)
    console.log('Calling Plunk API...');
    const plunkResponse = await fetch('https://api.useplunk.com/v1/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.PLUNK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        subscribed: true,
        data: {
          source: source,
          subscribed_at: new Date().toISOString(),
        }
      })
    });

    console.log('Plunk response status:', plunkResponse.status);
    
    const plunkData = await plunkResponse.json();
    console.log('Plunk response data:', plunkData);

    if (plunkResponse.ok) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Successfully subscribed to newsletter!' 
        }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    } else if (plunkResponse.status === 409 || plunkResponse.status === 400) {
      const errorMessage = plunkData.error || plunkData.message || '';
      
      if (errorMessage.toLowerCase().includes('already exists') || 
          errorMessage.toLowerCase().includes('duplicate') ||
          plunkResponse.status === 409) {
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'You are already subscribed!',
            already_subscribed: true 
          }),
          { 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `API Error: ${errorMessage}` 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    } else {
      console.error('Plunk API error:', plunkData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Server error: ${plunkData.error || 'Unknown error'}` 
        }),
        { 
          status: plunkResponse.status,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Exception: ${error.message}` 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}