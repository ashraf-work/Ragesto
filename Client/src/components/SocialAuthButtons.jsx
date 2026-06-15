import { useGoogleLogin } from "@react-oauth/google";
import { BsGithub } from "react-icons/bs";
import { googleAuth } from "../Apis/authApi";
import { useAuth } from "../Contexts/AuthContext";
import { useModal } from "../Contexts/ModalContext";
import { showSessionLimitExceedModal } from "../Utils/helpers";

export default function SocialAuthButtons({ setError, githubURL }) {
  const { checkAuthentication } = useAuth();
  const { showModal, showConfirmModal, closeConfirmModal } = useModal();

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      const { code } = response;
      const res = await googleAuth(code);
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
    },
    onError: () => setError("Google login failed. Please try again."),
    ux_mode: "popup",
    flow: "auth-code",
  });

  return (
    <>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border)]" />
        </div>
        <div className="relative flex justify-center text-[11px] font-semibold uppercase tracking-[0.12em]">
          <span className="px-3 bg-[var(--bg)] text-[var(--text-subtle)]">
            or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => googleLogin()}
          data-testid="google-auth-btn"
          className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl premium-button-secondary text-sm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span>Google</span>
        </button>

        <button
          type="button"
          onClick={() => (window.location.href = githubURL)}
          data-testid="github-auth-btn"
          className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl premium-button-secondary text-sm"
        >
          <BsGithub className="w-[18px] h-[18px]" />
          <span>GitHub</span>
        </button>
      </div>

      <p className="mt-4 text-center text-[11px] text-[var(--text-subtle)] leading-relaxed">
        By continuing, you agree to our{" "}
        <button
          type="button"
          onClick={() => window.open("/terms-of-service", "_blank")}
          className="text-[var(--primary)] hover:underline font-medium"
        >
          Terms of Service
        </button>{" "}
        and{" "}
        <button
          type="button"
          onClick={() => window.open("/privacy-policy", "_blank")}
          className="text-[var(--primary)] hover:underline font-medium"
        >
          Privacy Policy
        </button>
        .
      </p>
    </>
  );
}
