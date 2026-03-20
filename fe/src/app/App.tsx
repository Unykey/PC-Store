import { Routes, Route } from 'react-router-dom';
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
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* 1. Header luôn cố định ở trên */}
            <Header />

            {/* 2. Phần nội dung chính sẽ thay đổi tùy theo URL */}
            {/* Thêm pt-20 hoặc pt-28 tùy độ cao header để tránh nội dung bị che */}
            <main className="flex-1 pt-[80px]">
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

            {/* 3. Footer luôn cố định ở dưới */}
            <Footer />
        </div>
    );
}