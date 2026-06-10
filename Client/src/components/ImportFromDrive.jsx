/* global google */
import { useNavigate } from "react-router-dom";
import useDrivePicker from "react-google-drive-picker";
import { useModal } from "../Contexts/ModalContext";
import { useGlobalProgress } from "../Contexts/ProgressContext";
import { driveConnect } from "../Apis/file_Dir_Api";
import { FaGoogleDrive } from "react-icons/fa";
import { API_BASE_URL } from "../Utils/apiBaseUrl";
import { useAuth } from "../Contexts/AuthContext";

export default function ImportFromDrive({
  setActionDone,
  progressMap,
  mobileView = false,
}) {
  const navigate = useNavigate();
  const { showModal } = useModal();
  const { start, step, finish, reset, active, updateCurrent } =
    useGlobalProgress();
  const { user } = useAuth();
  const [openPicker] = useDrivePicker();

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  const appId = import.meta.env.VITE_GOOGLE_APP_ID;

  const scope = ["https://www.googleapis.com/auth/drive.file"];

  const disabled = active || Object.keys(progressMap).length > 0;

  async function handleOpen() {
    if (disabled) return;

    const token = await getAccessToken(clientId, scope);
    if (!token) {
      showModal("Error", "Unable to authenticate Google Drive", "error");
      return;
    }
    openPicker({
      clientId,
      developerKey: apiKey,
      appId,
      token,
      multiselect: true,
      viewId: "DOCS",
      supportDrives: true,
      callbackFunction: (data) => handlePicked(data, token),
    });
  }

  async function handlePicked(data, token) {
    if (!data?.docs?.length) return;

    const files = data.docs;
    const source = createDriveProgressSource({
      userId: user?._id,
      onProgress: (event) => {
        updateCurrent({
          percent: event.percent,
          currentFileName: event.fileName,
          message: event.message,
        });
      },
    });

    try {
      start(files.length, { message: "Preparing Google Drive import" });
      for (const f of files) {
        const importJobId = createImportJobId();
        source.track(importJobId);
        updateCurrent({
          percent: 0,
          currentFileName: f.name,
          message: "Starting Google Drive import",
        });
        const stopFallback = startFallbackProgress({
          fileName: f.name,
          updateCurrent,
          source,
          importJobId,
        });

        const res = await driveConnect({
          token,
          filesMetaData: files,
          fileForUploading: f,
          importJobId,
        });
        stopFallback();
        source.untrack(importJobId);

        if (!res.success) {
          reset();
          showModal("Error", res.message, "error");
          return;
        }
        updateCurrent({
          percent: 100,
          currentFileName: f.name,
          message: "Import complete",
        });
        step(1);
      }

      finish();
      navigate("/");
      setActionDone(true);
    } catch (error) {
      reset();
      console.error("Drive import failed", error);
      showModal("Error", "Drive import failed.", "error");
    } finally {
      source.close();
    }
  }

  if (mobileView) {
    return (
      <>
        <button
          onClick={handleOpen}
          disabled={disabled}
          aria-disabled={disabled}
          title={`${active ? "Importing Files" : "Import Google Files"}`}
          className={` flex flex-col items-center gap-1 flex-1 touch-manipulation active:scale-95 transition-transform
    ${active || Object.keys(progressMap).length > 0 ? "cursor-not-allowed" : ""}
  `}
        >
          <div className="p-3 rounded-full bg-purple-500 active:bg-purple-600 transition-colors">
            <FaGoogleDrive className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs font-medium text-gray-700">Drive</span>
        </button>
      </>
    );
  }

  return (
    <div>
      <button
        onClick={handleOpen}
        disabled={disabled}
        title={`${active ? "Importing Files" : "Import Google Files"}`}
        className={`group relative inline-flex items-center justify-center w-full sm:w-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm min-h-[48px] sm:min-w-[140px] lg:min-w-[160px]
    ${
      active || Object.keys(progressMap).length > 0
        ? "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed shadow-none"
        : "bg-white text-gray-700 border-2 border-gray-300 hover:border-purple-400 hover:text-purple-700 hover:bg-purple-50 hover:shadow-md focus:ring-purple-500 flex justify-center gap-2"
    }
  `}
      >
        <FaGoogleDrive className="w-5 h-5" />
        <span className="truncate">Import from Drive</span>
      </button>
    </div>
  );
}

function createImportJobId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `drive-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createDriveProgressSource({ userId, onProgress }) {
  const trackedJobs = new Set();
  const jobsWithProgress = new Set();
  let connected = false;
  let eventSource = null;

  if (userId && typeof EventSource !== "undefined") {
    const baseUrl = API_BASE_URL || window.location.origin;
    eventSource = new EventSource(
      `${baseUrl}/events?userId=${encodeURIComponent(userId)}`
    );

    eventSource.onopen = () => {
      connected = true;
    };

    eventSource.onerror = () => {
      connected = false;
    };

    eventSource.onmessage = (message) => {
      try {
        const event = JSON.parse(message.data);
        if (
          event.type === "driveImportProgress" &&
          trackedJobs.has(event.importJobId)
        ) {
          connected = true;
          if (
            event.total > 0 ||
            ["saving", "finalizing"].includes(event.phase) ||
            ["complete", "error"].includes(event.status)
          ) {
            jobsWithProgress.add(event.importJobId);
          }
          onProgress(event);
        }
      } catch (error) {
        console.error("Invalid drive import progress event", error);
      }
    };
  }

  return {
    track: (jobId) => trackedJobs.add(jobId),
    untrack: (jobId) => {
      trackedJobs.delete(jobId);
      jobsWithProgress.delete(jobId);
    },
    isConnected: () => connected,
    hasProgress: (jobId) => jobsWithProgress.has(jobId),
    close: () => eventSource?.close(),
  };
}

function startFallbackProgress({ fileName, updateCurrent, source, importJobId }) {
  let percent = 2;
  let tick = 0;
  const intervalId = setInterval(() => {
    if (source.hasProgress(importJobId)) return;
    tick += 1;
    const ceiling = tick < 8 ? 45 : tick < 18 ? 76 : 91;
    percent = Math.min(
      ceiling,
      percent + Math.max(1, Math.round((ceiling - percent) * 0.18))
    );
    updateCurrent({
      percent,
      currentFileName: fileName,
      message: "Importing from Google Drive",
      importJobId,
    });
  }, 700);

  return () => clearInterval(intervalId);
}

// ---- GOOGLE TOKEN ----
function getAccessToken(clientId, scope) {
  return new Promise((resolve) => {
    google.accounts.oauth2
      .initTokenClient({
        client_id: clientId,
        scope: scope.join(" "),
        callback: (resp) => resolve(resp.access_token),
      })
      .requestAccessToken();
  });
}
