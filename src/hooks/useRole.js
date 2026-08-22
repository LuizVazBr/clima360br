import { useState, useEffect } from 'react';

export function useRole() {
  const [role, setRoleState] = useState('gestor');

  useEffect(() => {
    const saved = localStorage.getItem('clima360-role');
    if (saved) setRoleState(saved);
    
    const handleStorage = () => {
      const updated = localStorage.getItem('clima360-role');
      if (updated) setRoleState(updated);
    };
    
    window.addEventListener('role-changed', handleStorage);
    return () => window.removeEventListener('role-changed', handleStorage);
  }, []);

  const setRole = (newRole) => {
    localStorage.setItem('clima360-role', newRole);
    setRoleState(newRole);
    window.dispatchEvent(new Event('role-changed'));
  };

  return [role, setRole];
}
