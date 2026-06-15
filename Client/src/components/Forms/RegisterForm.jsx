import { AlertCircle, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StepProgress from "../StepProgress";
import CredentialsForm from "./CredentialsForm";
import OTPForm from "./OTPForm";
import SocialAuthButtons from "../SocialAuthButtons";
import AuthLayout from "../AuthLayout";
import { register, sendOTP } from "../../Apis/authApi";
import { API_BASE_URL } from "../../Utils/apiBaseUrl";

export default function RegistrationForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    otp: "",
  });
  const [currentStep, setCurrentStep] = useState("credentials");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const URL = API_BASE_URL;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    const { email, name, password } = formData;

    if (!email || !name || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (name.length <= 3) {
      setError("Name must be more than 3 characters.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length <= 3) {
      setError("Password is too short. Please create a longer password.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    const res = await sendOTP(formData.email, "register");
    setLoading(false);

    if (res.success) {
      setSuccess(res.message);
      setCurrentStep("otp");
    } else {
      setError(res.message);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!formData.otp) {
      setError("Please enter the OTP");
      return;
    }
    setLoading(true);
    setError("");
    const { name, email, password, otp } = formData;
    const res = await register(name, email, password, otp);
    setLoading(false);

    if (res.success) {
      navigate("/login");
    } else setError(res.message);
  };

  const handleResendOTP = async () => {
    setFormData({ ...formData, otp: "" });
    await handleSendOTP({ preventDefault: () => {} });
  };

  const handleBackToCredentials = () => {
    setCurrentStep("credentials");
    setFormData({ ...formData, otp: "" });
    setError("");
    setSuccess("");
  };

  return (
    <AuthLayout
      title={currentStep === "credentials" ? "Create your account" : "Almost there"}
      subtitle={
        currentStep === "credentials"
          ? "Start with 500MB free storage — no credit card required."
          : "Confirm your email to finish creating your account."
      }
    >
      <StepProgress currentStep={currentStep} />

      <form
        className="space-y-5"
        onSubmit={
          currentStep === "credentials" ? handleSendOTP : handleFinalSubmit
        }
        data-testid={
          currentStep === "credentials" ? "register-form" : "register-otp-form"
        }
      >
        {currentStep === "credentials" ? (
          <CredentialsForm formData={formData} handleChange={handleChange} />
        ) : (
          <OTPForm
            formData={formData}
            handleChange={handleChange}
            handleBackToCredentials={handleBackToCredentials}
            handleResendOTP={handleResendOTP}
            loading={loading}
          />
        )}

        {success && (
          <div
            className="flex items-start gap-2.5 px-4 py-3 rounded-xl border bg-[var(--success-soft)] border-[rgba(16,185,129,0.18)] text-[var(--success-strong)] text-sm font-medium"
            data-testid="register-success"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div
            className="flex items-start gap-2.5 px-4 py-3 rounded-xl border bg-[var(--danger-soft)] border-[rgba(239,68,68,0.18)] text-[var(--danger-strong)] text-sm font-medium"
            data-testid="register-error"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          data-testid="register-submit-btn"
          className={`w-full py-3 px-5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            loading
              ? "bg-[var(--surface-3)] text-[var(--text-subtle)] cursor-not-allowed"
              : "premium-button-primary"
          }`}
        >
          {loading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {currentStep === "credentials" ? "Sending..." : "Creating..."}
            </span>
          ) : (
            <span className="inline-flex items-center justify-center gap-2">
              {currentStep === "credentials"
                ? "Send verification code"
                : "Create account"}
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </button>

        {currentStep === "credentials" && (
          <SocialAuthButtons
            setError={setError}
            githubURL={`${URL}/auth/github`}
          />
        )}
      </form>

      <p className="mt-8 text-center text-sm text-[var(--text-muted)]">
        Already have an account?{" "}
        <button
          onClick={() => navigate("/login")}
          data-testid="link-to-login"
          className="font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
        >
          Sign in
        </button>
      </p>
    </AuthLayout>
  );
}
