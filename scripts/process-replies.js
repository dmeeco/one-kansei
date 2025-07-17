import { Gmail } from 'gmail-api-parse-message';
import Plunk from '@plunk/node';

const plunk = new Plunk(process.env.PLUNK_SECRET_KEY);

async function processReplies() {
  // Get unread emails from Gmail API
  const messages = await gmail.getUnreadMessages();
  
  for (const message of messages) {
    const email = message.from;
    const content = message.body.toLowerCase();
    
    // Check for confirmation keywords
    if (content.includes('yes') || content.includes('love') || content.includes('stories')) {
      await plunk.contacts.update(email, {
        data: { status: 'confirmed' }
      });
      
      // Send confirmation email
      await plunk.emails.send({
        to: email,
        subject: 'You\'re all set! 🎉',
        body: 'Thank you for confirming! Your first story is coming soon.',
        type: 'transactional'
      });
    }
  }
} 