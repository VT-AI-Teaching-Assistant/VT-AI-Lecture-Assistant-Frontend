import React, { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, ShieldExclamationIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const DISCLAIMER_STORAGE_KEY = 'vt-ai-disclaimer-acknowledged';

type AIDisclaimerModalProps = {
  onAcknowledge: () => void;
};

const AIDisclaimerModal: React.FC<AIDisclaimerModalProps> = ({ onAcknowledge }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsAnimating(true), 50);
  }, []);

  const handleAcknowledge = () => {
    if (isChecked) {
      // Store acknowledgment in sessionStorage (clears on browser close)
      sessionStorage.setItem(DISCLAIMER_STORAGE_KEY, 'true');
      onAcknowledge();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? 'bg-opacity-60' : 'bg-opacity-0'
        }`}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`relative w-full max-w-lg transform transition-all duration-300 ${
            isAnimating 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 translate-y-4 scale-95'
          }`}
        >
          {/* Modal Content */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 px-6 py-5">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <ShieldExclamationIcon className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Important Notice</h2>
                  <p className="text-amber-100 text-sm mt-0.5">AI Response Disclaimer</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {/* Main Warning */}
              <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-4 mb-5">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-amber-800 font-semibold text-base">
                      AI Responses May Be Inaccurate
                    </h3>
                    <p className="text-amber-700 text-sm mt-1.5 leading-relaxed">
                      The AI Assistant provides answers based on course materials and trained models. 
                      However, <strong>these responses may contain errors or inaccuracies</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Critical Question Notice */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
                <div className="flex items-center mb-2">
                  <svg className="h-5 w-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="font-semibold text-red-800">For Critical Questions</span>
                </div>
                <p className="text-red-700 text-sm leading-relaxed">
                  If your question is <strong>related to grades, exams, assignments, or important course decisions</strong>, 
                  please <strong>verify the information with your instructor</strong> before taking any action.
                </p>
              </div>

              {/* Recommendations */}
              <div className="space-y-2.5 mb-5">
                <p className="text-gray-600 text-sm font-medium mb-2">We recommend:</p>
                <div className="flex items-start text-sm text-gray-600">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Cross-reference important answers with course materials</span>
                </div>
                <div className="flex items-start text-sm text-gray-600">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Contact your instructor for grade-related queries</span>
                </div>
                <div className="flex items-start text-sm text-gray-600">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Use the AI as a study aid, not as an authoritative source</span>
                </div>
              </div>

              {/* Checkbox */}
              <label className="flex items-start cursor-pointer group">
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                    className="h-4 w-4 text-vt-maroon border-gray-300 rounded focus:ring-vt-maroon 
                             cursor-pointer transition-all"
                  />
                </div>
                <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                  I understand that AI responses may be inaccurate and I will verify critical 
                  information with my instructor.
                </span>
              </label>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={handleAcknowledge}
                disabled={!isChecked}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 
                  ${isChecked 
                    ? 'bg-gradient-to-r from-vt-maroon to-red-700 hover:from-red-800 hover:to-red-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' 
                    : 'bg-gray-300 cursor-not-allowed'
                  }`}
              >
                {isChecked ? 'I Understand, Continue' : 'Please acknowledge to continue'}
              </button>
              <p className="text-center text-xs text-gray-500 mt-3">
                This notice will appear once per session for your awareness.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Utility function to check if disclaimer has been acknowledged
export const hasAcknowledgedDisclaimer = (): boolean => {
  return sessionStorage.getItem(DISCLAIMER_STORAGE_KEY) === 'true';
};

// Utility function to reset disclaimer (useful for testing)
export const resetDisclaimer = (): void => {
  sessionStorage.removeItem(DISCLAIMER_STORAGE_KEY);
};

export default AIDisclaimerModal;

