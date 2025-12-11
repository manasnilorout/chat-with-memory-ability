import OpenAI from 'openai';
import mem0Service from './mem0Service.js';
import {
  cabBookingSystem,
  foodOrderingSystem,
  expenseReportSystem,
  timesheetSystem,
  leaveRequestSystem
} from './mockTaskSystems.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Define available tools/functions for OpenAI
const tools = [
  {
    type: 'function',
    function: {
      name: 'book_cab',
      description: 'Book a cab for the employee. Use this when the user wants to book a cab or taxi.',
      parameters: {
        type: 'object',
        properties: {
          pickupLocation: { type: 'string', description: 'Pickup location' },
          dropLocation: { type: 'string', description: 'Drop/destination location' },
          pickupTime: { type: 'string', description: 'Pickup time (e.g., "9:00 AM", "14:30")' },
          date: { type: 'string', description: 'Date for the booking (YYYY-MM-DD format)' }
        },
        required: ['pickupLocation', 'dropLocation']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'cancel_cab',
      description: 'Cancel a cab booking',
      parameters: {
        type: 'object',
        properties: {
          bookingId: { type: 'string', description: 'The booking ID to cancel' }
        },
        required: ['bookingId']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_cab_bookings',
      description: 'Get all cab bookings for the employee',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'order_food',
      description: 'Order food for the employee. Use this when the user wants to order food or meals.',
      parameters: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of food items to order (e.g., ["biryani", "coffee"])'
          },
          deliveryLocation: { type: 'string', description: 'Where to deliver the food (e.g., "desk", "meeting room 3")' }
        },
        required: ['items']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_food_menu',
      description: 'Get the available food menu',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_food_orders',
      description: 'Get all food orders for the employee',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'submit_expense',
      description: 'Submit an expense report for reimbursement',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['Travel', 'Meals', 'Office Supplies', 'Client Entertainment', 'Training', 'Equipment', 'Other'],
            description: 'Expense category'
          },
          amount: { type: 'number', description: 'Amount in rupees' },
          description: { type: 'string', description: 'Description of the expense' },
          date: { type: 'string', description: 'Date of expense (YYYY-MM-DD)' }
        },
        required: ['category', 'amount', 'description']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_expense_reports',
      description: 'Get expense reports for the employee',
      parameters: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['PENDING_APPROVAL', 'APPROVED', 'REJECTED'],
            description: 'Filter by status (optional)'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'log_timesheet',
      description: 'Log hours in the timesheet',
      parameters: {
        type: 'object',
        properties: {
          project: { type: 'string', description: 'Project name' },
          hours: { type: 'number', description: 'Number of hours worked' },
          description: { type: 'string', description: 'Work description' },
          date: { type: 'string', description: 'Date (YYYY-MM-DD)' }
        },
        required: ['project', 'hours']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_timesheet_summary',
      description: 'Get weekly timesheet summary',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_projects',
      description: 'Get list of available projects for timesheet',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'request_leave',
      description: 'Submit a leave request',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Comp Off'],
            description: 'Type of leave'
          },
          startDate: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
          endDate: { type: 'string', description: 'End date (YYYY-MM-DD)' },
          reason: { type: 'string', description: 'Reason for leave' }
        },
        required: ['type', 'startDate', 'reason']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_leave_balance',
      description: 'Get leave balance for the employee',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_leave_requests',
      description: 'Get all leave requests for the employee',
      parameters: { type: 'object', properties: {} }
    }
  }
];

// Execute tool calls
function executeTool(toolName, args, employeeId) {
  switch (toolName) {
    // Cab booking
    case 'book_cab':
      return cabBookingSystem.book(employeeId, args);
    case 'cancel_cab':
      return cabBookingSystem.cancel(employeeId, args.bookingId);
    case 'get_cab_bookings':
      return cabBookingSystem.getBookings(employeeId);

    // Food ordering
    case 'order_food':
      return foodOrderingSystem.placeOrder(employeeId, args);
    case 'get_food_menu':
      return foodOrderingSystem.getMenu();
    case 'get_food_orders':
      return foodOrderingSystem.getOrders(employeeId);

    // Expense reports
    case 'submit_expense':
      return expenseReportSystem.submit(employeeId, args);
    case 'get_expense_reports':
      return expenseReportSystem.getReports(employeeId, args.status);

    // Timesheet
    case 'log_timesheet':
      return timesheetSystem.logHours(employeeId, args);
    case 'get_timesheet_summary':
      return timesheetSystem.getWeeklySummary(employeeId);
    case 'get_projects':
      return timesheetSystem.getProjects();

    // Leave requests
    case 'request_leave':
      return leaveRequestSystem.submit(employeeId, args);
    case 'get_leave_balance':
      return leaveRequestSystem.getBalance(employeeId);
    case 'get_leave_requests':
      return leaveRequestSystem.getRequests(employeeId);

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

// Build system prompt with employee context and memories
function buildSystemPrompt(employee, memories) {
  const memoriesContext = memories && memories.length > 0
    ? `\n\nRelevant memories about this employee:\n${memories.map(m => `- ${m.memory}`).join('\n')}`
    : '';

  return `You are a helpful AI assistant for ${employee.name} (Employee ID: ${employee.employee_id}), who works in the ${employee.department || 'General'} department.

You help employees with their daily tasks including:
- Booking cabs for commute
- Ordering food from the cafeteria
- Submitting expense reports
- Logging timesheet entries
- Requesting leaves

Be friendly, professional, and proactive. If you remember something about the employee's preferences or past interactions, use that to provide personalized assistance.

Today's date is ${new Date().toISOString().split('T')[0]}.
${memoriesContext}

Important guidelines:
1. When performing actions (booking, ordering, submitting), always confirm the details before executing.
2. Provide clear summaries after completing tasks.
3. If you notice patterns in the employee's requests, mention them to be helpful.
4. Be concise but friendly in your responses.`;
}

// Memory categories for classification
const MEMORY_CATEGORIES = [
  'food_preferences',      // Food likes, dislikes, dietary restrictions, favorite restaurants
  'travel_preferences',    // Commute preferences, favorite routes, home/office locations
  'work_schedule',         // Work hours, meeting patterns, busy times
  'leave_time_off',        // Vacation plans, leave patterns, holidays
  'expense_finance',       // Spending habits, budget preferences, reimbursement patterns
  'personal_info',         // Personal details, family, health conditions
  'communication_style',   // How they prefer to be communicated with
  'general_preferences'    // Other preferences that don't fit above categories
];

class ChatService {
  /**
   * Analyze a conversation to determine:
   * 1. If it should be stored as a memory (contains meaningful new information)
   * 2. What category it belongs to
   * Returns { shouldStore: boolean, category: string | null }
   */
  async analyzeForMemory(userMessage, assistantResponse) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a memory analyzer. Analyze the user message and determine:
1. If it contains NEW, MEANINGFUL information worth remembering for future interactions
2. What category it belongs to

STORE memory if the message contains:
- Personal preferences (food likes/dislikes, dietary restrictions, favorite items)
- Personal information (home address, usual commute locations, work schedule)
- Habits or patterns (e.g., "I usually order coffee at 10am")
- Important context about their life (e.g., "I have a meeting tomorrow", "I'm vegetarian")
- Corrections to previous assumptions

DO NOT store memory if the message is:
- A simple transactional request using already-known preferences (e.g., "order my usual", "book a cab")
- A greeting or small talk
- A question about status or information (e.g., "what's my leave balance?", "show my orders")
- A confirmation or acknowledgment (e.g., "yes", "okay", "thanks")
- A request that doesn't reveal new personal information

CATEGORIES (use exactly these values):
- food_preferences: Food likes, dislikes, dietary restrictions, allergies, favorite meals/restaurants
- travel_preferences: Commute preferences, pickup/drop locations, home address, office location, cab preferences
- work_schedule: Work hours, meeting patterns, busy times, project schedules
- leave_time_off: Vacation plans, leave patterns, holidays, time-off preferences
- expense_finance: Spending habits, budget preferences, expense categories
- personal_info: Personal details, family info, health conditions, emergency contacts
- communication_style: Communication preferences, notification settings
- general_preferences: Other preferences that don't fit above categories

Respond in JSON format ONLY:
{"shouldStore": true/false, "category": "category_name" or null}`
          },
          {
            role: 'user',
            content: `User message: "${userMessage}"\n\nAssistant response: "${assistantResponse}"`
          }
        ],
        temperature: 0,
        max_tokens: 50,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0].message.content);
      return {
        shouldStore: result.shouldStore === true,
        category: result.category || 'general_preferences'
      };
    } catch (error) {
      console.error('Error analyzing memory relevance:', error);
      // Default to not storing on error to avoid noise
      return { shouldStore: false, category: null };
    }
  }

  async processMessage(employeeId, employee, message, conversationHistory = []) {
    try {
      // Search for relevant memories to provide context
      let relevantMemories = [];
      try {
        relevantMemories = await mem0Service.searchMemories(message, employeeId, 5);
      } catch (error) {
        console.error('Error fetching memories:', error);
        // Continue without memories if there's an error
      }

      // Build messages array for OpenAI
      const messages = [
        { role: 'system', content: buildSystemPrompt(employee, relevantMemories) },
        ...conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      // Call OpenAI with function calling
      let response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        tools,
        tool_choice: 'auto',
        temperature: 0.7
      });

      let assistantMessage = response.choices[0].message;

      // Handle tool calls if any
      while (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        // Add assistant message with tool calls to messages
        messages.push(assistantMessage);

        // Execute each tool call
        for (const toolCall of assistantMessage.tool_calls) {
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments);

          console.log(`Executing tool: ${toolName}`, toolArgs);

          const toolResult = executeTool(toolName, toolArgs, employeeId);

          // Add tool result to messages
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult)
          });
        }

        // Get next response from OpenAI
        response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages,
          tools,
          tool_choice: 'auto',
          temperature: 0.7
        });

        assistantMessage = response.choices[0].message;
      }

      const assistantContent = assistantMessage.content;

      // Analyze if this conversation should be stored and categorize it
      const memoryAnalysis = await this.analyzeForMemory(message, assistantContent);

      let memorySaved = null;

      if (memoryAnalysis.shouldStore) {
        try {
          await mem0Service.addMemory(
            [
              { role: 'user', content: message },
              { role: 'assistant', content: assistantContent }
            ],
            employeeId,
            { category: memoryAnalysis.category }
          );
          console.log(`Memory stored with category: ${memoryAnalysis.category}`);
          memorySaved = {
            category: memoryAnalysis.category
          };
        } catch (error) {
          console.error('Error storing memory:', error);
          // Continue even if memory storage fails
        }
      }

      return {
        role: 'assistant',
        content: assistantContent,
        memorySaved
      };
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }
}

export default new ChatService();
