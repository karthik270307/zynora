import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/login" element={<div>Login</div>} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
