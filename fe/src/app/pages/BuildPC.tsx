import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
    Cpu, CreditCard, HardDrive, Monitor, PcCase, Power,
    Sparkles, Zap, PlusCircle, X, History, Bot, User, RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/button.tsx';
import { Input } from '../components/ui/input.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog.tsx';
import axiosClient from '../../api/axiosClient.ts';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Map chuẩn ID frontend với Type entity ở Backend
const componentCategories = [
    { id: 'cpu', backendType: 'Cpu', name: 'Vi xử lý (CPU)', icon: Cpu },
    { id: 'main', backendType: 'Mainboard', name: 'Bo mạch chủ (Mainboard)', icon: Zap },
    { id: 'ram', backendType: 'Ram', name: 'Bộ nhớ trong (RAM)', icon: CreditCard },
    { id: 'gpu', backendType: 'Gpu', name: 'Card màn hình (Gpu)', icon: Monitor },
    { id: 'ssd', backendType: 'Storage', name: 'Ổ cứng (SSD/HDD)', icon: HardDrive },
    { id: 'psu', backendType: 'Psu', name: 'Nguồn máy tính (PSU)', icon: Power },
    { id: 'case', backendType: 'PcCase', name: 'Vỏ máy tính (Case)', icon: PcCase },
    { id: 'cooler', backendType: 'Cooler', name: 'Tản nhiệt (Cooling)', icon: Sparkles },
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

interface Message {
    role: 'ai' | 'user';
    content: string;
}

export default function BuildPC() {
    // --- STATE CHO CHAT AI ---
    const [aiPrompt, setAiPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', content: 'Chào bạn! Mình là AI tư vấn của PC Store. Bạn cần ráp bộ máy ngân sách bao nhiêu hay đang tìm linh kiện gì?' }
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // --- STATE CHO QUẢN LÝ LINH KIỆN ĐÃ CHỌN ---
    // Lưu trữ object: { cpu: { name: '...', price: 100 }, ram: { ... } }
    const [selectedComponents, setSelectedComponents] = useState<Record<string, any>>({});
    const [totalPrice, setTotalPrice] = useState(0);

    // --- STATE CHO POPUP CHỌN LINH KIỆN (MANUAL) ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<any>(null);
    const [availableProducts, setAvailableProducts] = useState<any[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    // Hàm tính lại tổng tiền
    const recalculateTotal = (selections: Record<string, any>) => {
        const total = Object.values(selections).reduce((sum, item) => sum + (item?.price || 0), 0);
        setTotalPrice(total);
    };

    // ==========================================
    // LOGIC 1: ÁP DỤNG CẤU HÌNH TỪ AI (NÚT MA THUẬT)
    // ==========================================
    const applyBuildToForm = (componentsFromAi: any[]) => {
        const newSelections: Record<string, any> = {};

        componentsFromAi.forEach(comp => {
            const categoryMatch = componentCategories.find(c =>
                c.id.toLowerCase() === comp.type.toLowerCase() ||
                c.backendType.toLowerCase() === comp.type.toLowerCase()
            );

            if (categoryMatch) {
                newSelections[categoryMatch.id] = {
                    id: comp.id, // <--- LƯU THÊM ID VÀO STATE NÀY
                    name: comp.name,
                    price: comp.price,
                    description: comp.reason
                };
            }
        });

        setSelectedComponents(newSelections);
        recalculateTotal(newSelections);
        alert('✨ Đã điền cấu hình AI đề xuất vào danh sách!');
    };

    // ==========================================
    // LOGIC 2: CHỌN THỦ CÔNG - GỌI API THEO LOẠI
    // ==========================================
    const handleOpenSelectionModal = async (category: any) => {
        setCurrentCategory(category);
        setIsModalOpen(true);
        setIsLoadingProducts(true);
        setAvailableProducts([]); // Xóa list cũ

        try {
            const response = await axiosClient.get(`/api/components?type=${category.backendType}`);
            setAvailableProducts(response.data);
        } catch (error) {
            console.error("Lỗi lấy sản phẩm:", error);
            // Fake data
            setTimeout(() => {
                setAvailableProducts([
                    { id: 1, name: `${category.name} Cao Cấp`, price: 5500000, description: 'Hiệu năng cực đỉnh' },
                    { id: 2, name: `${category.name} Tiêu Chuẩn`, price: 2500000, description: 'Phù hợp đa số người dùng' },
                    { id: 3, name: `${category.name} Giá Rẻ`, price: 950000, description: 'Tiết kiệm chi phí' },
                ]);
                setIsLoadingProducts(false);
            }, 800);
        } finally {
            if(availableProducts.length > 0) setIsLoadingProducts(false);
        }
    };

    const handleSelectProduct = (product: any) => {
        if (!currentCategory) return;

        const newSelections = {
            ...selectedComponents,
            [currentCategory.id]: product
        };

        setSelectedComponents(newSelections);
        recalculateTotal(newSelections);
        setIsModalOpen(false);
    };

    const handleRemoveProduct = (categoryId: string) => {
        const newSelections = { ...selectedComponents };
        delete newSelections[categoryId];
        setSelectedComponents(newSelections);
        recalculateTotal(newSelections);
    };

    const clearAll = () => {
        setSelectedComponents({});
        setTotalPrice(0);
    }

    // ==========================================
    // LOGIC 3: GỌI API CHAT AI (Như cũ)
    // ==========================================
    const handleSendMessage = async () => {
        if (!aiPrompt.trim()) return;

        const userMsg = aiPrompt;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setAiPrompt('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8080/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg }),
            });

            if (!response.ok) throw new Error('Lỗi kết nối server');
            const aiResponse = await response.text();
            setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'ai', content: 'Xin lỗi, hệ thống AI đang bảo trì!' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const renderMessageContent = (msg: Message) => {
        if (msg.role === 'user') return msg.content;

        try {
            let cleanJsonString = msg.content;
            const jsonMatch = msg.content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                cleanJsonString = jsonMatch[0];
            }
            const data = JSON.parse(cleanJsonString);

            if (data.isBuildPc) {
                return (
                    <div className="space-y-4 w-full text-sm">
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <h4 className="font-bold text-[#0066b3] mb-2 flex items-center gap-2">
                                <Sparkles size={16} /> Tóm Tắt Cấu Hình
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                                <p><span className="font-semibold text-gray-600">Ngân sách:</span> {data.summary.budget}</p>
                                <p><span className="font-semibold text-gray-600">Nhu cầu:</span> {data.summary.purpose}</p>
                            </div>
                            <p className="text-gray-700">{data.summary.description}</p>
                        </div>

                        <div>
                            <h4 className="font-bold text-gray-800 border-b pb-2 mb-3">Linh Kiện Đề Xuất</h4>
                            <div className="space-y-3">
                                {data.components.map((comp: any, i: number) => (
                                    <div key={i} className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <a
                                                href={`/product/${comp.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-semibold text-[#0066b3] hover:text-[#f37021] hover:underline transition-colors block cursor-pointer"
                                                title="Nhấn để xem chi tiết"
                                            >
                                                {comp.name}
                                            </a>
                                            <p className="text-xs text-gray-500 mt-0.5">{comp.reason}</p>
                                        </div>
                                        <div className="font-bold text-[#f37021] whitespace-nowrap">
                                            {formatCurrency(comp.price)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border font-bold">
                            <span>Tổng Ước Tính:</span>
                            <span className="text-lg text-[#f37021]">{formatCurrency(data.totalCost)}</span>
                        </div>

                        <Button
                            onClick={() => applyBuildToForm(data.components)}
                            className="w-full bg-[#0066b3] hover:bg-[#005091] mt-2 shadow-md"
                        >
                            <Zap className="mr-2 h-4 w-4" /> Áp Dụng Cấu Hình Này Vào Form
                        </Button>
                    </div>
                );
            }
        } catch (e) {
            return (
                <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
            );
        }
    };

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

                        {/* 1. KHU VỰC CHAT AI */}
                        <Card className="border-[#0066b3] border-2 shadow-lg bg-gradient-to-r from-blue-50 to-white flex flex-col h-[550px]">
                            {/* ... (Phần Header UI Chat giữ nguyên y hệt như cũ) ... */}
                            <CardHeader className="pb-2 flex-shrink-0">
                                <CardTitle className="flex items-center gap-2 text-[#0066b3]">
                                    <Sparkles className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                                    Trợ lý AI Build PC
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col min-h-0">
                                <div className="flex-1 overflow-y-auto mb-4 bg-white/60 rounded-lg border border-blue-100 p-4 shadow-inner space-y-4">
                                    {messages.map((msg, index) => (
                                        <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            {msg.role === 'ai' && <div className="w-8 h-8 rounded-full bg-[#0066b3] flex items-center justify-center flex-shrink-0"><Bot size={18} className="text-white" /></div>}
                                            <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.role === 'user' ? 'bg-[#0066b3] text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'}`}>
                                                {renderMessageContent(msg)}
                                            </div>
                                            {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><User size={18} className="text-gray-600" /></div>}
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex gap-3 justify-start">
                                            <div className="w-8 h-8 rounded-full bg-[#0066b3] flex items-center justify-center"><Bot size={18} className="text-white" /></div>
                                            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm p-3 flex items-center gap-1"><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span></div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                                <div className="flex-shrink-0">
                                    <div className="flex gap-3">
                                        <Input placeholder="Ví dụ: Cần ráp PC 15 triệu chơi Valorant..." value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} disabled={isLoading} className="bg-white" />
                                        <Button onClick={handleSendMessage} disabled={isLoading || !aiPrompt.trim()} className="bg-[#f37021] hover:bg-[#d45f1a] text-white font-semibold">Gửi</Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {['PC Gaming 15 triệu', 'PC Văn phòng giá rẻ', 'Tìm case dưới 1 triệu', 'Cấu hình code React'].map((prompt, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setAiPrompt(prompt)}
                                                disabled={isLoading}
                                                className="px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-blue-50 hover:text-[#0066b3] hover:border-[#0066b3] transition-colors disabled:opacity-50"
                                            >
                                                {prompt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. DANH SÁCH LINH KIỆN ĐANG CHỌN */}
                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between border-b bg-gray-50/50 py-4">
                                <CardTitle className="text-lg font-bold uppercase text-gray-700">Cấu Hình Của Bạn</CardTitle>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Tổng chi phí</p>
                                    <p className="text-2xl font-bold text-[#f37021]">{formatCurrency(totalPrice)}</p>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {componentCategories.map((category, index) => {
                                    const selectedItem = selectedComponents[category.id]; // Kiểm tra xem đã chọn linh kiện này chưa

                                    return (
                                        <div key={category.id} className={`flex flex-col sm:flex-row items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${index !== componentCategories.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                            <div className="flex items-center gap-4 w-full sm:w-1/3">
                                                <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-[#0066b3]">
                                                    <category.icon size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-800">{category.name}</h4>
                                                </div>
                                            </div>

                                            {/* HIỂN THỊ TRẠNG THÁI: ĐÃ CHỌN HOẶC CHƯA CHỌN */}
                                            {selectedItem ? (
                                                <div className="flex-1 w-full flex items-center justify-between bg-blue-50/50 border border-blue-100 rounded-md p-3">
                                                    <div>
                                                        <a
                                                            href={`/product/${selectedItem.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-bold text-[#0066b3] line-clamp-1 hover:text-[#f37021] hover:underline transition-colors block cursor-pointer"
                                                            title="Xem chi tiết"
                                                        >
                                                            {selectedItem.name}
                                                        </a>
                                                        <p className="text-sm font-semibold text-[#f37021]">{formatCurrency(selectedItem.price)}</p>
                                                    </div>
                                                    <Button variant="ghost" size="sm" onClick={() => handleRemoveProduct(category.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                        <X size={16} />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex-1 w-full border-2 border-dashed border-gray-200 rounded-md p-3 flex items-center justify-center bg-gray-50/50 text-gray-400 text-sm h-[60px]">
                                                    Chưa chọn linh kiện
                                                </div>
                                            )}

                                            <div className="w-full sm:w-auto flex justify-end">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleOpenSelectionModal(category)}
                                                    className="border-[#0066b3] text-[#0066b3] hover:bg-[#0066b3] hover:text-white"
                                                >
                                                    {selectedItem ? <RefreshCw className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                                                    {selectedItem ? 'Đổi' : 'Chọn'}
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-3 mt-4">
                            <Button variant="outline" onClick={clearAll} className="text-gray-600 border-gray-300"><X className="mr-2 h-4 w-4" /> Xóa tất cả</Button>
                            <Button className="bg-[#f37021] hover:bg-[#d45f1a] text-white shadow-lg"><CreditCard className="mr-2 h-4 w-4" /> Thêm vào giỏ hàng</Button>
                        </div>
                    </div>

                    {/* --- CỘT PHẢI (Sidebar giữ nguyên) --- */}
                    <div className="lg:col-span-4 space-y-6 hidden lg:block">
                        <Card>
                            <CardHeader className="pb-3 border-b bg-gray-50/50">
                                <CardTitle className="flex items-center text-base font-bold text-gray-800"><History className="mr-2 h-5 w-5 text-[#0066b3]" /> Cấu Hình Đã Lưu</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <p className="text-sm text-gray-500">Chưa có cấu hình nào.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* MODAL CHỌN SẢN PHẨM (MỞ LÊN KHI BẤM 'CHỌN') */}
            {/* ========================================== */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-[#0066b3]">
                            Chọn {currentCategory?.name}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-3">
                        {isLoadingProducts ? (
                            <div className="text-center py-10 text-gray-500">Đang tải dữ liệu sản phẩm...</div>
                        ) : availableProducts.length > 0 ? (
                            availableProducts.map((product) => (
                                <div key={product.id} className="flex justify-between items-center p-4 border rounded-lg hover:border-[#0066b3] hover:shadow-md transition-all">
                                    <div>
                                        <h4 className="font-bold text-gray-800">{product.name}</h4>
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{product.description}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 ml-4">
                                        <span className="font-bold text-[#f37021]">{formatCurrency(product.price)}</span>
                                        <Button size="sm" onClick={() => handleSelectProduct(product)} className="bg-[#0066b3] hover:bg-[#005091] text-white">
                                            Chọn
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-500 italic">Không tìm thấy sản phẩm nào trong kho.</div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}