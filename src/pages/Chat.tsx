import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, MicrophoneIcon } from '@heroicons/react/24/outline';
import { useCourse } from '../context/CourseContext';
import { qaApiService } from '../api/qa';
import { formatMarkdown } from '../utils/markdownFormatter';

type ChatMessage = {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: string;
};

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showFullChat, setShowFullChat] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { selectedCourse } = useCourse();

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = async (userMessage: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Check if a course is selected
      if (!selectedCourse) {
        throw new Error('Please select a course first to ask questions');
      }
      
      // Call the QA API
      const response = await qaApiService.askQuestion(userMessage, selectedCourse.course_id);
      
      const aiMessage: ChatMessage = {
        id: Date.now(),
        text: response.answer,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('QA API error:', error);
      
      // Show error message to user
      const errorMessage: ChatMessage = {
        id: Date.now(),
        text: error instanceof Error 
          ? `I'm sorry, I encountered an error: ${error.message}` 
          : 'I\'m sorry, I encountered an error processing your question. Please try again.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    if (messages.length === 0) {
      setShowFullChat(true);
    }
    const userMessage: ChatMessage = {
      id: Date.now(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMessage]);
    await getAIResponse(inputValue.trim());
    setInputValue('');
  };

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>): Promise<void> => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const quickPrompts = [
    { icon: "📚", text: "Explain concepts", description: "Understand data structures & algorithms" },
    { icon: "💻", text: "Debug code", description: "Help with coding assignments" },
    { icon: "📝", text: "Study guide", description: "Create exam preparation materials" },
    { icon: "🧮", text: "Analyze complexity", description: "Calculate time & space complexity" }
  ];

  if (!showFullChat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-4xl w-full text-center">
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              AI Learning Assistant
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              {selectedCourse 
                ? `Your intelligent companion for ${selectedCourse.code} - ${selectedCourse.title}.`
                : 'Your intelligent learning companion.'
              }
              <br />
              Get instant help with assignments, concepts, and exam preparation.
            </p>
          </div>

          <div className="mb-8">
            <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
              <div className="relative bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                <button
                  type="button"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                </button>
                
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything"
                  className="w-full pl-14 pr-20 py-4 text-lg bg-transparent rounded-full focus:outline-none focus:ring-0 border-0"
                />
                
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-2">
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <MicrophoneIcon className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M3 6h18l-2 13H5L3 6Z"></path>
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => {
                  setInputValue(prompt.text);
                  inputRef.current?.focus();
                }}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{prompt.icon}</span>
                  <span className="font-medium text-gray-900 group-hover:text-vt-maroon transition-colors">
                    {prompt.text}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{prompt.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 animate-fadeIn">
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-vt-maroon to-vt-orange rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Learning Assistant</h1>
              <p className="text-sm text-gray-500">
                {selectedCourse ? `${selectedCourse.code} - ${selectedCourse.title}` : 'Course Assistant'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setMessages([]);
              setShowFullChat(false);
            }}
            className="px-6 py-2 text-sm font-medium text-white bg-vt-maroon hover:bg-red-800 rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
          >
            New Chat
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-slideIn`}
            >
              <div className={`flex items-start space-x-4 max-w-4xl ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                  message.isUser 
                    ? 'bg-gradient-to-r from-vt-maroon to-red-700 text-white' 
                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                }`}>
                  {message.isUser ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                    </svg>
                  )}
                </div>
                
                <div className={`flex flex-col ${message.isUser ? 'items-end' : 'items-start'}`}>
                  <div className={`px-6 py-4 rounded-2xl max-w-full shadow-md hover:shadow-lg transition-all duration-200 ${
                    message.isUser 
                      ? 'bg-gradient-to-r from-vt-maroon to-red-700 text-white rounded-br-sm' 
                      : 'bg-white border border-gray-200/50 text-gray-900 rounded-bl-sm'
                  }`}>
                    {message.isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                    ) : (
                      <div className="leading-relaxed">
                        {formatMarkdown(message.text)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-2 px-2">
                    <span className="text-xs text-gray-500">{message.timestamp}</span>
                    {!message.isUser && (
                      <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start animate-slideIn">
              <div className="flex items-start space-x-4 max-w-4xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                </div>
                <div className="bg-white border border-gray-200/50 rounded-2xl rounded-bl-sm px-6 py-4 shadow-md">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-vt-maroon rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-vt-maroon rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-vt-maroon rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-500 ml-2">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 px-6 py-6 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative bg-white rounded-3xl border-2 border-gray-200 focus-within:border-vt-maroon focus-within:shadow-lg transition-all duration-300 shadow-md">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about data structures, algorithms, or your assignments..."
                className="w-full px-6 py-4 pr-16 bg-transparent rounded-3xl resize-none focus:outline-none leading-relaxed max-h-40"
                rows={1}
                style={{ minHeight: '56px' }}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-vt-maroon transition-colors duration-200 rounded-lg hover:bg-gray-100"
                >
                  <MicrophoneIcon className="w-5 h-5" />
                </button>
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    inputValue.trim() && !isLoading
                      ? 'bg-vt-maroon text-white hover:bg-red-800 shadow-md hover:shadow-lg scale-100 hover:scale-105'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </form>
          
          <p className="text-xs text-gray-500 text-center mt-3">
            AI can make mistakes. Check important info and verify answers with course materials.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
