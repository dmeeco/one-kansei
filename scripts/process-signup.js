import Plunk from '@plunk/node';
import { render } from '@react-email/render';
import WelcomeEmail from '../emails/WelcomeEmail.jsx';

const plunk = new Plunk(process.env.PLUNK_SECRET_KEY);
const email = process.env.EMAIL;
const name = process.env.NAME;

async function processSignup() {
  try {
    // Create contact with pending status
    await plunk.contacts.create({
      email,
      data: {
        name: name || '',
        status: 'pending',
        source: 'website',
        signup_date: new Date().toISOString()
      }
    });

    // Send welcome email
    const emailHtml = render(WelcomeEmail({ name: name || 'friend' }));
    
    await plunk.emails.send({
      to: email,
      subject: 'Welcome to Kansei.one - Please Confirm',
      body: emailHtml,
      type: 'transactional'
    });

    console.log('Signup processed successfully');
  } catch (error) {
    console.error('Signup failed:', error);
    process.exit(1);
  }
}

processSignup(); 