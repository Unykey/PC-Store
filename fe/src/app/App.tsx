import { Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer'; // Import Footer mới
import HomePage from './pages/HomePage'; // Import HomePage mới
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import BuildPC from './pages/BuildPC'; // Import BuildPC đã làm trước đó
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import MyInstallmentsPage from './pages/MyInstallmentsPage';
import { AdminDashboard } from './components/AdminDashboard'; // added admin import
import { ComparisonPage } from './pages/ComparisonPage';

export default function App() {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Header: hide on admin routes */}
            {!isAdminRoute && <Header />}

            {/* Main content; remove top padding when header hidden */}
            <main className={`flex-1 ${isAdminRoute ? '' : 'pt-[80px]'}`}>
                <Routes>
                    <Route path="/" element={<HomePage/>}/>
                    <Route path="/login" element={<LoginPage/>} />
                    <Route path="/register" element={<RegisterPage/>} />
                    <Route path="/build-pc" element={<BuildPC/>}/>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/build-pc" element={<BuildPC />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/orders/:id" element={<OrderDetailPage />} />
                    <Route path="/my-installments" element={<MyInstallmentsPage />} />

                    {/* Admin route - no auth for now */}
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/comparison" element={<ComparisonPage />} />
                </Routes>
            </main>

            {/* Footer always shown */}
            <Footer />
        </div>
    );
}