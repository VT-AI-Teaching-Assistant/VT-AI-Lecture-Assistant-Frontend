import React, { useState, useEffect, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCourse } from '../context/CourseContext';
import AIDisclaimerModal, { hasAcknowledgedDisclaimer } from './AIDisclaimerModal';
import {
  HomeIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  ChartBarIcon,
  QuestionMarkCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

type LayoutProps = {
  children?: ReactNode;
};

type NavigationItem = {
  name: string;
  href: string;
  icon: React.ElementType;
};

const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isCourseContextSet, selectedCourse } = useCourse();

  // Check if disclaimer needs to be shown on mount
  useEffect(() => {
    if (user && !hasAcknowledgedDisclaimer()) {
      setShowDisclaimer(true);
    }
  }, [user]);

  const handleDisclaimerAcknowledge = () => {
    setShowDisclaimer(false);
  };

  const baseNavigation: NavigationItem[] = [
    { name: 'Profile', href: '/profile', icon: UserIcon },
    { name: 'Home', href: '/home', icon: HomeIcon },
    { name: 'Chat with AI', href: '/chat', icon: ChatBubbleLeftRightIcon },
    { name: 'Lectures', href: '/lectures', icon: AcademicCapIcon },
    { name: 'FAQ', href: '/faq', icon: QuestionMarkCircleIcon },
  ];

  const navigation: NavigationItem[] =
    user?.role === 'instructor'
      ? [
         ...baseNavigation.slice(0, 1), // Profile
         { name: 'Knowledge Base', href: '/knowledge-base', icon: DocumentIcon },
         ...baseNavigation.slice(1), // Home and rest
         { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
         { name: 'Disputes', href: '/disputes', icon: ExclamationTriangleIcon },
         { name: 'Upload Transcript', href: '/instructor/upload', icon: AcademicCapIcon },
         { name: 'Settings', href: '/settings', icon: Cog6ToothIcon }
        ]
      : [...baseNavigation,
         { name: 'History', href: '/history', icon: ClockIcon }];

  const isActive = (path: string): boolean => {
    if (path === '/home' && location.pathname === '/home') return true;
    if (path !== '/home' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-vt-maroon rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">VT</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">AI Assistant</h1>
                <p className="text-sm text-vt-gray">Virginia Tech</p>
              </div>
            </div>
            <button
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
              onClick={() => setIsSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isDisabled = item.href !== '/profile' && !isCourseContextSet;
              const isActiveItem = isActive(item.href);
              
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    if (!isDisabled) {
                      navigate(item.href);
                      setIsSidebarOpen(false);
                    }
                  }}
                  disabled={isDisabled}
                  className={`sidebar-item w-full ${
                    isActiveItem ? 'active' : ''
                  } ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title={isDisabled ? 'Please set course context first' : ''}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                  {isDisabled && (
                    <span className="ml-auto text-xs text-gray-400">🔒</span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 space-y-2">
            <button
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Sign out
            </button>
            <div className="text-center text-xs text-vt-gray">
              <p>Virginia Tech</p>
              <p className="text-vt-maroon font-medium">2025</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 lg:ml-64">
        <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm lg:hidden">
          <button
            type="button"
            className="text-gray-700"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-vt-maroon rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">VT</span>
            </div>
            <span className="font-semibold text-gray-900">AI Assistant</span>
            {isCourseContextSet && selectedCourse && (
              <div className="ml-4 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {selectedCourse.code}
              </div>
            )}
          </div>
        </div>

        <main className="py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
          {children}
        </main>
      </div>

      {/* AI Disclaimer Modal - shows once per session after login */}
      {showDisclaimer && (
        <AIDisclaimerModal onAcknowledge={handleDisclaimerAcknowledge} />
      )}
    </div>
  );
};

export default Layout;
