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

  // Clean up AI-generated content by removing XML-like tags and reasoning blocks
  let cleanedText = text
    .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '') // Remove <reasoning> blocks
    .replace(/<[^>]*>/g, '') // Remove any remaining XML/HTML tags
    .trim();

  const lines = cleanedText.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let listType: 'ordered' | 'unordered' | null = null;

  const flushList = () => {
    if (currentList.length > 0) {
      if (listType === 'ordered') {
        elements.push(
          <ol key={`list-${elements.length}`} className="list-decimal list-inside mb-4 space-y-1">
            {currentList}
          </ol>
        );
      } else if (listType === 'unordered') {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside mb-4 space-y-1">
            {currentList}
          </ul>
        );
      }
      currentList = [];
      listType = null;
    }
  };

  lines.forEach((line, index) => {
    // Handle headers
    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={index} className="text-lg font-semibold text-gray-900 mt-4 mb-2">
          {line.slice(4)}
        </h3>
      );
      return;
    }
    if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={index} className="text-xl font-bold text-gray-900 mt-6 mb-3">
          {line.slice(3)}
        </h2>
      );
      return;
    }
    if (line.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={index} className="text-2xl font-bold text-gray-900 mt-6 mb-4">
          {line.slice(2)}
        </h1>
      );
      return;
    }

    // Handle code blocks (simple detection - could be enhanced)
    if (line.startsWith('```')) {
      flushList();
      return; // Skip code block markers for now
    }

    // Handle unordered lists
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (listType !== 'unordered') {
        flushList();
        listType = 'unordered';
      }
      currentList.push(
        <li key={index} className="ml-4 mb-1">
          {line.slice(2)}
        </li>
      );
      return;
    }

    // Handle numbered lists
    if (/^\d+\.\s/.test(line)) {
      if (listType !== 'ordered') {
        flushList();
        listType = 'ordered';
      }
      currentList.push(
        <li key={index} className="ml-4 mb-1">
          {line.replace(/^\d+\.\s/, '')}
        </li>
      );
      return;
    }

    // Handle bold text (**text**)
    if (line.includes('**')) {
      flushList();
      const parts = line.split(/(\*\*.*?\*\*)/);
      elements.push(
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
      return;
    }

    // Handle italic text (*text*)
    if (line.includes('*') && !line.includes('**')) {
      flushList();
      const parts = line.split(/(\*.*?\*)/);
      elements.push(
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
      return;
    }

    // Handle empty lines
    if (line.trim() === '') {
      flushList();
      elements.push(<div key={index} className="mb-2" />);
      return;
    }

    // Handle regular paragraphs
    flushList();
    elements.push(
      <p key={index} className="mb-2 leading-relaxed">
        {line}
      </p>
    );
  });

  // Flush any remaining list
  flushList();

  return elements.filter(Boolean); // Remove null values
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
