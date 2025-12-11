import { useState, useEffect, useRef } from 'react';
import { chatApi } from '../services/api';

// Category display configuration (same as MemoriesModal)
const CATEGORY_CONFIG = {
  food_preferences: { label: 'Food', color: 'bg-orange-100 text-orange-700', icon: '🍽️' },
  travel_preferences: { label: 'Travel', color: 'bg-blue-100 text-blue-700', icon: '🚗' },
  work_schedule: { label: 'Work', color: 'bg-purple-100 text-purple-700', icon: '💼' },
  leave_time_off: { label: 'Leave', color: 'bg-green-100 text-green-700', icon: '🏖️' },
  expense_finance: { label: 'Expense', color: 'bg-yellow-100 text-yellow-700', icon: '💰' },
  personal_info: { label: 'Personal', color: 'bg-pink-100 text-pink-700', icon: '👤' },
  communication_style: { label: 'Communication', color: 'bg-cyan-100 text-cyan-700', icon: '💬' },
  general_preferences: { label: 'General', color: 'bg-gray-100 text-gray-700', icon: '⚙️' }
};

function ChatInterface({ employee, onShowMemories, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, [employee.employee_id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const data = await chatApi.getHistory(employee.employee_id);
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
      } else {
        // Add welcome message for new sessions
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: `Hello ${employee.name}! I'm your personal task assistant. I can help you with:\n\n- Booking cabs for your commute\n- Ordering food from the cafeteria\n- Submitting expense reports\n- Logging timesheet entries\n- Requesting leaves\n\nHow can I assist you today?`,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (err) {
      console.error('Error loading chat history:', err);
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Hello ${employee.name}! I'm your personal task assistant. How can I help you today?`,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError('');

    // Add user message to chat
    const newUserMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newUserMessage]);

    // Add loading indicator
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage(employee.employee_id, userMessage);

      // Add assistant response with memory info if present
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        memorySaved: response.memorySaved || null
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleNewSession = async () => {
    try {
      await chatApi.newSession(employee.employee_id);
      setMessages([{
        id: 'welcome-new',
        role: 'assistant',
        content: `New session started! How can I help you, ${employee.name}?`,
        timestamp: new Date().toISOString()
      }]);
    } catch (err) {
      console.error('Error creating new session:', err);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {employee.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">{employee.name}</h2>
            <p className="text-sm text-gray-500">{employee.department || 'Employee'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onShowMemories}
            className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>Show Memories</span>
          </button>
          <button
            onClick={handleNewSession}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            New Chat
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const categoryConfig = message.memorySaved
            ? CATEGORY_CONFIG[message.memorySaved.category] || CATEGORY_CONFIG.general_preferences
            : null;

          return (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex flex-col">
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-md'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div
                    className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-indigo-200' : 'text-gray-400'
                    }`}
                  >
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>

                {/* Memory Saved Indicator */}
                {message.memorySaved && categoryConfig && (
                  <div className="flex items-center mt-1.5 ml-1">
                    <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs ${categoryConfig.color} animate-fade-in`}>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span>{categoryConfig.icon}</span>
                      <span>Memory saved: {categoryConfig.label}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 shadow-sm border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-gray-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-4">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message... (e.g., 'Book a cab for tomorrow 9am')"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <span>Send</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            'Book a cab',
            'Order food',
            'Submit expense',
            'Log timesheet',
            'Request leave',
            'Check leave balance'
          ].map((action) => (
            <button
              key={action}
              onClick={() => setInputMessage(action)}
              className="px-3 py-1.5 text-sm text-indigo-600 bg-indigo-50 rounded-full hover:bg-indigo-100 transition-colors"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;
