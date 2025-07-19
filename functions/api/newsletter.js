// functions/api/newsletter.js
// Debug version with logging and fallback to direct email

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
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Debug: Log environment variables (safely)
    console.log('Environment check:', {
      hasApiKey: !!env.PLUNK_API_KEY,
      hasConfirmationTemplate: !!env.PLUNK_CONFIRMATION_TEMPLATE_ID,
      hasWelcomeTemplate: !!env.PLUNK_WELCOME_TEMPLATE_ID
    });

    // Add contact as unconfirmed
    const plunkResponse = await fetch('https://api.useplunk.com/v1/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.PLUNK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        subscribed: false,
        data: {
          source: source,
          signup_date: new Date().toISOString(),
          confirmation_pending: true
        }
      })
    });

    const plunkData = await plunkResponse.json();
    console.log('Plunk contact response:', { status: plunkResponse.status, data: plunkData });

    if (plunkResponse.ok) {
      // Send confirmation email
      const emailSent = await sendConfirmationEmail(email, env);
      console.log('Confirmation email sent:', emailSent);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Please check your email and click the confirmation link to complete your subscription!',
          debug: { emailSent, hasTemplateId: !!env.PLUNK_CONFIRMATION_TEMPLATE_ID }
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }}
      );

    } else if (plunkResponse.status === 409 || plunkResponse.status === 400) {
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
        const emailSent = await sendConfirmationEmail(email, env);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Confirmation email sent! Please check your email and click the link to confirm.',
            debug: { emailSent }
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

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

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

async function sendConfirmationEmail(email, env) {
  try {
    const confirmationToken = generateConfirmationToken(email);
    const confirmationUrl = `https://kansei.one/api/confirm?token=${confirmationToken}&email=${encodeURIComponent(email)}`;

    // Try template first, fallback to inline HTML
    let emailBody;
    
    if (env.PLUNK_CONFIRMATION_TEMPLATE_ID) {
      console.log('Using template ID:', env.PLUNK_CONFIRMATION_TEMPLATE_ID);
      emailBody = {
        to: email,
        template: env.PLUNK_CONFIRMATION_TEMPLATE_ID,
        data: {
          confirmation_url: confirmationUrl,
          email: email
        }
      };
    } else {
      console.log('No template ID, using inline HTML');
      emailBody = {
        to: email,
        subject: 'Confirm your KANSEI newsletter subscription',
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>Confirm Your Subscription</h1>
            <p>Thanks for subscribing to KANSEI! Please click the link below to confirm your email:</p>
            <p><a href="${confirmationUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirm Subscription</a></p>
            <p>Or copy this link: ${confirmationUrl}</p>
            <p>This link will expire in 24 hours.</p>
          </div>
        `
      };
    }

    const response = await fetch('https://api.useplunk.com/v1/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.PLUNK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailBody),
    });

    const responseData = await response.json();
    console.log('Email send response:', { status: response.status, data: responseData });

    return response.ok;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return false;
  }
}

function generateConfirmationToken(email) {
  const timestamp = Date.now();
  const data = `${email}:${timestamp}`;
  return btoa(data).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
}