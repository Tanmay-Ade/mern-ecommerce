import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/auth-slice';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the token from URL
        const urlParams = new URLSearchParams(window.location.search);
        const jsonData = urlParams.get('data');
        
        if (jsonData) {
          const data = JSON.parse(decodeURIComponent(jsonData));
          
          if (data.success) {
            // Store token in localStorage
            localStorage.setItem('token', data.token);
            
            // Update Redux state
            dispatch(setUser(data.user));
            
            // Navigate based on role
            const destination = data.user.role === 'admin' 
              ? '/admin/dashboard' 
              : '/shop/home';
              
            navigate(destination);
          }
        }
      } catch (error) {
        navigate('/auth/login');
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Processing your login...</h2>
        <p className="text-gray-600">Please wait while we redirect you</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
// This is client/src/components/auth/GoogleCallback.jsx