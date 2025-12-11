import { useState, useEffect } from 'react';
import EmployeeLogin from './components/EmployeeLogin';
import ChatInterface from './components/ChatInterface';
import MemoriesModal from './components/MemoriesModal';

function App() {
  const [employee, setEmployee] = useState(null);
  const [showMemories, setShowMemories] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const savedEmployee = localStorage.getItem('employee');
    if (savedEmployee) {
      try {
        setEmployee(JSON.parse(savedEmployee));
      } catch (e) {
        localStorage.removeItem('employee');
      }
    }
  }, []);

  const handleLogin = (employeeData) => {
    setEmployee(employeeData);
    localStorage.setItem('employee', JSON.stringify(employeeData));
  };

  const handleLogout = () => {
    setEmployee(null);
    localStorage.removeItem('employee');
  };

  if (!employee) {
    return <EmployeeLogin onLogin={handleLogin} />;
  }

  return (
    <>
      <ChatInterface
        employee={employee}
        onShowMemories={() => setShowMemories(true)}
        onLogout={handleLogout}
      />
      <MemoriesModal
        employee={employee}
        isOpen={showMemories}
        onClose={() => setShowMemories(false)}
      />
    </>
  );
}

export default App;
