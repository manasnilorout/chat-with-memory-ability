import { v4 as uuidv4 } from 'uuid';

// In-memory storage for mock data
const mockData = {
  cabBookings: new Map(),
  foodOrders: new Map(),
  expenseReports: new Map(),
  timesheets: new Map(),
  leaveRequests: new Map()
};

// Mock Cab Booking System
export const cabBookingSystem = {
  book: (employeeId, details) => {
    const bookingId = `CAB-${uuidv4().slice(0, 8).toUpperCase()}`;
    const booking = {
      id: bookingId,
      employeeId,
      pickupLocation: details.pickupLocation || 'Office',
      dropLocation: details.dropLocation || 'Home',
      pickupTime: details.pickupTime || new Date().toISOString(),
      date: details.date || new Date().toISOString().split('T')[0],
      status: 'CONFIRMED',
      estimatedFare: Math.floor(Math.random() * 300) + 100,
      driverName: ['Rahul', 'Amit', 'Priya', 'Sneha'][Math.floor(Math.random() * 4)],
      vehicleNumber: `KA-${Math.floor(Math.random() * 99)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 9000) + 1000}`,
      createdAt: new Date().toISOString()
    };

    if (!mockData.cabBookings.has(employeeId)) {
      mockData.cabBookings.set(employeeId, []);
    }
    mockData.cabBookings.get(employeeId).push(booking);

    return booking;
  },

  cancel: (employeeId, bookingId) => {
    const bookings = mockData.cabBookings.get(employeeId) || [];
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      booking.status = 'CANCELLED';
      return { success: true, booking };
    }
    return { success: false, message: 'Booking not found' };
  },

  getBookings: (employeeId) => {
    return mockData.cabBookings.get(employeeId) || [];
  },

  getUpcoming: (employeeId) => {
    const bookings = mockData.cabBookings.get(employeeId) || [];
    return bookings.filter(b => b.status === 'CONFIRMED' && new Date(b.date) >= new Date());
  }
};

// Mock Food Ordering System
export const foodOrderingSystem = {
  placeOrder: (employeeId, details) => {
    const orderId = `FOOD-${uuidv4().slice(0, 8).toUpperCase()}`;
    const menuItems = {
      'biryani': { name: 'Chicken Biryani', price: 180 },
      'pizza': { name: 'Margherita Pizza', price: 250 },
      'burger': { name: 'Veg Burger', price: 120 },
      'pasta': { name: 'Alfredo Pasta', price: 200 },
      'salad': { name: 'Caesar Salad', price: 150 },
      'sandwich': { name: 'Club Sandwich', price: 140 },
      'coffee': { name: 'Cappuccino', price: 80 },
      'tea': { name: 'Masala Chai', price: 40 },
      'dosa': { name: 'Masala Dosa', price: 90 },
      'idli': { name: 'Idli Sambar', price: 60 },
      'thali': { name: 'Veg Thali', price: 160 },
      'noodles': { name: 'Hakka Noodles', price: 130 }
    };

    const items = details.items || ['biryani'];
    const orderItems = items.map(item => {
      const menuItem = menuItems[item.toLowerCase()] || { name: item, price: 100 };
      return { ...menuItem, quantity: 1 };
    });

    const order = {
      id: orderId,
      employeeId,
      items: orderItems,
      totalAmount: orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      deliveryLocation: details.deliveryLocation || 'Desk',
      status: 'PREPARING',
      estimatedDelivery: new Date(Date.now() + 30 * 60000).toISOString(),
      createdAt: new Date().toISOString()
    };

    if (!mockData.foodOrders.has(employeeId)) {
      mockData.foodOrders.set(employeeId, []);
    }
    mockData.foodOrders.get(employeeId).push(order);

    return order;
  },

  getOrders: (employeeId) => {
    return mockData.foodOrders.get(employeeId) || [];
  },

  cancelOrder: (employeeId, orderId) => {
    const orders = mockData.foodOrders.get(employeeId) || [];
    const order = orders.find(o => o.id === orderId);
    if (order && order.status === 'PREPARING') {
      order.status = 'CANCELLED';
      return { success: true, order };
    }
    return { success: false, message: 'Order not found or cannot be cancelled' };
  },

  getMenu: () => {
    return [
      { category: 'Main Course', items: ['Biryani', 'Pizza', 'Pasta', 'Thali', 'Dosa'] },
      { category: 'Snacks', items: ['Burger', 'Sandwich', 'Idli', 'Noodles'] },
      { category: 'Salads', items: ['Caesar Salad', 'Greek Salad'] },
      { category: 'Beverages', items: ['Coffee', 'Tea', 'Fresh Juice'] }
    ];
  }
};

// Mock Expense Report System
export const expenseReportSystem = {
  submit: (employeeId, details) => {
    const reportId = `EXP-${uuidv4().slice(0, 8).toUpperCase()}`;
    const report = {
      id: reportId,
      employeeId,
      category: details.category || 'Travel',
      amount: details.amount || 0,
      description: details.description || '',
      date: details.date || new Date().toISOString().split('T')[0],
      status: 'PENDING_APPROVAL',
      approver: 'Manager',
      receipts: details.receipts || [],
      createdAt: new Date().toISOString()
    };

    if (!mockData.expenseReports.has(employeeId)) {
      mockData.expenseReports.set(employeeId, []);
    }
    mockData.expenseReports.get(employeeId).push(report);

    return report;
  },

  getReports: (employeeId, status = null) => {
    const reports = mockData.expenseReports.get(employeeId) || [];
    if (status) {
      return reports.filter(r => r.status === status);
    }
    return reports;
  },

  getCategories: () => {
    return ['Travel', 'Meals', 'Office Supplies', 'Client Entertainment', 'Training', 'Equipment', 'Other'];
  },

  getPendingAmount: (employeeId) => {
    const reports = mockData.expenseReports.get(employeeId) || [];
    return reports
      .filter(r => r.status === 'PENDING_APPROVAL')
      .reduce((sum, r) => sum + r.amount, 0);
  }
};

// Mock Timesheet System
export const timesheetSystem = {
  logHours: (employeeId, details) => {
    const entryId = `TS-${uuidv4().slice(0, 8).toUpperCase()}`;
    const entry = {
      id: entryId,
      employeeId,
      date: details.date || new Date().toISOString().split('T')[0],
      project: details.project || 'General',
      hours: details.hours || 8,
      description: details.description || 'Regular work',
      status: 'LOGGED',
      createdAt: new Date().toISOString()
    };

    if (!mockData.timesheets.has(employeeId)) {
      mockData.timesheets.set(employeeId, []);
    }
    mockData.timesheets.get(employeeId).push(entry);

    return entry;
  },

  getEntries: (employeeId, startDate = null, endDate = null) => {
    const entries = mockData.timesheets.get(employeeId) || [];
    if (startDate && endDate) {
      return entries.filter(e => e.date >= startDate && e.date <= endDate);
    }
    return entries;
  },

  getWeeklySummary: (employeeId) => {
    const entries = mockData.timesheets.get(employeeId) || [];
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const weekEntries = entries.filter(e => e.date >= weekStartStr);
    const totalHours = weekEntries.reduce((sum, e) => sum + e.hours, 0);

    return {
      weekStart: weekStartStr,
      totalHours,
      entries: weekEntries,
      remainingHours: Math.max(0, 40 - totalHours)
    };
  },

  getProjects: () => {
    return ['Project Alpha', 'Project Beta', 'Internal', 'Training', 'Meetings', 'General'];
  }
};

// Mock Leave Request System
export const leaveRequestSystem = {
  submit: (employeeId, details) => {
    const requestId = `LEAVE-${uuidv4().slice(0, 8).toUpperCase()}`;
    const request = {
      id: requestId,
      employeeId,
      type: details.type || 'Casual Leave',
      startDate: details.startDate,
      endDate: details.endDate || details.startDate,
      reason: details.reason || '',
      status: 'PENDING_APPROVAL',
      approver: 'Manager',
      createdAt: new Date().toISOString()
    };

    if (!mockData.leaveRequests.has(employeeId)) {
      mockData.leaveRequests.set(employeeId, []);
    }
    mockData.leaveRequests.get(employeeId).push(request);

    return request;
  },

  getRequests: (employeeId) => {
    return mockData.leaveRequests.get(employeeId) || [];
  },

  getBalance: (employeeId) => {
    // Mock leave balance
    return {
      casualLeave: { total: 12, used: 3, available: 9 },
      sickLeave: { total: 10, used: 2, available: 8 },
      earnedLeave: { total: 15, used: 5, available: 10 },
      compOff: { total: 2, used: 0, available: 2 }
    };
  },

  cancel: (employeeId, requestId) => {
    const requests = mockData.leaveRequests.get(employeeId) || [];
    const request = requests.find(r => r.id === requestId);
    if (request && request.status === 'PENDING_APPROVAL') {
      request.status = 'CANCELLED';
      return { success: true, request };
    }
    return { success: false, message: 'Request not found or cannot be cancelled' };
  }
};

// Helper to get all data for an employee (useful for debugging)
export const getAllEmployeeData = (employeeId) => {
  return {
    cabBookings: cabBookingSystem.getBookings(employeeId),
    foodOrders: foodOrderingSystem.getOrders(employeeId),
    expenseReports: expenseReportSystem.getReports(employeeId),
    timesheets: timesheetSystem.getEntries(employeeId),
    leaveRequests: leaveRequestSystem.getRequests(employeeId)
  };
};
