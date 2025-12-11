import express from 'express';
import { employeeDb } from '../db/database.js';
import mem0Service from '../services/mem0Service.js';

const router = express.Router();

// Register a new employee
router.post('/', async (req, res) => {
  try {
    const { employeeId, name, email, department } = req.body;

    if (!employeeId || !name || !email) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['employeeId', 'name', 'email']
      });
    }

    // Check if employee already exists
    const existingEmployee = employeeDb.findByEmployeeId(employeeId);
    if (existingEmployee) {
      return res.status(409).json({
        error: 'Employee with this ID already exists',
        employee: existingEmployee
      });
    }

    // Create employee in database
    employeeDb.create(employeeId, name, email, department);

    // Initialize memory for the employee with their profile
    try {
      await mem0Service.addMemory(
        [
          {
            role: 'system',
            content: `New employee registered: ${name} (ID: ${employeeId}), Email: ${email}, Department: ${department || 'Not specified'}`
          }
        ],
        employeeId,
        { type: 'profile', action: 'registration' }
      );
    } catch (memError) {
      console.error('Error initializing employee memory:', memError);
      // Continue even if memory initialization fails
    }

    const employee = employeeDb.findByEmployeeId(employeeId);

    res.status(201).json({
      message: 'Employee registered successfully',
      employee
    });
  } catch (error) {
    console.error('Error registering employee:', error);
    res.status(500).json({ error: 'Failed to register employee' });
  }
});

// Get employee by ID (for login/authentication)
router.get('/:employeeId', (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = employeeDb.findByEmployeeId(employeeId);

    if (!employee) {
      return res.status(404).json({
        error: 'Employee not found',
        employeeId
      });
    }

    res.json({ employee });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// Update employee details
router.put('/:employeeId', (req, res) => {
  try {
    const { employeeId } = req.params;
    const updates = req.body;

    const employee = employeeDb.findByEmployeeId(employeeId);

    if (!employee) {
      return res.status(404).json({
        error: 'Employee not found',
        employeeId
      });
    }

    employeeDb.update(employeeId, updates);

    const updatedEmployee = employeeDb.findByEmployeeId(employeeId);

    res.json({
      message: 'Employee updated successfully',
      employee: updatedEmployee
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// Get all employees (admin endpoint)
router.get('/', (req, res) => {
  try {
    const employees = employeeDb.getAll();
    res.json({ employees });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

export default router;
