
import { X } from 'lucide-react';
import React, { useState } from 'react';

interface NotificationProps {
  message: string;
  link?: {
    text: string;
    url: string;
  };
  onClose?: () => void;
}

const Notification = ({ message, link, onClose }: NotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="w-full bg-light-green py-3 px-4 flex items-center justify-center relative">
      <p className="text-sm">
        {message}
        {link && (
          <a href={link.url} className="underline font-medium ml-1">
            {link.text}
          </a>
        )}
      </p>
      <button
        onClick={handleClose}
        className="absolute right-4 top-1/2 transform -translate-y-1/2"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Notification;
