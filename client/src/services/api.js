const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Employee API
export const employeeApi = {
  register: async (employeeData) => {
    const response = await fetch(`${API_URL}/api/employee`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeData)
    });
    return response.json();
  },

  getByEmployeeId: async (employeeId) => {
    const response = await fetch(`${API_URL}/api/employee/${employeeId}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Employee not found');
    }
    return response.json();
  }
};

// Chat API
export const chatApi = {
  sendMessage: async (employeeId, message) => {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId, message })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send message');
    }
    return response.json();
  },

  getHistory: async (employeeId) => {
    const response = await fetch(`${API_URL}/api/chat/history/${employeeId}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch history');
    }
    return response.json();
  },

  newSession: async (employeeId) => {
    const response = await fetch(`${API_URL}/api/chat/new-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId })
    });
    return response.json();
  }
};

// Memories API
export const memoriesApi = {
  getAll: async (employeeId) => {
    const response = await fetch(`${API_URL}/api/memories/${employeeId}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch memories');
    }
    return response.json();
  },

  search: async (employeeId, query) => {
    const response = await fetch(`${API_URL}/api/memories/${employeeId}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    return response.json();
  },

  delete: async (employeeId, memoryId) => {
    const response = await fetch(`${API_URL}/api/memories/${employeeId}/${memoryId}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  deleteAll: async (employeeId) => {
    const response = await fetch(`${API_URL}/api/memories/${employeeId}`, {
      method: 'DELETE'
    });
    return response.json();
  }
};
