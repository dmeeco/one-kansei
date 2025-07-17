import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Plunk from '@plunk/node';
import { render } from '@react-email/render';
import PostNotification from '../emails/PostNotification.jsx';

const plunk = new Plunk(process.env.PLUNK_SECRET_KEY);

async function checkApprovedPosts() {
  const postsDir = './content/posts';
  const files = fs.readdirSync(postsDir);
  
  for (const file of files) {
    const filePath = path.join(postsDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    
    if (data.status === 'approved' && data.notify_subscribers) {
      // Get confirmed subscribers
      const subscribers = await plunk.contacts.list({
        filter: { status: 'confirmed' }
      });
      
      if (subscribers.length > 0) {
        const emailHtml = render(PostNotification({ 
          post: { ...data, content },
          siteUrl: 'https://yourdomain.com'
        }));
        
        await plunk.emails.send({
          to: subscribers.map(s => s.email),
          subject: `New Story: ${data.title}`,
          body: emailHtml,
          type: 'campaign'
        });
        
        // Update post to prevent duplicate sends
        const updatedContent = matter.stringify(content, {
          ...data,
          notify_subscribers: false
        });
        fs.writeFileSync(filePath, updatedContent);
      }
    }
  }
}

checkApprovedPosts(); 