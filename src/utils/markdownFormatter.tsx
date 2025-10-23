import React from 'react';

/**
 * Utility function to format markdown text into React components
 * Supports common markdown elements like headers, bold text, lists, and code blocks
 * 
 * @param text - The markdown text to format
 * @returns Array of React elements representing the formatted content
 */
export const formatMarkdown = (text: string): React.ReactNode[] => {
  if (!text) return [];

  return text
    .split('\n')
    .map((line, index) => {
      // Handle headers
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className="text-lg font-semibold text-gray-900 mt-4 mb-2">
            {line.slice(4)}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className="text-xl font-bold text-gray-900 mt-6 mb-3">
            {line.slice(3)}
          </h2>
        );
      }
      if (line.startsWith('# ')) {
        return (
          <h1 key={index} className="text-2xl font-bold text-gray-900 mt-6 mb-4">
            {line.slice(2)}
          </h1>
        );
      }

      // Handle code blocks (simple detection - could be enhanced)
      if (line.startsWith('```')) {
        return null; // Skip code block markers for now
      }

      // Handle unordered lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={index} className="ml-4 mb-1 list-disc">
            {line.slice(2)}
          </li>
        );
      }

      // Handle numbered lists
      if (/^\d+\.\s/.test(line)) {
        return (
          <li key={index} className="ml-4 mb-1 list-decimal">
            {line.replace(/^\d+\.\s/, '')}
          </li>
        );
      }

      // Handle bold text (**text**)
      if (line.includes('**')) {
        const parts = line.split(/(\*\*.*?\*\*)/);
        return (
          <p key={index} className="mb-2 leading-relaxed">
            {parts.map((part, partIndex) => 
              part.startsWith('**') && part.endsWith('**') ? (
                <strong key={partIndex} className="font-semibold">
                  {part.slice(2, -2)}
                </strong>
              ) : (
                <span key={partIndex}>{part}</span>
              )
            )}
          </p>
        );
      }

      // Handle italic text (*text*)
      if (line.includes('*') && !line.includes('**')) {
        const parts = line.split(/(\*.*?\*)/);
        return (
          <p key={index} className="mb-2 leading-relaxed">
            {parts.map((part, partIndex) => 
              part.startsWith('*') && part.endsWith('*') ? (
                <em key={partIndex} className="italic">
                  {part.slice(1, -1)}
                </em>
              ) : (
                <span key={partIndex}>{part}</span>
              )
            )}
          </p>
        );
      }

      // Handle empty lines
      if (line.trim() === '') {
        return <div key={index} className="mb-2" />;
      }

      // Handle regular paragraphs
      return (
        <p key={index} className="mb-2 leading-relaxed">
          {line}
        </p>
      );
    })
    .filter(Boolean); // Remove null values
};

/**
 * Component wrapper for markdown formatting
 * Useful when you need to render markdown content as a React component
 */
export const MarkdownContent: React.FC<{ content: string; className?: string }> = ({ 
  content, 
  className = '' 
}) => {
  return (
    <div className={`markdown-content ${className}`}>
      {formatMarkdown(content)}
    </div>
  );
};
