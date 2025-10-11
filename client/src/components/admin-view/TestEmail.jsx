import React from 'react';
import API_BASE_URL from '@/config/api';

const TestEmail = () => {
  const handleTestEmail = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token being sent:', token); // Add this to verify token

      const response = await fetch(`${API_BASE_URL}/api/shop/orders/test-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log('Email test result:', data);
      if (data.success) {
        alert('Test email sent successfully!');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log('Test failed:', error);
      alert('Error sending test email');
    }
  };

  return (
    <button 
      onClick={handleTestEmail}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Test Email Service
    </button>
  );
};

export default TestEmail;
// This is client/src/components/admin-view/TestEmail.jsx