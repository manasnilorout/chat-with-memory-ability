import express from 'express';
import { employeeDb, chatDb } from '../db/database.js';
import chatService from '../services/chatService.js';

const router = express.Router();

// Send a chat message
router.post('/', async (req, res) => {
  try {
    const { employeeId, message } = req.body;

    if (!employeeId || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['employeeId', 'message']
      });
    }

    // Verify employee exists
    const employee = employeeDb.findByEmployeeId(employeeId);
    if (!employee) {
      return res.status(404).json({
        error: 'Employee not found',
        employeeId
      });
    }

    // Get or create chat session
    let session = chatDb.getLatestSession(employeeId);
    if (!session) {
      const sessionId = chatDb.createSession(employeeId);
      session = { id: sessionId };
    }

    // Get recent conversation history for context
    const recentMessages = chatDb.getRecentMessages(employeeId, 10);
    const conversationHistory = recentMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Store user message
    chatDb.addMessage(session.id, 'user', message);

    // Process message with ChatService
    const response = await chatService.processMessage(
      employeeId,
      employee,
      message,
      conversationHistory
    );

    // Store assistant response
    chatDb.addMessage(session.id, 'assistant', response.content);

    res.json({
      message: response.content,
      sessionId: session.id,
      memorySaved: response.memorySaved || null
    });
  } catch (error) {
    console.error('Error processing chat message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Get chat history for an employee
router.get('/history/:employeeId', (req, res) => {
  try {
    const { employeeId } = req.params;
    const { limit = 50 } = req.query;

    // Verify employee exists
    const employee = employeeDb.findByEmployeeId(employeeId);
    if (!employee) {
      return res.status(404).json({
        error: 'Employee not found',
        employeeId
      });
    }

    // Get latest session
    const session = chatDb.getLatestSession(employeeId);
    if (!session) {
      return res.json({ messages: [] });
    }

    const messages = chatDb.getSessionMessages(session.id, parseInt(limit));

    res.json({
      sessionId: session.id,
      messages: messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.created_at
      }))
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Start a new chat session (clears context)
router.post('/new-session', (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ error: 'employeeId is required' });
    }

    // Verify employee exists
    const employee = employeeDb.findByEmployeeId(employeeId);
    if (!employee) {
      return res.status(404).json({
        error: 'Employee not found',
        employeeId
      });
    }

    const sessionId = chatDb.createSession(employeeId);

    res.json({
      message: 'New chat session created',
      sessionId
    });
  } catch (error) {
    console.error('Error creating new session:', error);
    res.status(500).json({ error: 'Failed to create new session' });
  }
});

export default router;
