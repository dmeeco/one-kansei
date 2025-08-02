import React from 'react';
import { useField } from 'tinacms';

interface ImageWithAttributionProps {
  name: string;
  label?: string;
}

export const ImageWithAttribution: React.FC<ImageWithAttributionProps> = ({ name, label }) => {
  const [imageSrc, setImageSrc] = useField(name);
  const [attribution, setAttribution] = useField(`${name}Attribution`);
  const [attributionUrl, setAttributionUrl] = useField(`${name}AttributionUrl`);

  return (
    <div className="image-with-attribution">
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label || 'Image'}
        </label>
        <input
          type="text"
          value={imageSrc || ''}
          onChange={(e) => setImageSrc(e.target.value)}
          placeholder="Enter image URL or upload image"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Attribution Text
        </label>
        <input
          type="text"
          value={attribution || ''}
          onChange={(e) => setAttribution(e.target.value)}
          placeholder="e.g., Designed by Freepik"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Attribution URL
        </label>
        <input
          type="url"
          value={attributionUrl || ''}
          onChange={(e) => setAttributionUrl(e.target.value)}
          placeholder="e.g., https://www.freepik.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {imageSrc && (
        <div className="mt-4">
          <img 
            src={imageSrc} 
            alt="Preview" 
            className="max-w-full h-auto rounded-md shadow-sm"
            style={{ maxHeight: '200px' }}
          />
          {attribution && (
            <div className="mt-2 text-xs text-gray-500">
              {attributionUrl ? (
                <a 
                  href={attributionUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {attribution}
                </a>
              ) : (
                <span>{attribution}</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 