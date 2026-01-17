// src/app/components/Footer.tsx
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-[#0066b3] text-white pt-12 pb-6">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Cột 1: Giới thiệu */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">TechStore</h3>
                        <p className="text-white/80 text-sm leading-relaxed">
                            Hệ thống bán lẻ máy tính và linh kiện hàng đầu Việt Nam.
                            Cam kết hàng chính hãng, bảo hành uy tín.
                        </p>
                        <div className="flex gap-4 mt-6">
                            <a href="#" className="hover:text-[#f37021] transition-colors"><Facebook size={20} /></a>
                            <a href="#" className="hover:text-[#f37021] transition-colors"><Instagram size={20} /></a>
                            <a href="#" className="hover:text-[#f37021] transition-colors"><Youtube size={20} /></a>
                        </div>
                    </div>

                    {/* Cột 2: Quick Links */}
                    <div>
                        <h4 className="text-white mb-4">Danh Mục</h4>
                        <ul className="space-y-2 text-sm text-white/80">
                            <li><a href="#" className="hover:text-white transition-colors">Laptop</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">PC Desktop</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Linh kiện</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Dịch vụ lắp ráp</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Bảo hành</a></li>
                        </ul>
                    </div>

                    {/* Cột 2: Thông tin */}
                    <div>
                        <h4 className="text-white mb-4 font-semibold">Thông tin chung</h4>
                        <ul className="space-y-2 text-sm text-white/80">
                            <li><a href="#" className="hover:text-white transition-colors">Về chúng tôi</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Tuyển dụng</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Tin tức công nghệ</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Liên hệ hợp tác</a></li>
                        </ul>
                    </div>

                    {/* Cột 3: Chính sách */}
                    {/* Support */}
                    <div>
                        <h4 className="text-white mb-4">Hỗ Trợ</h4>
                        <ul className="space-y-2 text-sm text-white/80">
                            <li><a href="#" className="hover:text-white transition-colors">Chính sách bảo hành</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Chính sách đổi trả</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Hướng dẫn mua hàng</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Phương thức thanh toán</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Câu hỏi thường gặp</a></li>
                        </ul>
                    </div>

                    {/* Cột 4: Liên hệ */}
                    <div>
                        <h4 className="text-white mb-4 font-semibold">Liên Hệ</h4>
                        <ul className="space-y-3 text-sm text-white/80">
                            <li className="flex items-start gap-2">
                                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-[#f37021]" />
                                <span>123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone size={16} className="flex-shrink-0 text-[#f37021]" />
                                <span>1900 xxxx</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail size={16} className="flex-shrink-0 text-[#f37021]" />
                                <span>support@techstore.vn</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/20 mt-8 pt-6 text-center text-sm text-white/60">
                    <p>© 2026 TechStore. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}