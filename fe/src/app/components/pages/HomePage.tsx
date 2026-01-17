// src/app/pages/HomePage.tsx
import {Banner} from '../Banner.tsx';
import {ProductCard} from '../ProductCard.tsx';
import {ServiceCard} from '../ServiceCard.tsx';
import {Wrench, Shield, Cpu, Phone} from 'lucide-react';
import { Mail } from 'lucide-react'; // Thêm icon Mail
import { Input } from '../ui/input'; // Component Input của Shadcn
import { Button } from '../ui/button'; // Component Button của Shadcn

export default function HomePage() {
    // Mock Data cho Products
    const products = [
        {
            image: 'https://images.unsplash.com/photo-1640955014216-75201056c829?auto=format&fit=crop&q=80&w=500',
            name: 'Laptop Gaming MSI Katana 15 - Intel Core i7 Gen 13',
            price: '25.990.000đ',
            oldPrice: '32.990.000đ',
            rating: 4.8,
            discount: '21%',
            inStock: true
        },
        {
            image: 'https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&q=80&w=500',
            name: 'PC Gaming TechStore Dragon - RTX 4060 Ti',
            price: '18.590.000đ',
            oldPrice: '22.000.000đ',
            rating: 5.0,
            discount: '15%',
            inStock: true
        },
        {
            image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&q=80&w=500',
            name: 'Màn hình ASUS TUF Gaming 27" IPS 165Hz',
            price: '4.290.000đ',
            oldPrice: '5.500.000đ',
            rating: 4.7,
            discount: '22%',
            inStock: true
        },
        {
            image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=500',
            name: 'Bàn phím cơ Keychron K2 Pro - Hot Swap',
            price: '2.190.000đ',
            oldPrice: '2.500.000đ',
            rating: 4.9,
            discount: '12%',
            inStock: false
        }
    ];

    const services = [
        {icon: Wrench, title: 'Xây dựng cấu hình', desc: 'Tư vấn build PC tối ưu chi phí', color: '#0066b3'},
        {icon: Shield, title: 'Bảo hành vàng', desc: 'Lỗi 1 đổi 1 trong 30 ngày', color: '#f37021'},
        {icon: Cpu, title: 'Vệ sinh miễn phí', desc: 'Trọn đời cho PC mua tại shop', color: '#27ae60'},
        {icon: Phone, title: 'Hỗ trợ 24/7', desc: 'Hotline kỹ thuật mọi lúc', color: '#e74c3c'},
    ];

    return (
        <>
            <div className="container mx-auto px-4 py-12 space-y-16">
                {/* Hero Banner */}
                <Banner
                    image="https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBwYyUyMHNldHVwfGVufDF8fHx8MTc2Nzk2MjkzMXww&ixlib=rb-4.1.0&q=80&w=1080"
                    title="Laptop & PC Gaming Cao Cấp"
                    subtitle="Giảm giá lên đến 30% cho tất cả sản phẩm gaming. Trả góp 0%, giao hàng miễn phí toàn quốc."
                    buttonText="Khám phá ngay"
                    buttonColor="#f37021"
                />

                {/* Features */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-[#f37021]/10 rounded-full flex items-center justify-center mb-2">
                            <Shield size={24} className="text-[#f37021]" />
                        </div>
                        <h4 className="text-sm mb-1">Bảo hành chính hãng</h4>
                        <p className="text-xs text-gray-600">Lên đến 36 tháng</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-[#0db14b]/10 rounded-full flex items-center justify-center mb-2">
                            <svg className="w-6 h-6 text-[#0db14b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h4 className="text-sm mb-1">Chính hãng 100%</h4>
                        <p className="text-xs text-gray-600">Cam kết chất lượng</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-[#0066b3]/10 rounded-full flex items-center justify-center mb-2">
                            <svg className="w-6 h-6 text-[#0066b3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h4 className="text-sm mb-1">Trả góp 0%</h4>
                        <p className="text-xs text-gray-600">Duyệt nhanh 15 phút</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-[#f37021]/10 rounded-full flex items-center justify-center mb-2">
                            <svg className="w-6 h-6 text-[#f37021]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h4 className="text-sm mb-1">Giao hàng nhanh</h4>
                        <p className="text-xs text-gray-600">Miễn phí toàn quốc</p>
                    </div>
                </div>

                {/* Products Section */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 uppercase border-l-4 border-[#f37021] pl-4">
                            Sản phẩm nổi bật
                        </h2>
                        <a href="#" className="text-[#0066b3] hover:underline font-medium">Xem tất cả &rarr;</a>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product, index) => (
                            <ProductCard key={index} {...product} />
                        ))}
                    </div>
                </section>

                {/* Services Section*/}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[#0066b3]">Dịch Vụ Của Chúng Tôi</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {services.map((service, index) => (
                            <ServiceCard
                                key={index}
                                icon={service.icon}
                                title={service.title}
                                description={service.desc}
                                color={service.color}
                            />
                        ))}
                    </div>
                </section>

                {/* Promotional Banner*/}
                {/* Promotional Banner - Thiết kế mới hiện đại hơn */}
                <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0066b3] to-[#005091] px-6 py-12 shadow-xl md:px-12">
                    {/* Hiệu ứng trang trí nền (Background Effects) */}
                    <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                    <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-[#f37021]/30 blur-3xl"></div>

                    <div className="relative z-10 flex flex-col items-center justify-between gap-8 md:flex-row">

                        {/* Phần nội dung text */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="mb-2 flex items-center justify-center gap-3 md:justify-start">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                                    <Mail className="h-5 w-5 text-yellow-300" />
                                </div>
                                <h2 className="text-2xl font-bold text-white md:text-3xl">Đăng Ký Nhận Ưu Đãi</h2>
                            </div>
                            <p className="max-w-lg text-blue-100">
                                Nhận ngay <span className="font-bold text-yellow-300">voucher giảm 10%</span> cho đơn hàng đầu tiên và cập nhật các deal hời nhất mỗi tuần!
                            </p>
                        </div>

                        {/* Phần Form nhập liệu */}
                        <div className="w-full max-w-md">
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Input
                                    type="email"
                                    placeholder="Nhập địa chỉ email của bạn..."
                                    className="h-12 border-0 bg-white/95 text-gray-800 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-yellow-400"
                                />
                                <Button
                                    className="h-12 bg-[#f37021] px-8 font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-[#d45f1a]"
                                >
                                    Đăng Ký
                                </Button>
                            </div>
                            <p className="mt-3 text-center text-xs text-blue-200/80 md:text-left">
                                *Chúng tôi cam kết bảo mật thông tin của bạn.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}