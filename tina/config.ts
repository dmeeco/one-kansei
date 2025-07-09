import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "master";

// Dynamic base URL handling - supports local, GitHub Pages, and custom domain
const isProduction = process.env.NODE_ENV === 'production';
const baseUrl = process.env.TINA_PUBLIC_BASE_URL || 
  (isProduction ? 'https://dmeeco.github.io/one-kansei' : 'http://localhost:3000');

export default defineConfig({
  branch,
  
  // Use environment variables for tokens
  clientId: process.env.TINA_PUBLIC_CLIENT_ID, // Get this from tina.io
  token: process.env.TINA_TOKEN, // Get this from tina.io (content read-only token)
  
  build: {
    basePath: 'one-kansei', // Set this to your sub-path for Github pages or Sub-domains
    outputFolder: "admin",
    publicFolder: "public", // Your 11ty output folder
  },
  
  media: {
    tina: {
      mediaRoot: "public/dev/img", // Use dev folder where gulp processes images
      publicFolder: "public", // Your 11ty output folder
    },
  },
  
  schema: {
    collections: [
      {
        name: "posts",
        label: "Blog Posts",
        path: "src/posts",
        format: "md",
        ui: {
          filename: {
            readonly: false,
            slugify: (values) => {
              const generated = values?.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
              // If slug is not set, use generated
              return values?.slug || generated;
            },
          },
        },
        fields: [
          {
            type: "string",
            name: "slug",
            label: "Slug",
            description: "URL slug (auto-generated from title, but you can edit it)",
            required: false,
            ui: {
              validate: (value) => {
                if (value && !/^[a-z0-9-]+$/.test(value)) {
                  return "Slug can only contain lowercase letters, numbers, and hyphens";
                }
              },
            },
          },
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "datetime",
            name: "date",
            label: "Date",
            required: true,
          },
          {
            type: "image",
            name: "coverImg",
            label: "Cover Image",
            description: "The main image for this post",
            // Fix: Add parse function to handle external URLs
            parse: (filename) => {
              // If it's an external URL (starts with http/https), return as-is
              if (filename && (filename.startsWith('http://') || filename.startsWith('https://'))) {
                return filename;
              }
              // Otherwise, treat as local file
              return filename;
            },
            // Fix: Add previewSrc to properly display external images in editor
            previewSrc: (src) => {
              // If it's an external URL, return as-is for preview
              if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
                return src;
              }
              // Otherwise, use default TinaCMS preview logic
              return src;
            }
          },
          {
            type: "string",
            name: "summary",
            label: "Summary",
            description: "Brief description of the post",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "string",
            name: "category",
            label: "Category",
            options: [
              { value: "DESIGN", label: "Design" },
              { value: "TECHNOLOGY", label: "Technology" },
              { value: "BUSINESS", label: "Business" },
              { value: "LIFESTYLE", label: "Lifestyle" },
            ],
          },
          {
            type: "string",
            name: "tags",
            label: "Tags",
            list: true,
            ui: {
              component: "tags",
            },
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
      {
        name: "projects",
        label: "Projects",
        path: "src/projects",
        format: "md",
        ui: {
          filename: {
            readonly: false,
            slugify: (values) => {
              return `${values?.shortTitle?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
            },
          },
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Full Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "shortTitle",
            label: "Short Title",
            required: true,
            description: "Shorter version for navigation and cards",
          },
          {
            type: "datetime",
            name: "date",
            label: "Date",
            required: true,
          },
          {
            type: "image",
            name: "coverImg",
            label: "Cover Image",
            description: "The main image for this project",
            // Fix: Add same parse function for projects
            parse: (filename) => {
              // If it's an external URL (starts with http/https), return as-is
              if (filename && (filename.startsWith('http://') || filename.startsWith('https://'))) {
                return filename;
              }
              // Otherwise, treat as local file
              return filename;
            },
            // Fix: Add previewSrc to properly display external images in editor
            previewSrc: (src) => {
              // If it's an external URL, return as-is for preview
              if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
                return src;
              }
              // Otherwise, use default TinaCMS preview logic
              return src;
            }
          },
          {
            type: "string",
            name: "summary",
            label: "Summary",
            description: "Brief description of the project",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "string",
            name: "industry",
            label: "Industry",
            options: [
              { value: "PUBLIC SECTOR", label: "Public Sector" },
              { value: "TECHNOLOGY", label: "Technology" },
              { value: "HEALTHCARE", label: "Healthcare" },
              { value: "FINANCE", label: "Finance" },
              { value: "EDUCATION", label: "Education" },
              { value: "RETAIL", label: "Retail" },
            ],
          },
          {
            type: "string",
            name: "tags",
            label: "Tags",
            list: true,
            ui: {
              component: "tags",
            },
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
    ],
  },
  
  search: {
    tina: {
      indexerToken: process.env.TINA_SEARCH_TOKEN, // Use environment variable for search token
      stopwordLanguages: ['eng'],
    },
    indexBatchSize: 100,
    maxSearchIndexFieldLength: 100,
  },
});