import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";

const LoginCredentialForm = ({ formData, handleChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-[var(--text-secondary)] mb-2"
        >
          Email address
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-subtle)]" />
          <input
            id="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            data-testid="login-email-input"
            className="premium-input w-full pl-10 pr-3.5 py-3 rounded-xl text-sm font-medium"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-semibold text-[var(--text-secondary)] mb-2"
        >
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-subtle)]" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
            data-testid="login-password-input"
            className="premium-input w-full pl-10 pr-11 py-3 rounded-xl text-sm font-medium"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            data-testid="login-password-toggle"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-[var(--text-subtle)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)] transition"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </>
  );
};

export default LoginCredentialForm;
