
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
      "with search params:",
      location.search
    );
    console.error("Full URL that triggered 404:", window.location.href);
    console.error("Browser navigation type:", performance.navigation?.type);
  }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <p className="text-sm text-gray-500 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mb-6 p-3 bg-gray-100 rounded text-xs text-left overflow-auto">
          <code>{window.location.href}</code>
        </div>
        <a 
          href="/" 
          className="text-blue-500 hover:text-blue-700 underline"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = "/";
          }}
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
