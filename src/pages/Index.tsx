
import React from 'react';
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Redirect to the playlists page
  return <Navigate to="/playlists" replace />;
};

export default Index;
