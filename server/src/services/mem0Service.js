import MemoryClient from 'mem0ai';

class Mem0Service {
  constructor() {
    this.client = new MemoryClient({
      apiKey: process.env.MEM0_API_KEY
    });
  }

  /**
   * Add memories from a conversation
   * @param {Array} messages - Array of {role, content} message objects
   * @param {string} employeeId - Employee ID to scope the memory
   * @param {object} metadata - Optional metadata
   */
  async addMemory(messages, employeeId, metadata = {}) {
    try {
      const result = await this.client.add(messages, {
        user_id: employeeId,
        metadata: {
          ...metadata,
          source: 'employee_task_assistant',
          timestamp: new Date().toISOString()
        }
      });
      return result;
    } catch (error) {
      console.error('Error adding memory:', error);
      throw error;
    }
  }

  /**
   * Search for relevant memories
   * @param {string} query - Search query
   * @param {string} employeeId - Employee ID to filter memories
   * @param {number} limit - Maximum number of results
   */
  async searchMemories(query, employeeId, limit = 5) {
    try {
      const results = await this.client.search(query, {
        user_id: employeeId,
        limit
      });
      return results;
    } catch (error) {
      console.error('Error searching memories:', error);
      throw error;
    }
  }

  /**
   * Get all memories for an employee
   * @param {string} employeeId - Employee ID
   */
  async getAllMemories(employeeId) {
    try {
      const memories = await this.client.getAll({
        user_id: employeeId
      });
      return memories;
    } catch (error) {
      console.error('Error getting all memories:', error);
      throw error;
    }
  }

  /**
   * Delete a specific memory
   * @param {string} memoryId - Memory ID to delete
   */
  async deleteMemory(memoryId) {
    try {
      await this.client.delete(memoryId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting memory:', error);
      throw error;
    }
  }

  /**
   * Delete all memories for an employee
   * @param {string} employeeId - Employee ID
   */
  async deleteAllMemories(employeeId) {
    try {
      await this.client.deleteAll({
        user_id: employeeId
      });
      return { success: true };
    } catch (error) {
      console.error('Error deleting all memories:', error);
      throw error;
    }
  }
}

export default new Mem0Service();
