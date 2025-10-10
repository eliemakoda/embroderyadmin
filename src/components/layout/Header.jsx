import { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  LogOut,
  User,
  Settings,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
const REACT_APP_API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

export default function Header({ onMenuClick }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { admin, logout, fullName, userRole, userEmail, avatar } = useAuth();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <header className="bg-surface-50 border-b border-surface-300 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Mobile menu button and search */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-surface-200 transition-colors"
          >
            <Menu className="w-5 h-5 text-surface-600" />
          </button>

          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-surface-400" />
            </div>
            <input
              type="text"
              placeholder="Search tutorials, products..."
              className="w-64 pl-10 pr-4 py-2 bg-surface-100 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Right side - Notifications and profile */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-surface-200 transition-colors">
            <Bell className="w-5 h-5 text-surface-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full"></span>
          </button>

          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-surface-200 transition-colors"
            >
              <img
                src={`${REACT_APP_API_BASE_URL}${avatar}`}
                alt={fullName}
                crossOrigin="anonymous"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-surface-900">
                  {fullName}
                </p>
                <p className="text-xs text-surface-600">{userRole}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-surface-600" />
            </button>

            {/* Dropdown menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-surface-50 rounded-lg shadow-lg border border-surface-300 py-1 z-50 animate-slide-down">
                <div className="px-4 py-3 border-b border-surface-200">
                  <p className="text-sm font-medium text-surface-900">
                    {fullName}
                  </p>
                  <p className="text-xs text-surface-600">{userEmail}</p>
                </div>
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm text-surface-700 hover:bg-surface-100 transition-colors"
                >
                  <User className="w-4 h-4 mr-3" />
                  Profile
                </a>
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm text-surface-700 hover:bg-surface-100 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </a>
                <hr className="my-1 border-surface-200" />
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-error-600 hover:bg-error-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
