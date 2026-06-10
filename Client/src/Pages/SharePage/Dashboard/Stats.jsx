import {
    ArrowRight,
    Settings2,
    Share2,
    UserCheck,
    Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Stats = ({stats}) => {
    const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Shared With Me Card */}
      <div className="group relative overflow-hidden premium-card">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-[var(--primary-soft)] rounded-xl group-hover:bg-blue-100 transition-colors duration-300">
              <Share2 size={20} className="text-blue-600" />
            </div>
            <div className="text-right">
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {stats.sharedWithMe}
              </p>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Shared With Me
            </h3>
            <p className="text-xs text-gray-600">Files others have shared</p>
          </div>
          <button
            onClick={() => navigate("/share/shared-with-me")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium rounded-xl premium-button-secondary group/btn"
          >
            View All Files
            <ArrowRight
              size={14}
              className="group-hover/btn:translate-x-1 transition-transform duration-200"
            />
          </button>
        </div>
      </div>

      {/* Shared By Me Card */}
      <div className="group relative overflow-hidden premium-card">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-400"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-[var(--secondary-soft)] rounded-xl group-hover:bg-teal-100 transition-colors duration-300">
              <Users size={20} className="text-green-600" />
            </div>
            <div className="text-right">
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {stats.sharedByMe}
              </p>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Shared By Me
            </h3>
            <p className="text-xs text-gray-600">Files you've shared</p>
          </div>
          <button
            onClick={() => navigate("/share/shared-by-me")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium rounded-xl premium-button-secondary group/btn"
          >
            Manage Files
            <Settings2
              size={14}
              className="group-hover/btn:rotate-90 transition-transform duration-200"
            />
          </button>
        </div>
      </div>

      {/* Collaborators Card */}
      <div className="group relative overflow-hidden premium-card">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-500 to-indigo-400"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-indigo-100 transition-colors duration-300">
              <UserCheck size={20} className="text-indigo-600" />
            </div>
            <div className="text-right">
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {stats.totalUsers}
              </p>
              <p className="text-xs text-gray-500 mt-1">Active users</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Collaborators
            </h3>
            <p className="text-xs text-gray-600">People you work with</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
