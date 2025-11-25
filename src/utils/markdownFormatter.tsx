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
 * - Headers (# ## ### #### ##### ######)
 * - Ordered lists (1. 2. 3.)
 * - Unordered lists (- *)
 * - Tables (pipe-delimited)
 * - Blockquotes (>)
 * - Horizontal rules (---, ***, ___)
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
  let currentBlockquote: React.ReactNode[] = [];

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

  /**
   * Flushes the current blockquote (if any) to the elements array
   */
  const flushBlockquote = () => {
    if (currentBlockquote.length > 0) {
      elements.push(
        <blockquote key={`${keyPrefix}-blockquote-${elements.length}`} className="border-l-4 border-gray-300 pl-4 my-4 italic text-gray-700 bg-gray-50 py-2 rounded-r">
          {currentBlockquote}
        </blockquote>
      );
      currentBlockquote = [];
    }
  };

  // Parse tables first (multi-line pattern)
  const tableRegex = /^\|.+\|$/;
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const lineKey = `${keyPrefix}-line-${i}`;

    // Handle tables (pipe-delimited with header and separator)
    if (tableRegex.test(line.trim())) {
      flushList();
      flushBlockquote();

      const tableRows: string[] = [];
      let separatorIndex = -1;
      let tableStart = i;

      // Collect all table rows
      while (i < lines.length && tableRegex.test(lines[i].trim())) {
        const row = lines[i].trim();
        tableRows.push(row);

        // Check if this is a separator row (contains ---, ===, or :--:)
        if (row.match(/^\|[\s\-\|:]+\|$/)) {
          separatorIndex = tableRows.length - 1;
        }
        i++;
      }

      // Only render as table if we have at least a header and separator
      if (separatorIndex > 0 && tableRows.length > separatorIndex) {
        const headerRow = tableRows[0];
        const dataRows = tableRows.slice(separatorIndex + 1);

        // Parse header cells (split by | and filter out empty cells from edges)
        const headerCells = headerRow.split('|').map(cell => cell.trim()).filter((cell, idx, arr) => {
          // Filter out first and last empty strings that come from leading/trailing |
          if (idx === 0 || idx === arr.length - 1) return cell !== '';
          return true;
        });

        // Parse data rows
        const tableData = dataRows.map(row => {
          const cells = row.split('|').map(cell => cell.trim());
          // Filter out first and last empty strings
          if (cells.length > 0 && cells[0] === '') cells.shift();
          if (cells.length > 0 && cells[cells.length - 1] === '') cells.pop();
          return cells;
        });

        elements.push(
          <div key={`${keyPrefix}-table-${elements.length}`} className="my-4 overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300 rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  {headerCells.map((cell, idx) => (
                    <th key={idx} className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">
                      {processInlineMarkdown(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-gray-50">
                    {headerCells.map((_, colIdx) => (
                      <td key={colIdx} className="border border-gray-300 px-4 py-2 text-gray-800">
                        {processInlineMarkdown(row[colIdx] || '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue; // Move to next line after table
      } else {
        // Not a valid table, treat lines as regular paragraphs
        // Process from tableStart onwards as regular text
        for (let j = tableStart; j < i; j++) {
          const regularLine = lines[j];
          const regularKey = `${keyPrefix}-line-${j}`;
          flushList();
          const processedLine = processInlineMarkdown(regularLine);
          elements.push(
            <p key={regularKey} className="mb-3 leading-relaxed text-gray-800 last:mb-0">
              {processedLine}
            </p>
          );
        }
        continue;
      }
    }

    // Handle horizontal rules (---, ***, ___)
    if (/^(---|\*\*\*|___)\s*$/.test(line.trim())) {
      flushList();
      flushBlockquote();
      elements.push(
        <hr key={lineKey} className="my-6 border-t border-gray-300" />
      );
      i++;
      continue;
    }

    // Handle blockquotes (>)
    if (line.trim().startsWith('>')) {
      flushList();
      const blockquoteContent = line.trim().slice(1).trim();
      if (blockquoteContent) {
        const processedContent = processInlineMarkdown(blockquoteContent);
        currentBlockquote.push(
          <div key={lineKey} className="mb-2">
            {processedContent}
          </div>
        );
      }
      i++;
      continue;
    }

    // If we're not in a blockquote anymore, flush it
    if (currentBlockquote.length > 0 && !line.trim().startsWith('>')) {
      flushBlockquote();
    }

    // Handle headers (######, #####, ####, ###, ##, #)
    // Headers support inline markdown (bold, italic, links) in their text
    if (line.match(/^#{6}\s/)) {
      flushList();
      const headerText = processInlineMarkdown(line.replace(/^#{6}\s/, ''));
      elements.push(
        <h6 key={lineKey} className="text-sm font-semibold text-gray-900 mt-6 mb-2 first:mt-0">
          {headerText}
        </h6>
      );
      i++;
      continue;
    }
    if (line.match(/^#{5}\s/)) {
      flushList();
      const headerText = processInlineMarkdown(line.replace(/^#{5}\s/, ''));
      elements.push(
        <h5 key={lineKey} className="text-base font-semibold text-gray-900 mt-6 mb-2 first:mt-0">
          {headerText}
        </h5>
      );
      i++;
      continue;
    }
    if (line.match(/^#{4}\s/)) {
      flushList();
      const headerText = processInlineMarkdown(line.replace(/^#{4}\s/, ''));
      elements.push(
        <h4 key={lineKey} className="text-base font-semibold text-gray-900 mt-6 mb-2 first:mt-0">
          {headerText}
        </h4>
      );
      i++;
      continue;
    }
    if (line.match(/^###\s/)) {
      flushList();
      const headerText = processInlineMarkdown(line.replace(/^###\s/, ''));
      elements.push(
        <h3 key={lineKey} className="text-lg font-semibold text-gray-900 mt-6 mb-3 first:mt-0">
          {headerText}
        </h3>
      );
      i++;
      continue;
    }
    if (line.match(/^##\s/)) {
      flushList();
      const headerText = processInlineMarkdown(line.replace(/^##\s/, ''));
      elements.push(
        <h2 key={lineKey} className="text-xl font-bold text-gray-900 mt-6 mb-3 first:mt-0">
          {headerText}
        </h2>
      );
      i++;
      continue;
    }
    if (line.match(/^#\s/)) {
      flushList();
      const headerText = processInlineMarkdown(line.replace(/^#\s/, ''));
      elements.push(
        <h1 key={lineKey} className="text-2xl font-bold text-gray-900 mt-6 mb-4 first:mt-0">
          {headerText}
        </h1>
      );
      i++;
      continue;
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
      i++;
      continue;
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
      i++;
      continue;
    }

    // Handle empty lines (for spacing between paragraphs)
    // FIX: Only adds spacing if there's content before it (prevents extra whitespace at start)
    if (line.trim() === '') {
      flushList();
      flushBlockquote();
      // Only add spacing if there's content before and after
      if (elements.length > 0) {
        elements.push(<div key={lineKey} className="h-2" />);
      }
      i++;
      continue;
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
    i++;
  }

  // Flush any remaining list or blockquote
  flushList();
  flushBlockquote();

  return elements.filter(Boolean);
};

/**
 * Process inline markdown elements (bold, italic, inline code, links, images, strikethrough)
 * 
 * SUPPORTS:
 * - Inline code: `code`
 * - Bold: **text** or __text__
 * - Italic: *text* or _text_
 * - Strikethrough: ~~text~~
 * - Links: [text](url) or [text](url "title")
 * - Images: ![alt](url) or ![alt](url "title")
 * 
 * Processing order:
 * 1. First, extract all inline code blocks (they take priority - no formatting inside)
 * 2. Then extract images (before links to avoid conflicts)
 * 3. Then extract links
 * 4. Then process bold/italic/strikethrough in the remaining text
 * 5. This prevents conflicts (e.g., bold markers inside code or links)
 * 
 * @param text - Text that may contain inline markdown
 * @returns Array of React elements (text nodes, code elements, strong, em, a, img, del)
 */
const processInlineMarkdown = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyCounter = 0;

  // STEP 1: Find all inline code blocks (backticks) - highest priority
  // Process these first because code blocks should not contain any markdown formatting
  const codeRegex = /`([^`]+)`/g;
  const codeMatches: Array<{ start: number; end: number; content: string }> = [];
  let match;

  while ((match = codeRegex.exec(text)) !== null) {
    codeMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      content: match[1]
    });
  }

  // Split text by inline code blocks
  let lastIndex = 0;
  codeMatches.forEach((codeMatch) => {
    // Add text before code (process other markdown in this text)
    if (codeMatch.start > lastIndex) {
      const beforeCode = text.substring(lastIndex, codeMatch.start);
      parts.push(...processLinksAndImages(beforeCode));
    }

    // Add inline code with proper styling
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

  // Add remaining text after last code
  if (lastIndex < text.length) {
    const afterCode = text.substring(lastIndex);
    parts.push(...processLinksAndImages(afterCode));
  }

  return parts;
};

/**
 * Process links and images in text (before bold/italic processing)
 * 
 * Links: [text](url) or [text](url "title")
 * Images: ![alt](url) or ![alt](url "title")
 */
const processLinksAndImages = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let keyCounter = 0;

  // Find images first (before links to avoid conflicts)
  // Pattern: ![alt](url) or ![alt](url "title")
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)(?:\s+"([^"]+)")?\)/g;
  const linkRegex = /\[([^\]]+)\]\(([^)]+)(?:\s+"([^"]+)")?\)/g;

  const allMatches: Array<{ start: number; end: number; type: 'image' | 'link'; alt: string; url: string; title?: string }> = [];
  let match: RegExpExecArray | null;

  // Collect images
  while ((match = imageRegex.exec(text)) !== null) {
    allMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      type: 'image',
      alt: match[1],
      url: match[2],
      title: match[3]
    });
  }

  // Collect links (only if not inside an image)
  linkRegex.lastIndex = 0;
  while ((match = linkRegex.exec(text)) !== null) {
    // Check if this link is inside an already matched image
    const isInsideImage = allMatches.some(img =>
      match!.index >= img.start && match!.index < img.end
    );
    if (!isInsideImage) {
      allMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: 'link',
        alt: match[1],
        url: match[2],
        title: match[3]
      });
    }
  }

  // Sort matches by position
  allMatches.sort((a, b) => a.start - b.start);

  if (allMatches.length === 0) {
    return processBoldItalicStrikethrough(text);
  }

  // Split text by matches and process each part
  let lastIndex = 0;
  allMatches.forEach((match) => {
    // Add text before match (process bold/italic/strikethrough)
    if (match.start > lastIndex) {
      const beforeMatch = text.substring(lastIndex, match.start);
      parts.push(...processBoldItalicStrikethrough(beforeMatch));
    }

    // Add image or link
    if (match.type === 'image') {
      parts.push(
        <img
          key={`image-${keyCounter++}`}
          src={match.url}
          alt={match.alt}
          title={match.title}
          className="max-w-full h-auto rounded-lg my-2 border border-gray-300"
          style={{ display: 'block', margin: '0.5rem 0' }}
        />
      );
    } else {
      parts.push(
        <a
          key={`link-${keyCounter++}`}
          href={match.url}
          title={match.title}
          target="_blank"
          rel="noopener noreferrer"
          className="text-vt-maroon hover:text-red-800 underline font-medium"
        >
          {processBoldItalicStrikethrough(match.alt)}
        </a>
      );
    }

    lastIndex = match.end;
  });

  // Add remaining text after last match
  if (lastIndex < text.length) {
    const afterMatch = text.substring(lastIndex);
    parts.push(...processBoldItalicStrikethrough(afterMatch));
  }

  return parts;
};

/**
 * Process bold, italic, and strikethrough markdown
 * 
 * Handles:
 * - Bold text: **text** or __text__ becomes <strong>
 * - Italic text: *text* or _text_ becomes <em>
 * - Strikethrough: ~~text~~ becomes <del>
 * 
 * Note: This function is called after inline code, links, and images are processed,
 * so it won't conflict with those elements
 * 
 * @param text - Text that may contain bold/italic/strikethrough markers
 * @returns Array of React elements
 */
const processBoldItalicStrikethrough = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let keyCounter = 0;

  // Process strikethrough (~~text~~), bold (**text** or __text__), and italic (*text* or _text_)
  // Order: strikethrough first, then bold, then italic
  // Regex matches: ~~strike~~, **bold** or __bold__, *italic* or _italic_
  const markdownRegex = /(~~([^~]+)~~)|(\*\*([^*]+)\*\*)|(__([^_]+)__)|(\*([^*]+)\*)|(_([^_]+)_)/g;
  const matches: Array<{ start: number; end: number; type: 'bold' | 'italic' | 'strikethrough'; content: string }> = [];
  let match: RegExpExecArray | null;

  while ((match = markdownRegex.exec(text)) !== null) {
    if (match[1]) {
      // Strikethrough match (~~text~~)
      matches.push({
        start: match.index,
        end: match.index + match[1].length,
        type: 'strikethrough',
        content: match[2]
      });
    } else if (match[3] || match[5]) {
      // Bold match (**text** or __text__)
      matches.push({
        start: match.index,
        end: match.index + (match[3] ? match[3].length : match[5].length),
        type: 'bold',
        content: match[4] || match[6]
      });
    } else if (match[7] || match[9]) {
      // Italic match (*text* or _text_) - but only if not part of bold
      // Check if this single asterisk/underscore is not part of double
      const singleChar = match[7] ? '*' : '_';
      const isPartOfBold = text[match.index - 1] === singleChar || text[match.index + (match[7] ? match[7].length : match[9].length)] === singleChar;

      if (!isPartOfBold) {
        matches.push({
          start: match.index,
          end: match.index + (match[7] ? match[7].length : match[9].length),
          type: 'italic',
          content: match[8] || match[10]
        });
      }
    }
  }

  // Remove overlapping matches (keep strikethrough > bold > italic priority)
  const filteredMatches = matches.filter((m, idx) => {
    return !matches.some((other, otherIdx) =>
      otherIdx !== idx &&
      m.start >= other.start &&
      m.end <= other.end &&
      (
        (m.type === 'italic' && (other.type === 'bold' || other.type === 'strikethrough')) ||
        (m.type === 'bold' && other.type === 'strikethrough')
      )
    );
  });

  if (filteredMatches.length === 0) {
    return [<span key={`text-${keyCounter++}`}>{text}</span>];
  }

  // Split by matches
  let lastIndex = 0;
  filteredMatches.forEach((match) => {
    // Add text before match
    if (match.start > lastIndex) {
      parts.push(<span key={`text-${keyCounter++}`}>{text.substring(lastIndex, match.start)}</span>);
    }

    // Add formatted element
    if (match.type === 'bold') {
      parts.push(
        <strong key={`bold-${keyCounter++}`} className="font-semibold text-gray-900">
          {match.content}
        </strong>
      );
    } else if (match.type === 'italic') {
      parts.push(
        <em key={`italic-${keyCounter++}`} className="italic text-gray-800">
          {match.content}
        </em>
      );
    } else if (match.type === 'strikethrough') {
      parts.push(
        <del key={`strike-${keyCounter++}`} className="line-through text-gray-500">
          {match.content}
        </del>
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

