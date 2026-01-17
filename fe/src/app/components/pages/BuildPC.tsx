import React, { useState } from 'react';
import {
    Cpu,
    CreditCard,
    HardDrive,
    Headphones,
    Keyboard,
    Monitor,
    Mouse,
    PcCase,
    Power,
    Save,
    Search,
    Sparkles,
    Speaker,
    Zap,
    PlusCircle,
    X,
    History,
    TrendingUp,
    CheckCircle2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

// Định dạng tiền tệ VND
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Mock dữ liệu các thành phần linh kiện cần chọn
const componentCategories = [
    { id: 'cpu', name: 'Vi xử lý (CPU)', icon: Cpu, selected: null },
    { id: 'main', name: 'Bo mạch chủ (Mainboard)', icon: Zap, selected: null },
    { id: 'ram', name: 'Bộ nhớ trong (RAM)', icon: CreditCard, selected: null },
    { id: 'vga', name: 'Card màn hình (VGA)', icon: Monitor, selected: null },
    { id: 'ssd', name: 'Ổ cứng (SSD/HDD)', icon: HardDrive, selected: null },
    { id: 'psu', name: 'Nguồn máy tính (PSU)', icon: Power, selected: null },
    { id: 'case', name: 'Vỏ máy tính (Case)', icon: PcCase, selected: null },
    { id: 'cooler', name: 'Tản nhiệt (Cooling)', icon: Sparkles, selected: null },
];

// Mock dữ liệu cấu hình phổ biến
const popularBuilds = [
    { id: 1, name: 'Cấu hình Gaming Tầm Trung 2026', price: 15500000, views: 1200 },
    { id: 2, name: 'PC Đồ Họa - Render 4K', price: 32900000, views: 850 },
    { id: 3, name: 'Văn phòng Cao cấp / Stream nhẹ', price: 9800000, views: 2300 },
];

// Mock dữ liệu đã lưu
const savedBuilds = [
    { id: 1, name: 'Máy cho em trai', date: '15/01/2026' },
    { id: 2, name: 'Upgrade RTX 5060', date: '10/01/2026' },
];

export default function BuildPC() {
    const [aiPrompt, setAiPrompt] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-[1400px] mx-auto px-4">

                {/* Header Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#0066b3] uppercase tracking-tight">
                        Xây Dựng Cấu Hình PC
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Tự chọn linh kiện hoặc để AI tư vấn cấu hình tối ưu nhất cho nhu cầu của bạn.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* --- LEFT COLUMN (Content chính) --- */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* 1. AI Assistant Section */}
                        <Card className="border-[#0066b3] border-2 shadow-lg bg-gradient-to-r from-blue-50 to-white">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-[#0066b3]">
                                    <Sparkles className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                                    Trợ lý AI Build PC
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col md:flex-row gap-3">
                                    <Input
                                        placeholder="Ví dụ: Tôi có 20 triệu, cần build PC chơi GTA VI và làm đồ họa nhẹ..."
                                        className="flex-1 bg-white"
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                    />
                                    <Button className="bg-[#f37021] hover:bg-[#d45f1a] text-white font-semibold shadow-md">
                                        <Search className="mr-2 h-4 w-4" />
                                        Hỏi AI Ngay
                                    </Button>
                                </div>
                                <div className="mt-3 flex gap-2 flex-wrap">
                                    <Badge variant="outline" className="cursor-pointer hover:bg-blue-100 bg-white text-gray-600">
                                        Gaming 15 triệu
                                    </Badge>
                                    <Badge variant="outline" className="cursor-pointer hover:bg-blue-100 bg-white text-gray-600">
                                        PC Văn phòng giá rẻ
                                    </Badge>
                                    <Badge variant="outline" className="cursor-pointer hover:bg-blue-100 bg-white text-gray-600">
                                        Workstation Video 4K
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. Component Selection List */}
                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between border-b bg-gray-50/50 py-4">
                                <CardTitle className="text-lg font-bold uppercase text-gray-700">
                                    Chọn Linh Kiện Của Bạn
                                </CardTitle>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Tổng chi phí dự kiến</p>
                                    <p className="text-2xl font-bold text-[#f37021]">{formatCurrency(totalPrice)}</p>
                                </div>
                            </CardHeader>

                            <CardContent className="p-0">
                                {componentCategories.map((category, index) => (
                                    <div
                                        key={category.id}
                                        className={`flex flex-col sm:flex-row items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                                            index !== componentCategories.length - 1 ? 'border-b border-gray-100' : ''
                                        }`}
                                    >
                                        {/* Icon & Label */}
                                        <div className="flex items-center gap-4 w-full sm:w-1/3">
                                            <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-[#0066b3]">
                                                <category.icon size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">{category.name}</h4>
                                                <span className="text-xs text-gray-400">Chưa chọn sản phẩm</span>
                                            </div>
                                        </div>

                                        {/* Selection Area (Placeholder) */}
                                        <div className="flex-1 w-full border-2 border-dashed border-gray-200 rounded-md p-3 flex items-center justify-center bg-gray-50/50 text-gray-400 text-sm min-h-[60px]">
                                            Bạn chưa chọn linh kiện này
                                        </div>

                                        {/* Action Button */}
                                        <div className="w-full sm:w-auto flex justify-end">
                                            <Button variant="outline" className="border-[#0066b3] text-[#0066b3] hover:bg-[#0066b3] hover:text-white w-full sm:w-auto">
                                                <PlusCircle className="mr-2 h-4 w-4" />
                                                Chọn
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Bottom Actions */}
                        <div className="flex justify-end gap-3 mt-4">
                            <Button variant="outline" className="text-gray-600 border-gray-300">
                                <X className="mr-2 h-4 w-4" /> Xóa tất cả
                            </Button>
                            <Button className="bg-[#0066b3] hover:bg-[#005091] text-white">
                                <Save className="mr-2 h-4 w-4" /> Lưu cấu hình
                            </Button>
                            <Button className="bg-[#f37021] hover:bg-[#d45f1a] text-white shadow-lg">
                                <CreditCard className="mr-2 h-4 w-4" /> Thêm vào giỏ hàng
                            </Button>
                        </div>
                    </div>


                    {/* --- RIGHT COLUMN (Sidebar) --- */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* 1. Saved Lists */}
                        <Card>
                            <CardHeader className="pb-3 border-b bg-gray-50/50">
                                <CardTitle className="flex items-center text-base font-bold text-gray-800">
                                    <History className="mr-2 h-5 w-5 text-[#0066b3]" />
                                    Danh Sách Đã Lưu
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <ScrollArea className="h-[150px] pr-4">
                                    {savedBuilds.length > 0 ? (
                                        <div className="space-y-3">
                                            {savedBuilds.map((build) => (
                                                <div key={build.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 cursor-pointer group">
                                                    <div>
                                                        <p className="font-medium text-sm text-gray-700 group-hover:text-[#0066b3]">{build.name}</p>
                                                        <p className="text-xs text-gray-400">{build.date}</p>
                                                    </div>
                                                    <ChevronRightIcon className="h-4 w-4 text-gray-300 group-hover:text-[#0066b3]" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic text-center py-4">Chưa có cấu hình nào được lưu.</p>
                                    )}
                                </ScrollArea>
                                <Button variant="link" className="text-[#0066b3] text-sm px-0 mt-2 h-auto">
                                    Xem tất cả
                                </Button>
                            </CardContent>
                        </Card>

                        {/* 2. Popular Rankings */}
                        <Card>
                            <CardHeader className="pb-3 border-b bg-gray-50/50">
                                <CardTitle className="flex items-center text-base font-bold text-gray-800">
                                    <TrendingUp className="mr-2 h-5 w-5 text-[#f37021]" />
                                    Cấu Hình Phổ Biến
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                {popularBuilds.map((build, index) => (
                                    <div key={build.id} className="flex gap-3 items-start border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-sm">
                                            #{index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="font-semibold text-sm text-gray-800 line-clamp-2 hover:text-[#0066b3] cursor-pointer">
                                                {build.name}
                                            </h5>
                                            <div className="flex items-center gap-2 mt-1">
                        <span className="text-[#f37021] font-bold text-sm">
                          {formatCurrency(build.price)}
                        </span>
                                            </div>
                                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                                                <CheckCircle2 className="h-3 w-3" />
                                                <span>{build.views} lượt xem</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* 3. AI Banner/Tip */}
                        <div className="bg-gradient-to-br from-[#0066b3] to-[#004e8a] rounded-xl p-6 text-white text-center">
                            <Sparkles className="h-10 w-10 mx-auto mb-3 text-yellow-300" />
                            <h3 className="font-bold text-lg mb-2">Không rành về PC?</h3>
                            <p className="text-sm text-white/80 mb-4">
                                Để AI giúp bạn kiểm tra độ tương thích và gợi ý linh kiện phù hợp nhất!
                            </p>
                            <Button className="w-full bg-white text-[#0066b3] hover:bg-gray-100 font-bold border-none">
                                Thử Tính Năng AI
                            </Button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

// Icon component nhỏ để dùng trong Saved Lists
function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    )
}