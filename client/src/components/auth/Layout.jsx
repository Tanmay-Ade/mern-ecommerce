import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden lg:flex items-center justify-center bg-black w-1/2 px-12">
        <div className="max-w-md space-y-6 text-center text-primary-foreground">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Welcome to SDJewellers Accessories
          </h1>
          <p className="text-lg">
            Sign in with your account or continue with Google to access our exclusive collection
          </p>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Outlet />
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <span>Protected by reCAPTCHA and subject to our </span>
            <a href="/privacy" className="underline">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
// This is client/src/components/auth/Layout.jsx
