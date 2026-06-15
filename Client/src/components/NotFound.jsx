import { ArrowLeft, Cloud } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="text-center max-w-md">
        <div
          className="mx-auto mb-7 w-16 h-16 rounded-2xl flex items-center justify-center text-white"
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
          }}
        >
          <Cloud className="w-7 h-7" />
        </div>
        <p className="eyebrow mb-3">404 · Page not found</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
          We couldn't find what you were looking for.
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          The page might have been moved, renamed, or never existed. Let's get
          you back to your workspace.
        </p>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center px-4 py-2.5 rounded-xl premium-button-primary text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
