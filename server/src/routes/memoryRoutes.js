import express from 'express';
import { employeeDb } from '../db/database.js';
import mem0Service from '../services/mem0Service.js';

const router = express.Router();

// Get all memories for an employee
router.get('/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Verify employee exists
    const employee = employeeDb.findByEmployeeId(employeeId);
    if (!employee) {
      return res.status(404).json({
        error: 'Employee not found',
        employeeId
      });
    }

    const memories = await mem0Service.getAllMemories(employeeId);

    res.json({
      employeeId,
      employeeName: employee.name,
      memories: memories || [],
      count: memories?.length || 0
    });
  } catch (error) {
    console.error('Error fetching memories:', error);
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
});

// Search memories for an employee
router.post('/:employeeId/search', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { query, limit = 5 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Verify employee exists
    const employee = employeeDb.findByEmployeeId(employeeId);
    if (!employee) {
      return res.status(404).json({
        error: 'Employee not found',
        employeeId
      });
    }

    const memories = await mem0Service.searchMemories(query, employeeId, limit);

    res.json({
      employeeId,
      query,
      memories: memories || [],
      count: memories?.length || 0
    });
  } catch (error) {
    console.error('Error searching memories:', error);
    res.status(500).json({ error: 'Failed to search memories' });
  }
});

// Delete a specific memory
router.delete('/:employeeId/:memoryId', async (req, res) => {
  try {
    const { employeeId, memoryId } = req.params;

    // Verify employee exists
    const employee = employeeDb.findByEmployeeId(employeeId);
    if (!employee) {
      return res.status(404).json({
        error: 'Employee not found',
        employeeId
      });
    }

    await mem0Service.deleteMemory(memoryId);

    res.json({
      message: 'Memory deleted successfully',
      memoryId
    });
  } catch (error) {
    console.error('Error deleting memory:', error);
    res.status(500).json({ error: 'Failed to delete memory' });
  }
});

// Delete all memories for an employee
router.delete('/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Verify employee exists
    const employee = employeeDb.findByEmployeeId(employeeId);
    if (!employee) {
      return res.status(404).json({
        error: 'Employee not found',
        employeeId
      });
    }

    await mem0Service.deleteAllMemories(employeeId);

    res.json({
      message: 'All memories deleted successfully',
      employeeId
    });
  } catch (error) {
    console.error('Error deleting all memories:', error);
    res.status(500).json({ error: 'Failed to delete memories' });
  }
});

export default router;
