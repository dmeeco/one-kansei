// functions/api/newsletter.js
// Cloudflare Worker function with Plunk templates and double opt-in

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // Handle CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Get form data
    const formData = await request.formData();
    const email = formData.get('email');
    const source = formData.get('source') || 'website';

    // Validate email
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

    // Step 1: Add contact as UNCONFIRMED (subscribed: false)
    const plunkResponse = await fetch('https://api.useplunk.com/v1/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.PLUNK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        subscribed: false, // Key change: start unsubscribed
        data: {
          source: source,
          signup_date: new Date().toISOString(),
          confirmation_pending: true
        }
      })
    });

    const plunkData = await plunkResponse.json();

    if (plunkResponse.ok) {
      // New contact added, send confirmation email
      await sendConfirmationEmail(email, env.PLUNK_API_KEY, env.PLUNK_CONFIRMATION_TEMPLATE_ID);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Please check your email and click the confirmation link to complete your subscription!' 
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }}
      );

    } else if (plunkResponse.status === 409 || plunkResponse.status === 400) {
      // Contact exists - check if they're already confirmed
      const existingContact = await getContact(email, env.PLUNK_API_KEY);
      
      if (existingContact && existingContact.subscribed) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'You are already subscribed to our newsletter!',
            already_subscribed: true 
          }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders }}
        );
      } else {
        // Exists but not confirmed - resend confirmation
        await sendConfirmationEmail(email, env.PLUNK_API_KEY, env.PLUNK_CONFIRMATION_TEMPLATE_ID);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Confirmation email sent! Please check your email and click the link to confirm.' 
          }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders }}
        );
      }
    } else {
      console.error('Plunk API error:', plunkData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to subscribe. Please try again.' 
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
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

// Helper function to get existing contact
async function getContact(email, apiKey) {
  try {
    const response = await fetch(`https://api.useplunk.com/v1/contacts/${email}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Error getting contact:', error);
    return null;
  }
}

// Helper function to send confirmation email using Plunk template
async function sendConfirmationEmail(email, apiKey, templateId) {
  try {
    // Generate confirmation token (you can make this more secure)
    const confirmationToken = generateConfirmationToken(email);
    const confirmationUrl = `https://kansei.one/api/confirm?token=${confirmationToken}&email=${encodeURIComponent(email)}`;

    const response = await fetch('https://api.useplunk.com/v1/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        template: templateId, // Use template instead of subject/body
        data: {
          confirmation_url: confirmationUrl,
          email: email
        }
      }),
    });

    if (!response.ok) {
      console.error('Failed to send confirmation email:', await response.text());
    }
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
}

// Simple token generation (enhance with crypto for production)
function generateConfirmationToken(email) {
  const timestamp = Date.now();
  const data = `${email}:${timestamp}`;
  // In production, use proper HMAC signing with a secret
  return btoa(data).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
}