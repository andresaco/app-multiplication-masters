import React, { useState } from 'react';
import { BUILD_INFO } from '../../buildInfo';

const BuildInfo: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="no-print relative">
      {/* Compact badge */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-xs text-gray-400 hover:text-gray-600 transition-colors py-2 px-3 rounded-full hover:bg-gray-50"
        title={BUILD_INFO.buildDate}
      >
        v{BUILD_INFO.hash.substring(0, 7)}
      </button>

      {/* Tooltip at top (above the button) */}
      {showDetails && (
        <div className="absolute bottom-full mb-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-xs text-gray-600 whitespace-nowrap z-40">
          <div className="font-semibold text-gray-700 mb-2">Información de Build</div>
          <div className="space-y-1">
            <div>
              <span className="font-semibold">Hash:</span> {BUILD_INFO.hash}
            </div>
            <div>
              <span className="font-semibold">Build ID:</span> {BUILD_INFO.buildId}
            </div>
            <div>
              <span className="font-semibold">Fecha:</span> {BUILD_INFO.buildDate}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildInfo;
