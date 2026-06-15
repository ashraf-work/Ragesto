import { AlertCircle, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, sendOTP } from "../../Apis/authApi";
import LoginCredentialForm from "./LoginCredentialForm";
import OTPForm from "./OTPForm";
import SocialAuthButtons from "../SocialAuthButtons";
import StepProgress from "../StepProgress";
import AuthLayout from "../AuthLayout";
import { useAuth } from "../../Contexts/AuthContext";
import { showSessionLimitExceedModal } from "../../Utils/helpers";
import { useModal } from "../../Contexts/ModalContext";
import { API_BASE_URL } from "../../Utils/apiBaseUrl";

export default function LoginForm() {
  const navigate = useNavigate();
  const { checkAuthentication } = useAuth();
  const { showModal, showConfirmModal, closeConfirmModal } = useModal();

  const [formData, setFormData] = useState({
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
    const { email, password } = formData;

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      const res = await sendOTP(email, "login", password);

      if (res.success) {
        setSuccess("Verification code sent to your email!");
        setCurrentStep("otp");
      } else {
        const message = res?.details
          ? res.details.map((d) => d.message).join(",\n")
          : res.message || "Something went wrong. Please try again.";
        setError(message);
      }
    } catch (err) {
      console.error("OTP send error:", err);
      setError("Something went wrong while sending OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = async (e) => {
    e.preventDefault();
    if (!formData.otp) {
      setError("Please enter the verification code");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    const { email, password, otp } = formData;
    const res = await login(email, password, otp);
    if (res.success) {
      await checkAuthentication();
    } else {
      if (res?.details?.sessionLimitExceed) {
        showSessionLimitExceedModal({
          showModal,
          showConfirmModal,
          closeConfirmModal,
          checkAuthentication,
          token: res?.details?.temp_token,
        });
      }
      setError(res.message);
    }
    setLoading(false);
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
      title={currentStep === "credentials" ? "Welcome back" : "Verify it's you"}
      subtitle={
        currentStep === "credentials"
          ? "Sign in to access your secure workspace."
          : "Enter the 4-digit code we sent to your inbox."
      }
    >
      <StepProgress currentStep={currentStep} />

      <form
        className="space-y-5"
        onSubmit={
          currentStep === "credentials" ? handleSendOTP : handleOTPVerification
        }
        data-testid={
          currentStep === "credentials" ? "login-form" : "otp-form"
        }
      >
        {currentStep === "credentials" && (
          <LoginCredentialForm
            handleChange={handleChange}
            formData={formData}
          />
        )}

        {currentStep === "otp" && (
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
            data-testid="auth-success"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div
            className="flex items-start gap-2.5 px-4 py-3 rounded-xl border bg-[var(--danger-soft)] border-[rgba(239,68,68,0.18)] text-[var(--danger-strong)] text-sm font-medium"
            data-testid="auth-error"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          data-testid="login-submit-btn"
          className={`w-full py-3 px-5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            loading
              ? "bg-[var(--surface-3)] text-[var(--text-subtle)] cursor-not-allowed"
              : "premium-button-primary"
          }`}
        >
          {loading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {currentStep === "credentials" ? "Verifying..." : "Confirming..."}
            </span>
          ) : (
            <span className="inline-flex items-center justify-center gap-2">
              {currentStep === "credentials" ? "Continue" : "Verify & Sign in"}
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
        Don&apos;t have an account?{" "}
        <button
          onClick={() => navigate("/register")}
          data-testid="link-to-register"
          className="font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
        >
          Create one
        </button>
      </p>
    </AuthLayout>
  );
}
