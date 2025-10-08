import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import CommonForm from "@/components/common/Form";

const forgotPasswordControls = [
  {
    id: "email",
    name: "email",
    type: "email",
    placeholder: "Enter your email",
    label: "Email",
    componentType: "input",
  },
];

const initialState = {
  email: "",
};

const ForgotPassword = () => {
  const [formData, setFormData] = useState(initialState);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Reset link sent to your email",
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Reset Password
        </h1>
        <p className="mt-2">
          Remember your password?
          <Link
            className="font-medium text-primary hover:underline ml-2"
            to="/auth/login"
          >
            Login here
          </Link>
        </p>
      </div>
      <CommonForm
        formControls={forgotPasswordControls}
        buttonText={loading ? "Sending..." : "Send Reset Link"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        isBtnDisabled={loading}
      />
    </div>
  );
};

export default ForgotPassword;
// client/src/pages/auth/ForgotPassword.jsx