import {Routes, Route} from 'react-router-dom';
import {Header} from './components/Header';
import {Footer} from './components/Footer'; // Import Footer mới
import {MegaMenu} from './components/MegaMenu'; // Nếu MegaMenu nằm riêng
import HomePage from './components/pages/HomePage'; // Import HomePage mới
import BuildPC from './components/pages/BuildPC'; // Import BuildPC đã làm trước đó

export default function App() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* 1. Header luôn cố định ở trên */}
            <Header/>

            {/* 2. Phần nội dung chính sẽ thay đổi tùy theo URL */}
            {/* Thêm pt-20 hoặc pt-28 tùy độ cao header để tránh nội dung bị che */}
            <main className="flex-1 pt-[80px]">
                <Routes>
                    <Route path="/" element={<HomePage/>}/>
                    <Route path="/build-pc" element={<BuildPC/>}/>
                </Routes>
            </main>

            {/* 3. Footer luôn cố định ở dưới */}
            <Footer/>
        </div>
    );
}