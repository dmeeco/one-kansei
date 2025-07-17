import { Html, Head, Body, Container, Text, Button } from '@react-email/components';

export default function PostNotification({ post, siteUrl }) {
  return (
    <Html>
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Text style={headingStyle}>{post.title}</Text>
          <Text style={excerptStyle}>{post.excerpt}</Text>
          
          <Text>{post.content.substring(0, 300)}...</Text>
          
          <Button href={`${siteUrl}/posts/${post.slug}`} style={buttonStyle}>
            Read Full Story
          </Button>
          
          <Text style={signatureStyle}>
            This story was crafted with love,<br/>
            <strong>The Founder</strong>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle = { fontFamily: 'Georgia, serif' };
const containerStyle = { maxWidth: '600px', margin: '0 auto', padding: '20px' };
const headingStyle = { color: '#2c3e50', fontSize: '24px' };
const excerptStyle = { color: '#7f8c8d', fontStyle: 'italic' };
const buttonStyle = { 
  background: '#3498db', 
  color: 'white', 
  padding: '12px 24px', 
  textDecoration: 'none', 
  borderRadius: '6px' 
};
const signatureStyle = { marginTop: '30px', fontStyle: 'italic', color: '#7f8c8d' }; 