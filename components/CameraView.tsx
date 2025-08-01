
import React, { forwardRef } from 'react';

interface CameraViewProps {
  isCameraOn: boolean;
}

const CameraView = forwardRef<HTMLVideoElement, CameraViewProps>(({ isCameraOn }, ref) => {
  return (
    <div className="relative w-full aspect-video bg-gray-950 rounded-lg overflow-hidden shadow-lg border-2 border-gray-700">
      <video
        ref={ref}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300 ${isCameraOn ? 'opacity-100' : 'opacity-0'}`}
      />
      {!isCameraOn && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-400">Camera is off or not available.</p>
        </div>
      )}
    </div>
  );
});

CameraView.displayName = 'CameraView';

export default CameraView;
