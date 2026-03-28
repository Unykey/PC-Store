import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import HomePage from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import BuildPC from './pages/BuildPC';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import MyInstallmentsPage from './pages/MyInstallmentsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import PaymentResultPage from './pages/PaymentResultPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderFailPage from './pages/OrderFailPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { AdminDashboard } from './components/AdminDashboard';
import ProfilePage from './pages/ProfilePage';

export default function App() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="flex-1 pt-[80px]">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/build-pc" element={<BuildPC />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/product/:id" element={<ProductDetailPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/orders/:id" element={<OrderDetailPage />} />
                    <Route path="/my-installments" element={<MyInstallmentsPage />} />
                    <Route path="/payment/result" element={<PaymentResultPage />} />
                    <Route path="/order-success" element={<OrderSuccessPage />} />
                    <Route path="/order-fail" element={<OrderFailPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path='/compare/:id' element={<ComparisonPage />} />
                </Routes>
            </main>

            <Footer />
        </div>
    );
}
