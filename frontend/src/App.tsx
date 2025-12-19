import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Inventory from './pages/Inventory';
import Analysis from './pages/Analysis';
import TableView from './pages/TableView';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import ComponentTest from './pages/ComponentTest';
import { CartProvider } from './contexts/CartContext';
import './App.css';

function App() {
  // Check for JWT token in localStorage
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <CartProvider>
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
          <Route
            path="/checkout"
            element={isAuthenticated ? <Checkout /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/orders"
            element={isAuthenticated ? <Orders /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/orders/:id"
            element={isAuthenticated ? <OrderDetail /> : <Navigate to="/login" replace />}
          />

          {/* Test route */}
          <Route path="/test-components" element={<ComponentTest />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;