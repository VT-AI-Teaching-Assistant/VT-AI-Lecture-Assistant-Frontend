import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DocumentTextIcon, XMarkIcon } from '@heroicons/react/24/outline';
import {
  Bot,
  BookOpen,
  Check,
  Copy,
  Loader2,
  RefreshCw,
  Sparkles,
  User,
  Wand2,
  Lightbulb
} from 'lucide-react';
import { useCourse } from '../context/CourseContext';
import { qaApiService, SourceInfo } from '../api/qa';
import { formatMarkdown } from '../utils/markdownFormatter';

type ChatMessage = {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: string;
  sources?: SourceInfo[] | null;
  error?: boolean;
};

const quickPrompts = [
  {
    title: 'Explain a concept',
    description: 'Break down lectures into simple steps.',
    prompt: "Explain Dijkstra's algorithm like I am new to graphs.",
    icon: Sparkles
  },
  {
    title: 'Debug my code',
    description: 'Find issues and suggest fixes quickly.',
    prompt: 'Review my pseudocode for dynamic programming and spot issues.',
    icon: Wand2
  },
  {
    title: 'Create a study guide',
    description: 'Generate concise summaries and checkpoints.',
    prompt: 'Summarize the key ideas from the last lecture into a study sheet.',
    icon: BookOpen
  },
  {
    title: 'Check complexity',
    description: 'Validate time and space complexity.',
    prompt: 'What is the time complexity of merge sort and how does it compare to quicksort?',
    icon: Lightbulb
  }
];

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showFullChat, setShowFullChat] = useState<boolean>(false);
  const [showSourcesModal, setShowSourcesModal] = useState<boolean>(false);
  const [selectedSources, setSelectedSources] = useState<SourceInfo[]>([]);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const { selectedCourse } = useCourse();

  const courseLabel = useMemo(() => {
    if (!selectedCourse) return 'Select a course to ground answers';
    return `${selectedCourse.code} — ${selectedCourse.title}`;
  }, [selectedCourse]);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const formatTimestamp = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const getAIResponse = async (userMessage: string): Promise<void> => {
    setIsLoading(true);
    try {
      if (!selectedCourse) {
        throw new Error('Please select a course first so I can use the right material.');
      }

      const response = await qaApiService.askQuestion(userMessage, selectedCourse.course_id);

      const aiMessage: ChatMessage = {
        id: Date.now(),
        text: response.answer,
        isUser: false,
        timestamp: formatTimestamp(),
        sources: response.sources
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('QA API error:', error);
      const friendlyMessage =
        error instanceof Error
          ? `I ran into an issue: ${error.message}`
          : 'Something went wrong while processing your question. Please try again.';

      const errorMessage: ChatMessage = {
        id: Date.now(),
        text: friendlyMessage,
        isUser: false,
        timestamp: formatTimestamp(),
        error: true
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (text: string): Promise<void> => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    setShowFullChat(true);

    const userMessage: ChatMessage = {
      id: Date.now(),
      text: trimmed,
      isUser: true,
      timestamp: formatTimestamp()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    await getAIResponse(trimmed);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    await sendMessage(inputValue);
  };

  const handleKeyDown = async (
    e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>
  ): Promise<void> => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handlePromptSelect = (prompt: string): void => {
    setInputValue(prompt);
    composerRef.current?.focus();
    if (!showFullChat) {
      setShowFullChat(true);
    }
  };

  const handleCopy = async (message: ChatMessage): Promise<void> => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopiedMessageId(message.id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy message', err);
    }
  };

  const handleViewSources = (sources: SourceInfo[]) => {
    setSelectedSources(sources);
    setShowSourcesModal(true);
  };

  const resetChat = (): void => {
    setMessages([]);
    setInputValue('');
    setShowFullChat(false);
    setSelectedSources([]);
    setShowSourcesModal(false);
    setCopiedMessageId(null);
    composerRef.current?.focus();
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.isUser;
    const AvatarIcon = isUser ? User : Bot;

    return (
      <div
        key={message.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
      >
        <div
          className={`flex items-start gap-3 max-w-4xl ${
            isUser ? 'flex-row-reverse space-x-reverse' : ''
          }`}
        >
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md text-white ${
              isUser
                ? 'bg-gradient-to-br from-vt-maroon to-vt-orange'
                : 'bg-gradient-to-br from-green-500 to-emerald-600'
            }`}
          >
            <AvatarIcon className="w-5 h-5" />
          </div>

          <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
            <div
              className={`px-5 py-4 rounded-2xl shadow-sm border transition-all duration-200 ${
                isUser
                  ? 'bg-white text-slate-900 border-slate-200'
                  : 'bg-white/90 text-slate-900 border-slate-200'
              } ${message.error ? 'border-amber-300 bg-amber-50' : ''}`}
              style={{ maxWidth: '42rem' }}
            >
              {isUser ? (
                <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
              ) : (
                <div className="markdown-content leading-relaxed">{formatMarkdown(message.text)}</div>
              )}
            </div>

            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 px-1">
              <span>{message.timestamp}</span>

              {!isUser && (
                <>
                  <button
                    onClick={() => handleCopy(message)}
                    className="inline-flex items-center gap-1 text-slate-500 hover:text-vt-maroon transition-colors"
                    title="Copy answer"
                  >
                    {copiedMessageId === message.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {message.sources && message.sources.length > 0 && (
                    <button
                      onClick={() => handleViewSources(message.sources!)}
                      className="inline-flex items-center gap-1 rounded-full bg-vt-maroon/10 px-3 py-1 font-medium text-vt-maroon hover:bg-vt-maroon/20 transition-colors"
                    >
                      <DocumentTextIcon className="w-4 h-4" />
                      Sources ({message.sources.length})
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderComposer = () => (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative rounded-2xl border-2 border-slate-200 bg-white shadow-sm focus-within:border-vt-maroon focus-within:shadow-md transition-all duration-200">
        <textarea
          ref={composerRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about the course, lectures, or assignments..."
          className="w-full px-4 md:px-5 py-4 pr-24 bg-transparent rounded-2xl resize-none focus:outline-none leading-relaxed max-h-44"
          rows={1}
          style={{ minHeight: '64px' }}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-all duration-150 ${
              inputValue.trim() && !isLoading
                ? 'bg-vt-maroon text-white hover:bg-vt-maroon/90 shadow-sm'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Send
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14"></path>
                  <path d="M12 5l7 7-7 7"></path>
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-slate-500 text-center">
        Responses stay grounded to your course. Press Enter to send, Shift+Enter for a new line.
      </p>
    </form>
  );

  const renderQuickActions = () => (
    <div className="flex flex-wrap gap-2">
      {quickPrompts.map((prompt) => {
        const Icon = prompt.icon;
        return (
          <button
            key={prompt.title}
            onClick={() => handlePromptSelect(prompt.prompt)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:border-vt-maroon hover:text-vt-maroon transition-colors"
          >
            <Icon className="w-4 h-4" />
            {prompt.title}
          </button>
        );
      })}
    </div>
  );

  const renderIntro = () => (
    <div className="flex-1 grid lg:grid-cols-3 gap-4 animate-fadeIn">
      <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white/90 shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-vt-maroon to-vt-orange text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Start a conversation</p>
            <h2 className="text-2xl font-semibold text-slate-900">Faster, cleaner chat experience</h2>
            <p className="text-sm text-slate-600">
              Ground answers with your course materials, request sources, and copy outputs in one click.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {quickPrompts.map((prompt) => {
            const Icon = prompt.icon;
            return (
              <button
                key={prompt.title}
                onClick={() => handlePromptSelect(prompt.prompt)}
                className="group rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-vt-maroon transition-all duration-200 p-4 text-left shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white text-vt-maroon shadow-sm group-hover:shadow">
                    <Icon className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{prompt.title}</p>
                    <p className="text-sm text-slate-600">{prompt.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-inner">
          {renderComposer()}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">What you can ask</p>
            <p className="text-xs text-slate-500">Grounded answers with citations when available.</p>
          </div>
        </div>

        <ul className="space-y-3 text-sm text-slate-700">
          <li className="flex gap-2">
            <span className="text-vt-maroon">•</span>
            Generate walkthroughs and code explanations tailored to the course.
          </li>
          <li className="flex gap-2">
            <span className="text-vt-maroon">•</span>
            Get summaries, study guides, and complexity checks instantly.
          </li>
          <li className="flex gap-2">
            <span className="text-vt-maroon">•</span>
            Tap “Sources” on answers to review supporting materials.
          </li>
        </ul>

        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600">
          Tip: selecting a course boosts relevance and lets the assistant cite the exact notes or files it used.
        </div>
      </div>
    </div>
  );

  const renderChatExperience = () => (
    <div className="flex-1 flex flex-col gap-4 animate-fadeIn min-h-0">
      <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur">
        <div className="h-full flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-6">
            {messages.length === 0 && !isLoading && (
              <div className="text-center text-slate-500 text-sm">
                Ask your first question to start a new conversation.
              </div>
            )}

            {messages.map(renderMessage)}

            {isLoading && (
              <div className="flex items-center gap-3 text-slate-500 text-sm animate-fadeIn">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Thinking with your course materials...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-slate-200 bg-slate-50/70 px-4 md:px-6 py-4 space-y-3">
            {renderQuickActions()}
            {renderComposer()}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col h-full gap-4 overflow-hidden">
        <div className="rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur shrink-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-vt-maroon to-vt-orange text-white flex items-center justify-center shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">AI Lecture Assistant</p>
                <h1 className="text-xl font-semibold text-slate-900">Chat, cite, and learn faster</h1>
                <p className="text-sm text-slate-600">{courseLabel}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 text-xs rounded-full border ${
                  selectedCourse
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {selectedCourse ? 'Course context ready' : 'Select a course for best grounding'}
              </span>
              <button
                onClick={resetChat}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-vt-maroon hover:text-vt-maroon transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                New chat
              </button>
            </div>
          </div>
        </div>

        {!showFullChat && messages.length === 0 ? renderIntro() : renderChatExperience()}

        {showSourcesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowSourcesModal(false)}
            />
            <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-vt-maroon to-vt-orange text-white">
                <div className="flex items-center gap-3">
                  <DocumentTextIcon className="w-6 h-6" />
                  <div>
                    <p className="text-sm uppercase tracking-wide text-white/80">Sources</p>
                    <p className="text-lg font-semibold">
                      {selectedSources.length} referenced item{selectedSources.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSourcesModal(false)}
                  className="rounded-full p-1 hover:bg-white/20 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="max-h-[65vh] overflow-y-auto p-4 space-y-3 bg-slate-50">
                {selectedSources.map((source, index) => (
                  <div
                    key={`${source.sourceId}-${index}`}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl" aria-hidden>
                        {getSourceTypeIcon(source.sourceType)}
                      </span>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getSourceTypeColor(
                              source.sourceType
                            )}`}
                          >
                            {source.sourceType?.charAt(0).toUpperCase() + source.sourceType?.slice(1) || 'Source'}
                          </span>
                          {source.relevanceScore !== null && source.relevanceScore !== undefined && (
                            <span className="text-xs text-slate-500">
                              {Math.round(source.relevanceScore * 100)}% match
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-slate-900 text-sm truncate">
                          {source.title || source.fileName || `${source.sourceType} ${source.sourceId}`}
                        </p>
                        {source.fileName && source.title !== source.fileName && (
                          <p className="text-xs text-slate-500">📁 {source.fileName}</p>
                        )}
                        {source.excerpt && (
                          <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <p className="text-xs text-slate-700 italic">"{source.excerpt}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-5 py-3 bg-white border-t border-slate-200 text-xs text-slate-500 text-center">
                These sources were used to craft the answer. Please verify important details.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const getSourceTypeIcon = (sourceType: string) => {
  switch (sourceType?.toLowerCase()) {
    case 'notes':
      return '📝';
    case 'syllabus':
      return '📋';
    case 'assignment':
      return '📚';
    case 'announcement':
      return '📢';
    case 'module':
      return '📦';
    case 'page':
      return '📄';
    default:
      return '📎';
  }
};

const getSourceTypeColor = (sourceType: string) => {
  switch (sourceType?.toLowerCase()) {
    case 'notes':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'syllabus':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'assignment':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'announcement':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'module':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'page':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default Chat;
