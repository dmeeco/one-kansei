import { createClient } from "tinacms/dist/client";
import { queries } from "./types";
export const client = createClient({ cacheDir: '/Users/humanx/Documents/11straps-1.0/tina/__generated__/.cache/1754227528435', url: 'https://content.tinajs.io/1.6/content/your_client_ID_here/github/master', token: 'your_content_readonly_token_here', queries,  });
export default client;
  