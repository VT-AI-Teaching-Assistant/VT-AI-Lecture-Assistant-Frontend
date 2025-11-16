import React, { useState } from 'react';

/**
 * CodeBlock Component with Copy Functionality
 * 
 * ISSUE FIXED: Previously, code blocks were completely skipped in the markdown parser.
 * The old implementation had a line that simply returned early when encountering code block markers (```),
 * causing all code content to be lost and not displayed at all.
 * 
 * SOLUTION: Created a dedicated CodeBlock component that:
 * 1. Properly renders fenced code blocks with syntax highlighting support
 * 2. Includes a header bar showing the language (if specified)
 * 3. Provides a copy-to-clipboard button for easy code copying
 * 
 * COPY BUTTON IMPLEMENTATION:
 * - Uses React useState to track copy state (copied/copying)
 * - Primary method: Modern Clipboard API (navigator.clipboard.writeText)
 * - Fallback method: document.execCommand('copy') for older browsers
 * - Visual feedback: Shows checkmark icon and "Copied!" text for 2 seconds after successful copy
 * - Error handling: Gracefully handles clipboard permission issues and browser compatibility
 * 
 * @param code - The code content to display
 * @param language - Optional programming language for syntax highlighting (e.g., 'javascript', 'python')
 * @param blockIndex - Unique index for React key prop
 */
const CodeBlock: React.FC<{ code: string; language?: string; blockIndex: number }> = ({
  code,
  language,
  blockIndex
}) => {
  // State to track if code was recently copied (for visual feedback)
  const [copied, setCopied] = useState(false);

  /**
   * Handles copying code to clipboard
   * 
   * IMPLEMENTATION DETAILS:
   * 1. Primary approach: Uses modern Clipboard API (async/await)
   *    - Works in secure contexts (HTTPS) and requires user gesture
   *    - Best practice for modern browsers
   * 
   * 2. Fallback approach: Uses document.execCommand for older browsers
   *    - Creates a temporary textarea element
   *    - Positions it off-screen (fixed, opacity 0)
   *    - Selects and copies the text
   *    - Always cleans up in finally block to prevent memory leaks
   * 
   * 3. User feedback: Sets copied state to true, automatically resets after 2 seconds
   */
  const handleCopy = async () => {
    try {
      // Primary: Modern Clipboard API (works in HTTPS contexts)
      await navigator.clipboard.writeText(code.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);

      // Fallback: For browsers that don't support Clipboard API
      // (older browsers, HTTP contexts, or when permissions are denied)
      const textArea = document.createElement('textarea');
      textArea.value = code.trim();
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();

      try {
        const successful = document.execCommand('copy');
        if (successful) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          console.error('Fallback copy command failed');
        }
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      } finally {
        // Always clean up the temporary element to prevent memory leaks
        document.body.removeChild(textArea);
      }
    }
  };

  return (
    <div className="my-4 relative group">
      {/* 
        HEADER BAR: Contains language label and copy button
        - Dark gray background (bg-gray-800) for contrast
        - Shows language on left, copy button on right
        - Rounded top corners to match code block design
      */}
      <div className="flex items-center justify-between bg-gray-800 text-gray-300 px-4 py-2 rounded-t-lg border-b border-gray-700">
        {/* Language label - displays the programming language or 'code' as default */}
        <span className="text-xs font-mono text-gray-400">
          {language || 'code'}
        </span>

        {/* 
          COPY BUTTON: 
          - Shows different UI based on copied state
          - When not copied: Shows copy icon + "Copy" text
          - When copied: Shows checkmark icon + green "Copied!" text
          - Includes proper ARIA labels for accessibility
          - Has focus ring for keyboard navigation
        */}
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-vt-maroon focus:ring-offset-2 focus:ring-offset-gray-900"
          aria-label="Copy code"
          title="Copy code to clipboard"
        >
          {copied ? (
            // Success state: Green checkmark with "Copied!" message
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            // Default state: Copy icon with "Copy" text
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* 
        CODE CONTENT AREA:
        - Dark background (bg-gray-900) with light text (text-gray-100)
        - Monospace font for proper code formatting
        - Horizontal scroll (overflow-x-auto) for long lines
        - whiteSpace: 'pre' preserves all spaces and line breaks
        - border-t-0 removes top border (already handled by header bar)
      */}
      <pre className="bg-gray-900 text-gray-100 rounded-b-lg p-4 overflow-x-auto border border-gray-700 border-t-0">
        <code
          className={`language-${language}`}
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            whiteSpace: 'pre', // CRITICAL: Preserves whitespace and formatting
            display: 'block'
          }}
        >
          {code.trim()}
        </code>
      </pre>
    </div>
  );
};

/**
 * Main Markdown Formatter Function
 * 
 * ORIGINAL ISSUES FIXED:
 * ======================
 * 
 * 1. CODE BLOCKS COMPLETELY MISSING:
 *    - Problem: Old code had `if (line.startsWith('```')) { return; }` which skipped code blocks entirely
 *    - Result: All code content was lost, code blocks never appeared in UI
 *    - Fix: Now properly extracts code blocks using regex, separates them from text, and renders with CodeBlock component
 * 
 * 2. INLINE CODE NOT SUPPORTED:
 *    - Problem: No handling for inline code with backticks (e.g., `const x = 5`)
 *    - Fix: Added processInlineMarkdown function that detects and styles inline code blocks
 * 
 * 3. LIST ALIGNMENT ISSUES:
 *    - Problem: Used `list-inside` class which caused bullet points to overlap with text
 *    - Fix: Changed to `list-outside` with proper left margin (`ml-6`) for correct alignment
 * 
 * 4. SPACING AND LINE BREAK ISSUES:
 *    - Problem: Inconsistent spacing between paragraphs, lists, and headers
 *    - Fix: Added consistent margin classes (mb-3, mb-4, mt-6) for proper spacing
 * 
 * 5. CODE BLOCK FORMATTING:
 *    - Problem: Code blocks had no styling, no overflow handling, appeared as plain text
 *    - Fix: Added dark theme styling, horizontal scroll for long lines, monospace font, preserved whitespace
 * 
 * HOW IT WORKS:
 * =============
 * 1. Cleans the text (removes AI reasoning blocks and XML tags)
 * 2. Separates code blocks from regular text using regex
 * 3. Processes code blocks with CodeBlock component (includes copy button)
 * 4. Processes text with processMarkdownText (headers, lists, paragraphs)
 * 5. Processes inline elements (bold, italic, inline code)
 * 
 * @param text - The markdown text to format
 * @returns Array of React elements representing the formatted content
 */
export const formatMarkdown = (text: string): React.ReactNode[] => {
  if (!text) return [];

  // STEP 1: Clean up AI-generated content
  // Remove XML-like tags and reasoning blocks that some AI models include
  let cleanedText = text
    .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '') // Remove <reasoning> blocks
    .replace(/<[^>]*>/g, '') // Remove any remaining XML/HTML tags
    .trim();

  const elements: React.ReactNode[] = [];

  // STEP 2: Extract code blocks first (before processing text)
  // This is critical because code blocks can contain markdown-like text that shouldn't be parsed
  // Regex matches: ```language\ncode content\n```
  // Captures: language (optional) and code content
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  const processedParts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];

  // Find all code blocks and split the text into code and non-code parts
  while ((match = codeBlockRegex.exec(cleanedText)) !== null) {
    // Add text before code block (if any)
    if (match.index > lastIndex) {
      processedParts.push({
        type: 'text',
        content: cleanedText.substring(lastIndex, match.index)
      });
    }
    // Add code block with language and content
    processedParts.push({
      type: 'code',
      content: match[2], // The actual code content (between the ``` markers)
      language: match[1] || 'text' // Language tag (e.g., 'javascript', 'python') or 'text' as default
    });
    lastIndex = match.index + match[0].length; // Move past this code block
  }

  // Add remaining text after last code block (if any)
  if (lastIndex < cleanedText.length) {
    processedParts.push({
      type: 'text',
      content: cleanedText.substring(lastIndex)
    });
  }

  // If no code blocks found, treat entire text as regular markdown
  if (processedParts.length === 0) {
    processedParts.push({ type: 'text', content: cleanedText });
  }

  // STEP 3: Process each part (code blocks and text separately)
  processedParts.forEach((part, partIndex) => {
    if (part.type === 'code') {
      // Render code block with copy functionality using CodeBlock component
      elements.push(
        <CodeBlock
          key={`code-block-${partIndex}`}
          code={part.content}
          language={part.language}
          blockIndex={partIndex}
        />
      );
    } else {
      // Process text content for markdown (headers, lists, paragraphs, etc.)
      const textElements = processMarkdownText(part.content, `text-${partIndex}`);
      elements.push(...textElements);
    }
  });

  return elements;
};

/**
 * Process markdown text content (everything except code blocks)
 * 
 * HANDLES:
 * - Headers (# ## ###)
 * - Ordered lists (1. 2. 3.)
 * - Unordered lists (- *)
 * - Paragraphs
 * - Empty lines (for spacing)
 * 
 * FIXED ISSUES:
 * - List alignment: Changed from list-inside to list-outside with ml-6 margin
 *   This fixes the issue where bullet points overlapped with text
 * - Spacing: Added consistent margins (mb-3, mb-4, space-y-2) for proper vertical spacing
 * 
 * @param text - The text content to process (markdown, but no code blocks)
 * @param keyPrefix - Prefix for React keys to ensure uniqueness
 * @returns Array of React elements
 */
const processMarkdownText = (text: string, keyPrefix: string): React.ReactNode[] => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let listType: 'ordered' | 'unordered' | null = null;
  let listCounter = 1;

  /**
   * Flushes the current list (if any) to the elements array
   * Called when we encounter a non-list item or empty line
   * 
   * FIX: Changed list-inside to list-outside for proper alignment
   * - list-outside: Bullets/numbers appear outside the content area
   * - ml-6: Left margin pushes the list content to the right, aligning properly
   */
  const flushList = () => {
    if (currentList.length > 0) {
      if (listType === 'ordered') {
        elements.push(
          <ol key={`${keyPrefix}-list-${elements.length}`} className="list-decimal list-outside ml-6 mb-4 space-y-2">
            {currentList}
          </ol>
        );
      } else if (listType === 'unordered') {
        elements.push(
          <ul key={`${keyPrefix}-list-${elements.length}`} className="list-disc list-outside ml-6 mb-4 space-y-2">
            {currentList}
          </ul>
        );
      }
      currentList = [];
      listType = null;
      listCounter = 1;
    }
  };

  lines.forEach((line, index) => {
    const lineKey = `${keyPrefix}-line-${index}`;

    // Handle headers (###, ##, #)
    // Headers support inline markdown (bold, italic) in their text
    // FIX: Added proper spacing (mt-6, mb-3) to prevent cramped appearance
    if (line.startsWith('### ')) {
      flushList();
      const headerText = processInlineMarkdown(line.slice(4));
      elements.push(
        <h3 key={lineKey} className="text-lg font-semibold text-gray-900 mt-6 mb-3 first:mt-0">
          {headerText}
        </h3>
      );
      return;
    }
    if (line.startsWith('## ')) {
      flushList();
      const headerText = processInlineMarkdown(line.slice(3));
      elements.push(
        <h2 key={lineKey} className="text-xl font-bold text-gray-900 mt-6 mb-3 first:mt-0">
          {headerText}
        </h2>
      );
      return;
    }
    if (line.startsWith('# ')) {
      flushList();
      const headerText = processInlineMarkdown(line.slice(2));
      elements.push(
        <h1 key={lineKey} className="text-2xl font-bold text-gray-900 mt-6 mb-4 first:mt-0">
          {headerText}
        </h1>
      );
      return;
    }

    // Handle unordered lists (- or *)
    // FIX: Properly accumulates list items and flushes when list type changes
    const unorderedMatch = line.match(/^[-*]\s+(.+)$/);
    if (unorderedMatch) {
      if (listType !== 'unordered') {
        flushList(); // End previous list if it was a different type
        listType = 'unordered';
      }
      const listItemContent = processInlineMarkdown(unorderedMatch[1]);
      currentList.push(
        <li key={lineKey} className="text-gray-800 leading-relaxed">
          {listItemContent}
        </li>
      );
      return;
    }

    // Handle ordered lists (1. 2. 3.)
    // FIX: Properly accumulates list items and flushes when list type changes
    const orderedMatch = line.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      if (listType !== 'ordered') {
        flushList(); // End previous list if it was a different type
        listType = 'ordered';
      }
      const listItemContent = processInlineMarkdown(orderedMatch[1]);
      currentList.push(
        <li key={lineKey} className="text-gray-800 leading-relaxed">
          {listItemContent}
        </li>
      );
      return;
    }

    // Handle empty lines (for spacing between paragraphs)
    // FIX: Only adds spacing if there's content before it (prevents extra whitespace at start)
    if (line.trim() === '') {
      flushList();
      // Only add spacing if there's content before and after
      if (elements.length > 0) {
        elements.push(<div key={lineKey} className="h-2" />);
      }
      return;
    }

    // Handle regular paragraphs with inline markdown
    // FIX: Added consistent bottom margin (mb-3) for proper paragraph spacing
    flushList();
    const processedLine = processInlineMarkdown(line);
    elements.push(
      <p key={lineKey} className="mb-3 leading-relaxed text-gray-800 last:mb-0">
        {processedLine}
      </p>
    );
  });

  // Flush any remaining list
  flushList();

  return elements.filter(Boolean);
};

/**
 * Process inline markdown elements (bold, italic, inline code)
 * 
 * NEW FEATURE: Inline code support
 * - Before: No support for inline code with backticks (e.g., `const x = 5`)
 * - After: Detects backticks and renders inline code with proper styling
 * 
 * Processing order:
 * 1. First, extract all inline code blocks (they take priority)
 * 2. Then process bold/italic in the remaining text
 * 3. This prevents conflicts (e.g., bold markers inside code)
 * 
 * @param text - Text that may contain inline markdown
 * @returns Array of React elements (text nodes, code elements, strong, em)
 */
const processInlineMarkdown = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyCounter = 0;

  // STEP 1: Find all inline code blocks (backticks)
  // Process these first because code blocks should not contain markdown formatting
  const codeRegex = /`([^`]+)`/g;
  const codeMatches: Array<{ start: number; end: number; content: string }> = [];
  let match;

  while ((match = codeRegex.exec(text)) !== null) {
    codeMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      content: match[1] // The code content without backticks
    });
  }

  // If no inline code found, just process bold/italic
  if (codeMatches.length === 0) {
    return processBoldItalic(text);
  }

  // STEP 2: Split text by inline code blocks and process each part
  let lastIndex = 0;
  codeMatches.forEach((codeMatch) => {
    // Add text before code (process bold/italic in this text)
    if (codeMatch.start > lastIndex) {
      const beforeCode = text.substring(lastIndex, codeMatch.start);
      parts.push(...processBoldItalic(beforeCode));
    }

    // Add inline code with proper styling
    // FIX: Added proper styling with gray background, monospace font, and padding
    parts.push(
      <code
        key={`inline-code-${keyCounter++}`}
        className="bg-gray-100 text-gray-900 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-300"
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'
        }}
      >
        {codeMatch.content}
      </code>
    );

    lastIndex = codeMatch.end;
  });

  // Add remaining text after last code (process bold/italic)
  if (lastIndex < text.length) {
    const afterCode = text.substring(lastIndex);
    parts.push(...processBoldItalic(afterCode));
  }

  return parts;
};

/**
 * Process bold and italic markdown
 * 
 * Handles:
 * - Bold text: **text** becomes <strong>
 * - Italic text: *text* becomes <em>
 * 
 * Note: This function is called after inline code is processed,
 * so it won't conflict with code blocks
 * 
 * @param text - Text that may contain bold/italic markers
 * @returns Array of React elements
 */
const processBoldItalic = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyCounter = 0;

  // Process bold (**text**) and italic (*text*)
  // Regex matches: **bold** or *italic* (but not code backticks, which are already processed)
  const boldItalicRegex = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;
  const matches: Array<{ start: number; end: number; type: 'bold' | 'italic'; content: string }> = [];
  let match;

  while ((match = boldItalicRegex.exec(text)) !== null) {
    if (match[1]) {
      // Bold match
      matches.push({
        start: match.index,
        end: match.index + match[1].length,
        type: 'bold',
        content: match[2]
      });
    } else if (match[3]) {
      // Italic match
      matches.push({
        start: match.index,
        end: match.index + match[3].length,
        type: 'italic',
        content: match[4]
      });
    }
  }

  if (matches.length === 0) {
    return [<span key={`text-${keyCounter++}`}>{text}</span>];
  }

  // Split by bold/italic matches
  let lastIndex = 0;
  matches.forEach((match) => {
    // Add text before match
    if (match.start > lastIndex) {
      parts.push(<span key={`text-${keyCounter++}`}>{text.substring(lastIndex, match.start)}</span>);
    }

    // Add bold or italic element
    if (match.type === 'bold') {
      parts.push(
        <strong key={`bold-${keyCounter++}`} className="font-semibold text-gray-900">
          {match.content}
        </strong>
      );
    } else {
      parts.push(
        <em key={`italic-${keyCounter++}`} className="italic text-gray-800">
          {match.content}
        </em>
      );
    }

    lastIndex = match.end;
  });

  // Add remaining text after last match
  if (lastIndex < text.length) {
    parts.push(<span key={`text-${keyCounter++}`}>{text.substring(lastIndex)}</span>);
  }

  return parts;
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
