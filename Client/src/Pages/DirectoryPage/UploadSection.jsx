import { FolderPlus, Upload } from "lucide-react";
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

  const handleFileUpload = async (selectedFiles) => {
    const fileList = Array.from(selectedFiles);

    // checking the file size before initiating uploads.
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
    const droppedFiles = e.dataTransfer.files;
    handleFileUpload(droppedFiles);
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
        <div className="mb-6 sm:mb-8 space-y-3">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
            Upload Progress
          </h3>
          {Object.entries(progressMap).map(([fileName, progress]) => (
            <div
              key={fileName}
              className="premium-card p-3 sm:p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-medium text-gray-800 truncate flex-1 mr-2">
                  {fileName}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-blue-600 flex-shrink-0">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-[var(--primary-soft)] rounded-full h-2 sm:h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 sm:h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Desktop Upload Area - Hidden on mobile */}
      <div
        className={`hidden min-[800px]:block max-w-7xl mx-auto mb-5 border border-dashed rounded-[24px] p-8 text-center transition-all duration-200 ${
          dragOver ? "border-blue-400 bg-blue-50 shadow-lg" : "border-[var(--border-strong)] bg-[rgba(253,254,255,0.72)]"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-blue)]">
          <Upload className="w-7 h-7 text-[var(--primary)]" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Build your cloud workspace
        </h2>
        <p className="text-gray-600 mb-4">
          Drop files here, import from Drive, or create a clean folder structure.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center w-full sm:max-w-2xl mx-auto">
          {/* Upload Files Button */}
          <label
            className={`relative inline-flex items-center justify-center w-full sm:w-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg min-h-[48px] sm:min-w-[140px] lg:min-w-[160px] touch-manipulation
              ${
                active || Object.keys(progressMap).length > 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                  : "premium-button-primary cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
              }
            `}
          >
            <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 transition-transform group-hover:scale-110 flex-shrink-0" />
            <span className="truncate">Upload Files</span>

            {/* Hidden file input */}
            <input
              type="file"
              multiple
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => handleFileUpload(e.target.files)}
              disabled={active || Object.keys(progressMap).length > 0}
            />

            {/* Hover overlay effect */}
            {!active ||
              (!(Object.keys(progressMap).length > 0) && (
                <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
              ))}
          </label>

          {/* Create Directory Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="group relative inline-flex items-center justify-center w-full sm:w-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-sm font-semibold rounded-xl premium-button-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[48px] sm:min-w-[140px] lg:min-w-[160px] touch-manipulation"
          >
            <FolderPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 transition-transform group-hover:scale-110 flex-shrink-0" />
            <span className="truncate">Create Directory</span>
            <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
          </button>

          {/* Import Drive Button */}
          <ImportFromDrive
            setActionDone={setActionDone}
            progressMap={progressMap}
            mobileView={false}
          />
        </div>
      </div>

      {/* Mobile FAB - Fixed Bottom Action Bar */}
      <div className="min-[800px]:hidden fixed bottom-0 left-0 right-0 bg-[rgba(253,254,255,0.92)] backdrop-blur-xl border-t border-[var(--border)] shadow-lg z-50">
        <div className="flex items-center justify-between p-3 max-w-lg mx-auto">
          {/* Upload Files */}
          <label className="flex flex-col items-center gap-1 flex-1 touch-manipulation active:scale-95 transition-transform cursor-pointer">
            <div
              className={`p-3 rounded-full transition-colors ${
                active || Object.keys(progressMap).length > 0
                  ? "bg-gray-300"
                  : "bg-blue-500 active:bg-blue-600"
              }`}
            >
              <Upload className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-700">Upload</span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
              disabled={active || Object.keys(progressMap).length > 0}
            />
          </label>

          {/* Create Directory */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex flex-col items-center gap-1 flex-1 touch-manipulation active:scale-95 transition-transform"
          >
            <div className="p-3 rounded-full bg-green-500 active:bg-green-600 transition-colors">
              <FolderPlus className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-700">
              New Folder
            </span>
          </button>

          {/* Import Drive */}
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
