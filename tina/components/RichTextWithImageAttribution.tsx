import React from 'react';
import { RichText } from 'tinacms';
import { RichTextTemplate } from '@tinacms/schema-tools';

interface ImageAttributionData {
  src: string;
  alt: string;
  attribution?: string;
  attributionUrl?: string;
}

const ImageAttributionComponent: React.FC<{ data: ImageAttributionData }> = ({ data }) => {
  return (
    <div className="image-with-attribution-container">
      <img 
        src={data.src} 
        alt={data.alt} 
        className="img-fluid rounded shadow-sm"
        style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
      />
      {data.attribution && (
        <div className="image-attribution">
          {data.attributionUrl ? (
            <a 
              href={data.attributionUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-decoration-none"
            >
              {data.attribution}
            </a>
          ) : (
            <span>{data.attribution}</span>
          )}
        </div>
      )}
    </div>
  );
};

export const RichTextWithImageAttribution: React.FC<{ name: string; label?: string }> = ({ 
  name, 
  label 
}) => {
  return (
    <RichText
      name={name}
      label={label}
      templates={[
        {
          name: 'imageWithAttribution',
          label: 'Image with Attribution',
          fields: [
            {
              type: 'string',
              name: 'src',
              label: 'Image URL',
              required: true,
            },
            {
              type: 'string',
              name: 'alt',
              label: 'Alt Text',
              required: true,
            },
            {
              type: 'string',
              name: 'attribution',
              label: 'Attribution Text',
              description: 'e.g., Designed by Freepik',
            },
            {
              type: 'string',
              name: 'attributionUrl',
              label: 'Attribution URL',
              description: 'e.g., https://www.freepik.com',
            },
          ],
          component: ImageAttributionComponent,
        },
      ]}
    />
  );
}; 