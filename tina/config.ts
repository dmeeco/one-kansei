import { defineConfig } from "tinacms";

const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "master";

export default defineConfig({
  branch,
  clientId: process.env.TINA_CLIENT_ID!,
  token: process.env.TINA_TOKEN!,
  
  build: {
    outputFolder: "admin",
    publicFolder: "public",
    basePath: "/one-kansei",
  },
  
  media: {
    tina: {
      mediaRoot: "src/img",
      publicFolder: "src",
    },
  },
  
  // This is crucial for schema sync
  search: {
    tina: {
      indexerToken: process.env.TINA_TOKEN,
      stopwordLanguages: ['eng']
    },
  },
  
  schema: {
    collections: [
      // Your existing collections...
    ],
  },
});