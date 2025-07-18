// functions/api/newsletter.js
// Cloudflare Worker function for handling newsletter subscriptions via Plunk API

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // Handle CORS for all requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight requests
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
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        }
      );
    }

    // Try to add contact to Plunk (this will handle duplicates gracefully)
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

    const plunkData = await plunkResponse.json();

    // Handle different response scenarios
    if (plunkResponse.ok) {
      // Successfully added new contact
      await sendVerificationEmail(email, env.PLUNK_API_KEY);
      
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
    } else if (plunkResponse.status === 409 || plunkResponse.status === 400) {
      // Contact already exists (409) or validation error (400)
      // Check if the error message indicates the contact already exists
      const errorMessage = plunkData.error || plunkData.message || '';
      
      if (errorMessage.toLowerCase().includes('already exists') || 
          errorMessage.toLowerCase().includes('duplicate') ||
          plunkResponse.status === 409) {
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'You are already subscribed to our newsletter!',
            already_subscribed: true 
          }),
          { 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }
          }
        );
      }
      
      // Other 400 errors (invalid email format, etc.)
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
    } else {
      // Other errors (500, network issues, etc.)
      console.error('Plunk API error:', plunkData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to subscribe. Please try again.' 
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

// Helper function to send verification email
async function sendVerificationEmail(email, apiKey) {
  try {
    const response = await fetch('https://api.useplunk.com/v1/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        subject: 'Welcome to KANSEI - Please Confirm Your Subscription',
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin-bottom: 10px;">Welcome to KANSEI!</h1>
              <p style="color: #666; font-size: 16px;">Thank you for subscribing to our newsletter</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
              <h2 style="color: #333; margin-bottom: 20px;">Your subscription is confirmed!</h2>
              <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                We're excited to share our journey with you. You'll receive thoughtful insights about:
              </p>
              <ul style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                <li>Conscious design principles</li>
                <li>Climate innovations</li>
                <li>Sustainable business practices</li>
                <li>Creative industry insights</li>
              </ul>
              <p style="color: #555; line-height: 1.6;">
                <strong>No spam, no tracking, no nonsense.</strong> Just meaningful content delivered with care.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #666; font-size: 14px;">
                Visit us at <a href="https://kansei.one" style="color: #007bff;">kansei.one</a>
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 20px;">
                If you didn't subscribe to this newsletter, you can safely ignore this email.
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send verification email:', await response.text());
    }
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
}