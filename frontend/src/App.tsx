import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Inventory from './pages/Inventory';
import ComponentTest from './pages/ComponentTest';
import './App.css';

function App() {
  // You can add authentication logic here later
  const isAuthenticated = true; // Temporarily set to true for testing

  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected routes */}
        <Route
          path="/inventory"
          element={isAuthenticated ? <Inventory /> : <Navigate to="/login" replace />}
        />

        {/* Test route */}
        <Route path="/test-components" element={<ComponentTest />} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;