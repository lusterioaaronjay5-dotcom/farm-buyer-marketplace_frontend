import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomeRoute from './pages/HomeRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Marketplace from './pages/Marketplace';
import FarmerProducts from './pages/FarmerProducts';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';
import Profile from './pages/Profile';
import ReceivedOrders from './pages/ReceivedOrders';
import Dashboard from './pages/Dashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import About from './pages/About';
import Service from './pages/Service';
import Inbox from './pages/Inbox';
import AdminPage from './pages/AdminPage';
import ReportPage from './pages/ReportPage';
import StockPage from './pages/StockPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
        <Route path="/farmer/products" element={<FarmerProducts />} />
        <Route path="/farmer/orders" element={<ReceivedOrders />} />
        <Route path="/farmer/stock" element={<StockPage />} />
        <Route path="/product" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/about" element={<About />} />
        <Route path="/service" element={<Service />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/reports" element={<ReportPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;