import CommonForm from "@/components/common/Form";
import { loginFormControls, authConfig } from "@/config";
import { useToast } from "@/hooks/use-toast";
import { loginUser, setUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

const initialState = {
  email: "",
  password: "",
};

const Login = () => {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loading } = useSelector((state) => state.auth);

  const handleGoogleLogin = () => {
    try {
      // Store the current page URL in sessionStorage
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      window.location.href = authConfig.googleAuthUrl;
    } catch (error) {
      toast({
        title: "Google Login Failed",
        description: "Unable to connect to Google authentication service",
        variant: 'destructive',
      });
    }
  };

  async function onSubmit(event) {
    event.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: 'destructive',
      });
      return;
    }
  
    try {
      const result = await dispatch(loginUser(formData)).unwrap();
      
      if (result.success) {
        // Store user data and token
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        // Update Redux state
        dispatch(setUser({
          ...result.user,
          token: result.token
        }));
        
        toast({
          title: "Login Successful",
          description: "Welcome back!"
        });
        
        const destination = result.user.role === 'admin' 
          ? authConfig.adminDashboard 
          : authConfig.userDashboard;
          
        navigate(destination, { replace: true });
      } else {
        toast({
          title: "Login Failed",
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.message || "An error occurred during login",
        variant: 'destructive',
      });
    }
  }
  
  

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="mt-2">
          Don't have an account?
          <Link
            className="font-medium text-primary hover:underline ml-2"
            to="/auth/register"
          >
            Sign Up
          </Link>
        </p>
      </div>
      
      <CommonForm
        formControls={loginFormControls}
        buttonText={loading ? "Logging in..." : "Login"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        isBtnDisabled={loading}
      />
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleGoogleLogin}
        disabled={loading}
      >
        <FcGoogle className="h-5 w-5" />
        Continue with Google
      </button>

      <div className="text-center">
        <Link
          to="/auth/forgot-password"
          className="text-sm text-primary hover:underline"
        >
          Forgot your password?
        </Link>
      </div>
    </div>
  );
};

export default Login;
// client/src/pages/auth/Login.jsx