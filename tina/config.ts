import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";

export default defineConfig({
  branch,
  clientId: process.env.TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: "admin",
    publicFolder: "dev",
  },
  media: {
    tina: {
      mediaRoot: "src/img",
      publicFolder: "dev",
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
              return `${values?.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
            },
          },
        },
        fields: [
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
      {
        name: "pages",
        label: "Pages",
        path: "src",
        format: "md",
        match: {
          include: "{kansei-philosophy,way-of-life,services,special-thanks,privacy-policy}",
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Page Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Meta Description",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "rich-text",
            name: "body",
            label: "Content",
            isBody: true,
          },
        ],
      },
    ],
  },
});