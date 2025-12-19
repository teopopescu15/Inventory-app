import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Inventory from './pages/Inventory';
import Analysis from './pages/Analysis';
import TableView from './pages/TableView';
import ComponentTest from './pages/ComponentTest';
import './App.css';

function App() {
  // Check for JWT token in localStorage
  const isAuthenticated = !!localStorage.getItem('token');

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
        <Route
          path="/analysis"
          element={isAuthenticated ? <Analysis /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/table-view"
          element={isAuthenticated ? <TableView /> : <Navigate to="/login" replace />}
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