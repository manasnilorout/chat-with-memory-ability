import { useState, useEffect } from 'react';
import { memoriesApi } from '../services/api';

// Category display configuration
const CATEGORY_CONFIG = {
  food_preferences: {
    label: 'Food',
    color: 'bg-orange-100 text-orange-700',
    icon: '🍽️'
  },
  travel_preferences: {
    label: 'Travel',
    color: 'bg-blue-100 text-blue-700',
    icon: '🚗'
  },
  work_schedule: {
    label: 'Work',
    color: 'bg-purple-100 text-purple-700',
    icon: '💼'
  },
  leave_time_off: {
    label: 'Leave',
    color: 'bg-green-100 text-green-700',
    icon: '🏖️'
  },
  expense_finance: {
    label: 'Expense',
    color: 'bg-yellow-100 text-yellow-700',
    icon: '💰'
  },
  personal_info: {
    label: 'Personal',
    color: 'bg-pink-100 text-pink-700',
    icon: '👤'
  },
  communication_style: {
    label: 'Communication',
    color: 'bg-cyan-100 text-cyan-700',
    icon: '💬'
  },
  general_preferences: {
    label: 'General',
    color: 'bg-gray-100 text-gray-700',
    icon: '⚙️'
  }
};

function MemoriesModal({ employee, isOpen, onClose }) {
  const [memories, setMemories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    if (isOpen) {
      loadMemories();
    }
  }, [isOpen, employee.employee_id]);

  const loadMemories = async () => {
    setIsLoading(true);
    setError('');
    setSearchQuery('');

    try {
      const data = await memoriesApi.getAll(employee.employee_id);
      setMemories(data.memories || []);
    } catch (err) {
      setError('Failed to load memories');
      console.error('Error loading memories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadMemories();
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      const data = await memoriesApi.search(employee.employee_id, searchQuery);
      setMemories(data.memories || []);
    } catch (err) {
      setError('Failed to search memories');
      console.error('Error searching memories:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDeleteMemory = async (memoryId) => {
    if (!confirm('Are you sure you want to delete this memory?')) return;

    try {
      await memoriesApi.delete(employee.employee_id, memoryId);
      setMemories(prev => prev.filter(m => m.id !== memoryId));
    } catch (err) {
      console.error('Error deleting memory:', err);
      setError('Failed to delete memory');
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete ALL memories? This cannot be undone.')) return;

    try {
      await memoriesApi.deleteAll(employee.employee_id);
      setMemories([]);
    } catch (err) {
      console.error('Error deleting all memories:', err);
      setError('Failed to delete memories');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategory = (memory) => {
    return memory.metadata?.category || memory.categories?.[0] || 'general_preferences';
  };

  const getCategoryConfig = (category) => {
    return CATEGORY_CONFIG[category] || CATEGORY_CONFIG.general_preferences;
  };

  // Get unique categories from memories for filter
  const availableCategories = [...new Set(memories.map(getCategory))];

  // Filter memories by category
  const filteredMemories = filterCategory === 'all'
    ? memories
    : memories.filter(m => getCategory(m) === filterCategory);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Memories</h2>
              <p className="text-sm text-gray-500">What the assistant remembers about you</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-3 border-b border-gray-100">
          <form onSubmit={handleSearch} className="flex space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={loadMemories}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
            )}
          </form>

          {/* Category Filters */}
          {availableCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  filterCategory === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {availableCategories.map(cat => {
                const config = getCategoryConfig(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors flex items-center space-x-1 ${
                      filterCategory === cat
                        ? 'bg-indigo-600 text-white'
                        : `${config.color} hover:opacity-80`
                    }`}
                  >
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500">Loading memories...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-red-600">{error}</p>
              <button
                onClick={loadMemories}
                className="mt-4 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : memories.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-500">No memories yet</p>
              <p className="text-sm text-gray-400 mt-1">Start chatting to build up your memory</p>
            </div>
          ) : filteredMemories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No memories in this category</p>
              <button
                onClick={() => setFilterCategory('all')}
                className="mt-2 text-sm text-indigo-600 hover:text-indigo-700"
              >
                Show all memories
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMemories.map((memory) => {
                const category = getCategory(memory);
                const categoryConfig = getCategoryConfig(category);
                return (
                  <div
                    key={memory.id}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-indigo-200 transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-0.5 text-xs rounded-full flex items-center space-x-1 ${categoryConfig.color}`}>
                            <span>{categoryConfig.icon}</span>
                            <span>{categoryConfig.label}</span>
                          </span>
                        </div>
                        <p className="text-gray-800">{memory.memory}</p>
                        <div className="flex items-center space-x-3 mt-2">
                          <span className="text-xs text-gray-400">
                            {formatDate(memory.created_at || memory.createdAt)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteMemory(memory.id)}
                        className="opacity-0 group-hover:opacity-100 ml-3 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete memory"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 rounded-b-2xl">
          <div className="text-sm text-gray-500">
            {memories.length} {memories.length === 1 ? 'memory' : 'memories'} stored
          </div>
          <div className="flex space-x-2">
            {memories.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Delete All
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemoriesModal;
