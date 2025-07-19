// functions/api/newsletter.js
// Cloudflare Worker function for handling newsletter subscriptions with proper double opt-in

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

    const formData = await request.formData();
    const email = formData.get('email');
    const source = formData.get('source') || 'website';

    if (!email || !isValidEmail(email)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Please provide a valid email address' 
        }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        }
      );
    }

    // Step 1: Track the signup event (this creates contact as unsubscribed)
    // This will trigger the double opt-in automation in Plunk
    const trackResponse = await fetch('https://api.useplunk.com/v1/track', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.PLUNK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'newsletter-signup', // This event should trigger your double opt-in action
        email: email,
        data: {
          source: source,
          signup_date: new Date().toISOString(),
        }
      })
    });

    if (trackResponse.ok) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Please check your email to confirm your subscription!' 
        }),
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        }
      );
    } else {
      const errorData = await trackResponse.json();
      console.error('Plunk track event error:', errorData);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to process subscription. Please try again.' 
        }),
        { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        }
      );
    }

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'An unexpected error occurred. Please try again.' 
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

// Helper function to validate email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Optional: Confirmation endpoint for handling the double opt-in callback
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // Handle confirmation link clicks (if you want to track confirmations)
  if (url.pathname.includes('/confirm')) {
    const token = url.searchParams.get('token');
    const email = url.searchParams.get('email');
    
    if (token && email) {
      // Track the confirmation event
      await fetch('https://api.useplunk.com/v1/track', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.PLUNK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'newsletter-confirmed',
          email: email,
          data: {
            confirmed_at: new Date().toISOString(),
          }
        })
      });
      
      // Redirect to thank you page
      return Response.redirect('https://kansei.one/newsletter-confirmed', 302);
    }
  }
  
  return new Response('Invalid request', { status: 400 });
}