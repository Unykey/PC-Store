import {Link, useNavigate} from 'react-router-dom';
import {Search, Bell, User, ShoppingCart} from 'lucide-react';
import {MegaMenu} from './MegaMenu';

interface HeaderProps {
    onMenuToggle: () => void;
}

export function Header({onMenuToggle}: HeaderProps) {
    const navigate = useNavigate();

    const quickLinks = [
        {name: 'iPhone 17', path: '#'}, // Để tạm # do chưa có trang
        {name: 'MacBook Air M4', path: '#'},
        {name: 'Laptop', path: '#'},
        {name: 'Laptop RTX 50 series', path: '#'},
        {name: 'Màn Hình', path: '#'},
        {name: 'VGA', path: '#'},
        {name: 'Build PC', path: '/build-pc'} // <-- Quan trọng nhất dòng này
    ];

    return (
        <>
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="border-b border-gray-200">
                    <div className="max-w-[1400px] mx-auto px-4 py-3">
                        <div className="flex items-center gap-4">
                            {/* Logo */}
                            <Link to="/" className="flex items-center gap-3 flex-shrink-0">
                                <div className="grid grid-cols-2 gap-0.5 w-8 h-8">
                                    <div className="bg-[#4FC3F7] rounded-sm"></div>
                                    <div className="bg-[#4FC3F7] rounded-sm"></div>
                                    <div className="bg-[#4FC3F7] rounded-sm"></div>
                                    <div className="bg-[#4FC3F7] rounded-sm"></div>
                                </div>
                            </Link>

                            {/* Danh mục sản phẩm - Moved here */}
                            <div className="flex-shrink-0">
                                <MegaMenu/>
                            </div>

                            {/* Search Bar */}
                            <div className="flex-1 max-w-2xl">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Bạn muốn mua gì hôm nay..."
                                        className="w-full px-4 py-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-md text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4FC3F7] focus:border-transparent"
                                    />
                                    <button
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                        <Search size={20}/>
                                    </button>
                                </div>
                            </div>

                            {/* Right Actions */}
                            <div className="flex items-center gap-6 flex-shrink-0">
                                {/* User Login */}
                                <button
                                    onClick={() => navigate('/login')}
                                    className="flex items-center gap-2 text-gray-700 hover:text-[#f37021] transition-colors">
                                    <div
                                        className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
                                        <User size={18}/>
                                    </div>
                                    <div className="text-left hidden lg:block">
                                        <div className="text-xs text-gray-500">Đăng nhập</div>
                                        <div className="text-sm font-medium">Đăng ký</div>
                                    </div>
                                </button>

                                {/* Notifications */}
                                <button className="relative p-2 text-gray-700 hover:text-[#f37021] transition-colors">
                                    <Bell size={24}/>
                                </button>

                                {/* Shopping Cart */}
                                <button
                                    className="relative flex items-center gap-2 text-gray-700 hover:text-[#f37021] transition-colors">
                                    <ShoppingCart size={24}/>
                                    <div className="text-left hidden lg:block">
                                        <div className="text-xs text-gray-500">Giỏ hàng của bạn</div>
                                        <div className="text-sm font-medium">(1) sản phẩm</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Links Navigation */}
                <div className="bg-white border-b border-gray-100">
                    <div className="max-w-[1400px] mx-auto px-4">
                        <div className="flex items-center gap-6 py-2 overflow-x-auto scrollbar-hide">
                            {quickLinks.map((link, index) => (
                                <Link
                                    key={index}
                                    to={link.path} // Dùng to thay vì href
                                    className="text-sm text-gray-600 hover:text-[#f37021] whitespace-nowrap transition-colors"
                                >
                                    {link.name} {/* Sửa link thành link.name */}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}