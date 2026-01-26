import React, { useState, useRef, useEffect } from 'react';
import { useCourse } from '../context/CourseContext';
import { qaApiService, SourceInfo } from '../api/qa';
import { formatMarkdown } from '../utils/markdownFormatter';

type ChatMessage = {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: string;
  sources?: SourceInfo[] | null;
};

// Sparkle icon for AI
const SparkleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 3v2m0 14v2M5.636 5.636l1.414 1.414m9.9 9.9l1.414 1.414M3 12h2m14 0h2M5.636 18.364l1.414-1.414m9.9-9.9l1.414-1.414" strokeLinecap="round" />
    <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.2" />
  </svg>
);

// Send icon
const SendIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Book icon for sources
const BookIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Chevron icon
const ChevronIcon = ({ className = "w-4 h-4", direction = "down" }: { className?: string; direction?: "up" | "down" }) => (
  <svg className={`${className} transition-transform ${direction === "up" ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { selectedCourse } = useCourse();

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [inputValue]);

  const getAIResponse = async (userMessage: string): Promise<void> => {
    setIsLoading(true);

    try {
      if (!selectedCourse) {
        throw new Error('Please select a course first to ask questions');
      }

      const response = await qaApiService.askQuestion(userMessage, selectedCourse.course_id);

      const aiMessage: ChatMessage = {
        id: Date.now(),
        text: response.answer,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: response.sources
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('QA API error:', error);

      const errorMessage: ChatMessage = {
        id: Date.now(),
        text: error instanceof Error
          ? error.message
          : 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSources = (messageId: number) => {
    setExpandedSources(prev => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
  };

  const getSourceLabel = (sourceType: string) => {
    const labels: Record<string, string> = {
      notes: 'Lecture Notes',
      syllabus: 'Syllabus',
      assignment: 'Assignment',
      announcement: 'Announcement',
      module: 'Module',
      page: 'Page'
    };
    return labels[sourceType?.toLowerCase()] || 'Source';
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMessage]);
    const query = inputValue.trim();
    setInputValue('');
    await getAIResponse(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const suggestions = [
    "What topics are covered in this course?",
    "Explain the main concepts from the last lecture",
    "What are the assignment deadlines?",
    "Help me prepare for the exam"
  ];

  const hasMessages = messages.length > 0;

  return (
    <div className="chat-modern -m-4 sm:-m-6 lg:-m-8 h-[calc(100vh-4rem)] lg:h-screen bg-[#fafafa] overflow-y-auto">
      {/* Messages Area - scrollable */}
      <div className="max-w-3xl mx-auto px-4 py-6 pb-44">

        {/* Welcome State */}
        {!hasMessages && (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
              {/* Logo/Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#630031] to-[#8a1145] flex items-center justify-center mb-6 shadow-lg shadow-[#630031]/20">
                <SparkleIcon className="w-8 h-8 text-white" />
              </div>

              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                How can I help you today?
              </h1>

              <p className="text-gray-500 mb-8 max-w-md">
                {selectedCourse ? (
                  <>Ask me anything about <span className="font-medium text-gray-700">{selectedCourse.code}: {selectedCourse.title}</span></>
                ) : (
                  'Select a course to get started with your AI learning assistant'
                )}
              </p>

              {/* Suggestion chips */}
              {selectedCourse && (
                <div className="flex flex-wrap justify-center gap-2 max-w-xl">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setInputValue(suggestion)}
                      className="px-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 transition-all duration-200 shadow-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          {hasMessages && (
            <div className="space-y-6 pb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                >
                  {/* AI Avatar */}
                  {!message.isUser && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#630031] to-[#8a1145] flex items-center justify-center shadow-md">
                      <SparkleIcon className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* Message Content */}
                  <div className={`flex flex-col ${message.isUser ? 'items-end' : 'items-start'} max-w-[85%]`}>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.isUser
                          ? 'bg-[#630031] text-white rounded-br-md'
                          : 'bg-white border border-gray-100 text-gray-800 rounded-bl-md shadow-sm'
                      }`}
                    >
                      {message.isUser ? (
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.text}</p>
                      ) : (
                        <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-[#630031] prose-code:text-[#630031] prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
                          {formatMarkdown(message.text)}
                        </div>
                      )}
                    </div>

                    {/* Sources Section */}
                    {!message.isUser && message.sources && message.sources.length > 0 && (
                      <div className="mt-2 w-full">
                        <button
                          onClick={() => toggleSources(message.id)}
                          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors group"
                        >
                          <BookIcon className="w-4 h-4" />
                          <span>{message.sources.length} source{message.sources.length !== 1 ? 's' : ''}</span>
                          <ChevronIcon
                            className="w-3 h-3 text-gray-400 group-hover:text-gray-600"
                            direction={expandedSources.has(message.id) ? "up" : "down"}
                          />
                        </button>

                        {/* Expanded sources */}
                        {expandedSources.has(message.id) && (
                          <div className="mt-3 space-y-2 animate-fadeIn">
                            {message.sources.map((source, idx) => (
                              <div
                                key={idx}
                                className="bg-gray-50 border border-gray-100 rounded-xl p-3 hover:bg-gray-100/80 transition-colors"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-xs font-medium text-gray-500">
                                    {idx + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-medium text-[#630031] bg-[#630031]/10 px-2 py-0.5 rounded-full">
                                        {getSourceLabel(source.sourceType)}
                                      </span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {source.title || source.fileName || `${source.sourceType} ${source.sourceId}`}
                                    </p>
                                    {source.excerpt && (
                                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                        {source.excerpt}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* User Avatar */}
                  {message.isUser && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">You</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Loading State */}
              {isLoading && (
                <div className="flex gap-4 animate-fadeIn">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#630031] to-[#8a1145] flex items-center justify-center shadow-md">
                    <SparkleIcon className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

      {/* Input Area - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-gradient-to-t from-[#fafafa] via-[#fafafa] to-transparent pt-8 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit}>
            <div className="relative bg-white border border-gray-200 rounded-2xl shadow-lg shadow-gray-200/50 focus-within:border-[#630031]/30 focus-within:shadow-xl focus-within:shadow-gray-300/50 transition-all duration-200">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                className="w-full px-4 py-3 pr-14 bg-transparent resize-none focus:outline-none text-gray-900 placeholder-gray-400 text-[15px] leading-relaxed"
                rows={1}
                style={{ maxHeight: '200px' }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className={`absolute right-2 bottom-2 p-2 rounded-xl transition-all duration-200 ${
                  inputValue.trim() && !isLoading
                    ? 'bg-[#630031] text-white hover:bg-[#7a003d] shadow-md hover:shadow-lg'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <SendIcon className="w-5 h-5" />
              </button>
            </div>
          </form>

          <p className="text-xs text-gray-400 text-center mt-3 pb-2">
            AI can make mistakes. Please verify important information with course materials.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
