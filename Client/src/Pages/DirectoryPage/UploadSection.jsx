import { FolderPlus, Sparkles, Upload, UploadCloud } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { uploadInBatches } from "../../Apis/uploadApi";
import ImportFromDrive from "../../components/ImportFromDrive";
import { useModal } from "../../Contexts/ModalContext";
import { useGlobalProgress } from "../../Contexts/ProgressContext";
import { useAuth } from "../../Contexts/AuthContext";
import { formatFileSize } from "../../Utils/helpers";

const MAX_CONCURRENT_UPLOADS = 5;

const UploadSection = ({ setShowCreateModal, setActionDone }) => {
  const { active } = useGlobalProgress();
  const [progressMap, setProgressMap] = useState({});
  const [dragOver, setDragOver] = useState(false);
  const { dirId } = useParams();
  const { showModal } = useModal();
  const { user } = useAuth();

  const isUploading = active || Object.keys(progressMap).length > 0;

  const handleFileUpload = async (selectedFiles) => {
    const fileList = Array.from(selectedFiles);

    for (const file of fileList) {
      if (file.size > user.maxFileSize) {
        showModal(
          "Upload Limit Exceeded",
          `"${file.name}" exceeds your plan's upload limit (${formatFileSize(
            user.maxFileSize
          )}).
Upload didn't start to avoid data loss. Upgrade to a higher plan to upload larger files effortlessly.`,
          "error"
        );
        return;
      }
    }
    const initialProgress = {};
    fileList.forEach((file) => {
      initialProgress[file.name] = 0;
    });
    setProgressMap(initialProgress);
    try {
      await uploadInBatches(
        fileList,
        MAX_CONCURRENT_UPLOADS,
        dirId,
        setProgressMap,
        showModal
      );
      setProgressMap({});
      setActionDone(true);
    } catch (error) {
      console.error("Some uploads failed", error);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <>
      {/* Upload Progress */}
      {Object.keys(progressMap).length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 mb-1">
            <UploadCloud className="w-4 h-4 text-[var(--primary)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Uploading {Object.keys(progressMap).length} file
              {Object.keys(progressMap).length !== 1 ? "s" : ""}
            </h3>
          </div>
          {Object.entries(progressMap).map(([fileName, progress]) => (
            <div key={fileName} className="premium-card p-3 sm:p-4" data-testid={`upload-progress-${fileName}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--text-primary)] truncate flex-1 mr-2">
                  {fileName}
                </span>
                <span className="text-xs font-bold text-[var(--primary)] tabular-nums">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-[var(--surface-3)] rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    background:
                      "linear-gradient(90deg, #6366f1, #06b6d4)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Desktop Upload Area */}
      <div
        className={`hidden min-[800px]:block transition-all duration-200 ${
          dragOver ? "scale-[1.005]" : ""
        }`}
        data-testid="upload-zone-desktop"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div
          className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
            dragOver
              ? "border-[var(--primary)] bg-[var(--primary-softer)]"
              : "border-dashed border-[var(--border-strong)] bg-[var(--surface)]"
          }`}
        >
          {/* Decorative bg */}
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(79,70,229,0.6) 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }}
          />

          <div className="relative grid md:grid-cols-[1fr_auto] items-center gap-6 p-6 sm:p-7">
            <div className="flex items-start gap-4">
              <div
                className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(6,182,212,0.10))",
                  border: "1px solid var(--border)",
                }}
              >
                <UploadCloud className="w-5 h-5 text-[var(--primary)]" strokeWidth={2.2} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                  {dragOver ? "Drop to upload" : "Drag files here, or use a quick action"}
                </h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Securely uploaded to AWS S3 · Up to{" "}
                  <span className="font-semibold text-[var(--text-secondary)]">
                    {user?.maxFileSize ? formatFileSize(user.maxFileSize) : "—"}
                  </span>{" "}
                  per file
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 justify-end">
              <label
                className={`relative inline-flex items-center justify-center px-4 py-2.5 text-sm rounded-xl ${
                  isUploading
                    ? "bg-[var(--surface-3)] text-[var(--text-subtle)] cursor-not-allowed"
                    : "premium-button-primary cursor-pointer"
                }`}
                data-testid="upload-files-btn"
              >
                <Upload className="w-4 h-4 mr-2" />
                <span>Upload files</span>
                <input
                  type="file"
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  disabled={isUploading}
                />
              </label>

              <button
                onClick={() => setShowCreateModal(true)}
                data-testid="create-folder-btn"
                className="inline-flex items-center px-4 py-2.5 text-sm rounded-xl premium-button-secondary"
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                New folder
              </button>

              <ImportFromDrive
                setActionDone={setActionDone}
                progressMap={progressMap}
                mobileView={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile FAB - Fixed Bottom */}
      <div className="min-[800px]:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pointer-events-none">
        <div className="pointer-events-auto premium-panel flex items-center justify-around p-2 backdrop-blur-xl bg-[rgba(255,255,255,0.92)]">
          <label
            className="flex flex-col items-center gap-1 flex-1 touch-manipulation active:scale-95 transition-transform cursor-pointer"
            data-testid="upload-files-btn-mobile"
          >
            <div
              className={`p-3 rounded-2xl transition-colors ${
                isUploading
                  ? "bg-[var(--surface-3)]"
                  : "bg-[var(--primary)] active:bg-[var(--primary-hover)]"
              }`}
            >
              <Upload className="w-5 h-5 text-white" />
            </div>
            <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
              Upload
            </span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
              disabled={isUploading}
            />
          </label>

          <button
            onClick={() => setShowCreateModal(true)}
            data-testid="create-folder-btn-mobile"
            className="flex flex-col items-center gap-1 flex-1 touch-manipulation active:scale-95 transition-transform"
          >
            <div className="p-3 rounded-2xl bg-[var(--success)] active:brightness-95 transition-colors">
              <FolderPlus className="w-5 h-5 text-white" />
            </div>
            <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
              Folder
            </span>
          </button>

          <ImportFromDrive
            setActionDone={setActionDone}
            progressMap={progressMap}
            mobileView={true}
          />
        </div>
      </div>
    </>
  );
};

export default UploadSection;
