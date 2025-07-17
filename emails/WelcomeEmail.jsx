import { Html, Head, Body, Container, Text, Button } from '@react-email/components';

export default function WelcomeEmail({ name }) {
  return (
    <Html>
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Text style={headingStyle}>Welcome to Kansei.one</Text>
          <Text>Hello {name},</Text>
          <Text>Your heart called out for stories, and somehow you found us.</Text>
          
          <Container style={confirmBoxStyle}>
            <Text><strong>💌 Please confirm by replying with:</strong></Text>
            <Text>• "Yes" - if you're ready</Text>
            <Text>• "I would love to read your stories"</Text>
            <Text>• Or whatever feels authentic to you</Text>
          </Container>

          <Text>Once you reply, you'll receive thoughtful stories that meet you exactly where you are.</Text>
          
          <Text style={signatureStyle}>
            You're not alone in this journey,<br/>
            <strong>With love, The Founder</strong>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle = { fontFamily: 'Georgia, serif' };
const containerStyle = { maxWidth: '600px', margin: '0 auto', padding: '20px' };
const headingStyle = { color: '#2c3e50', fontSize: '24px' };
const confirmBoxStyle = { background: '#f8f9fa', padding: '15px', borderRadius: '6px', margin: '20px 0' };
const signatureStyle = { marginTop: '30px', fontStyle: 'italic' }; 