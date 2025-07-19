// functions/api/confirm.js
// Cloudflare Worker function to handle email confirmations

export async function onRequestGet(context) {
    const { request, env } = context;
    
    try {
      const url = new URL(request.url);
      const token = url.searchParams.get('token');
      const email = url.searchParams.get('email');
  
      // Validate parameters
      if (!token || !email) {
        return createHtmlResponse(
          'Invalid Request', 
          'This confirmation link is missing required information.',
          'error'
        );
      }
  
      // Validate token (basic validation - enhance for production)
      if (!isValidToken(token, email)) {
        return createHtmlResponse(
          'Expired Link', 
          'This confirmation link has expired or is invalid. Please try subscribing again.',
          'error'
        );
      }
  
      // Update contact to confirmed status
      const updateResponse = await fetch('https://api.useplunk.com/v1/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.PLUNK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          subscribed: true, // Confirm subscription
          data: {
            confirmed_at: new Date().toISOString(),
            confirmation_pending: false
          }
        })
      });
  
      if (updateResponse.ok) {
        // Send welcome email using template
        await sendWelcomeEmail(email, env.PLUNK_API_KEY, env.PLUNK_WELCOME_TEMPLATE_ID);
        
        return createHtmlResponse(
          'Subscription Confirmed!', 
          `Thank you for confirming your email address. You're now subscribed to KANSEI updates!`,
          'success'
        );
      } else {
        console.error('Failed to update contact:', await updateResponse.text());
        return createHtmlResponse(
          'Confirmation Failed', 
          'Unable to confirm your subscription. Please try again or contact support.',
          'error'
        );
      }
  
    } catch (error) {
      console.error('Confirmation error:', error);
      return createHtmlResponse(
        'Error', 
        'An unexpected error occurred. Please try again later.',
        'error'
      );
    }
  }
  
  // Token validation (enhance with proper crypto for production)
  function isValidToken(token, email) {
    try {
      const decoded = atob(token.padEnd(token.length + (4 - token.length % 4) % 4, '='));
      const [tokenEmail, timestamp] = decoded.split(':');
      
      // Check if email matches and token is less than 24 hours old
      const tokenAge = Date.now() - parseInt(timestamp);
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      return tokenEmail === email && tokenAge < maxAge;
    } catch (error) {
      return false;
    }
  }
  
  // Send welcome email using Plunk template
  async function sendWelcomeEmail(email, apiKey, templateId) {
    try {
      const response = await fetch('https://api.useplunk.com/v1/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          template: templateId,
          data: {
            email: email,
            unsubscribe_url: `https://kansei.one/unsubscribe?email=${encodeURIComponent(email)}`
          }
        }),
      });
  
      if (!response.ok) {
        console.error('Failed to send welcome email:', await response.text());
      }
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  }
  
  // Create styled HTML response
  function createHtmlResponse(title, message, type = 'success') {
    const bgColor = type === 'success' ? '#d4edda' : '#f8d7da';
    const borderColor = type === 'success' ? '#c3e6cb' : '#f5c6cb';
    const textColor = type === 'success' ? '#155724' : '#721c24';
    const icon = type === 'success' ? '✓' : '✗';
  
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 0;
            padding: 40px 20px;
            background-color: #f8f9fa;
            color: #333;
          }
          .container {
            max-width: 500px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
          }
          .status {
            padding: 20px;
            border-radius: 6px;
            margin-bottom: 30px;
            background-color: ${bgColor};
            border: 1px solid ${borderColor};
            color: ${textColor};
          }
          .icon {
            font-size: 48px;
            margin-bottom: 20px;
            display: block;
          }
          h1 {
            margin: 0 0 20px 0;
            font-size: 24px;
          }
          p {
            margin: 0;
            line-height: 1.5;
          }
          .home-link {
            display: inline-block;
            margin-top: 30px;
            padding: 12px 24px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            transition: background-color 0.2s;
          }
          .home-link:hover {
            background-color: #0056b3;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="status">
            <span class="icon">${icon}</span>
            <h1>${title}</h1>
            <p>${message}</p>
          </div>
          <a href="https://kansei.one" class="home-link">Return to KANSEI</a>
        </div>
      </body>
      </html>
    `;
  
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }