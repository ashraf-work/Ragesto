import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useState } from "react";

export default function CredentialsForm({ formData, handleChange }) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <>
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-semibold text-[var(--text-secondary)] mb-2"
        >
          Full name
        </label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-subtle)]" />
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Jane Doe"
            value={formData.name}
            onChange={handleChange}
            data-testid="register-name-input"
            className="premium-input w-full pl-10 pr-3.5 py-3 rounded-xl text-sm font-medium"
            required
          />
        </div>
      </div>

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
            data-testid="register-email-input"
            className="premium-input w-full pl-10 pr-3.5 py-3 rounded-xl text-sm font-medium"
            required
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
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
            data-testid="register-password-input"
            className="premium-input w-full pl-10 pr-11 py-3 rounded-xl text-sm font-medium"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-[var(--text-subtle)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)] transition"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="mt-1.5 text-[11px] text-[var(--text-subtle)]">
          Use at least 6 characters with a mix of letters &amp; numbers.
        </p>
      </div>
    </>
  );
}
