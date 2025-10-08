import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { useEffect } from 'react'
import { Provider, useDispatch } from 'react-redux'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import { checkAuthStatus } from './store/auth-slice'
import App from './App.jsx'
import './index.css'
import store from './store/store.js'
import { Toaster } from './components/ui/toaster.jsx'

const queryClient = new QueryClient()

function AuthCheck() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (document.cookie.includes('token')) {
      dispatch(checkAuthStatus());
    }
  }, [dispatch]);

  return <App />;
}

function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <BrowserRouter>
          <AuthCheck />
          <Toaster />
        </BrowserRouter>
      </Provider>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById('root')).render(<Root />);

// This is client/src/main.jsx