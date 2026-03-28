import React, { useEffect, useState } from 'react';
import {
    Cpu, CreditCard, HardDrive, Monitor, PcCase, Power,
    Sparkles, Zap, PlusCircle, X, History, RefreshCw, Search, Filter
} from 'lucide-react';
import { Button } from '../components/ui/button.tsx';
import { Input } from '../components/ui/input.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog.tsx';
import axiosClient from '../../api/axiosClient.ts';

import AiChatAssistant from '../components/AiChatAssistant.tsx';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const componentCategories = [
    { id: 'cpu', backendType: 'Cpu', name: 'Vi xử lý (CPU)', icon: Cpu, allowMultiple: false },
    { id: 'main', backendType: 'Mainboard', name: 'Bo mạch chủ (Mainboard)', icon: Zap, allowMultiple: false },
    { id: 'ram', backendType: 'Ram', name: 'Bộ nhớ trong (RAM)', icon: CreditCard, allowMultiple: true },
    { id: 'vga', backendType: 'Gpu', name: 'Card màn hình (VGA)', icon: Monitor, allowMultiple: false },
    { id: 'ssd', backendType: 'Storage', subType: 'SSD', name: 'Ổ cứng (SSD)', icon: HardDrive, allowMultiple: true },
    { id: 'hdd', backendType: 'Storage', subType: 'HDD', name: 'Ổ cứng (HDD)', icon: HardDrive, allowMultiple: true },
    { id: 'psu', backendType: 'Psu', name: 'Nguồn máy tính (PSU)', icon: Power, allowMultiple: false },
    { id: 'case', backendType: 'PcCase', name: 'Vỏ máy tính (Case)', icon: PcCase, allowMultiple: false },
    { id: 'cooler', backendType: 'Cooler', name: 'Tản nhiệt (Cooling)', icon: Sparkles, allowMultiple: true },
];

const FILTER_CONFIG: Record<string, { key: string; label: string; options: string[] }[]> = {
    cpu: [
        { key: 'brand', label: 'Thương hiệu', options: ['Intel', 'AMD'] },
        { key: 'socket', label: 'Socket', options: ['LGA1700', 'LGA1200', 'AM4', 'AM5'] },
        { key: 'coreCount', label: 'Số nhân', options: ['4', '6', '8', '12', '16', '24'] }
    ],
    main: [
        { key: 'brand', label: 'Thương hiệu', options: ['ASUS', 'GIGABYTE', 'MSI', 'ASRock'] },
        { key: 'chipset', label: 'Chipset', options: ['H610', 'B760', 'Z790', 'B550', 'B650', 'X670'] },
        { key: 'formFactor', label: 'Kích thước', options: ['ATX', 'Micro-ATX', 'Mini-ITX'] }
    ],
    ram: [
        { key: 'brand', label: 'Thương hiệu', options: ['Corsair', 'Kingston', 'G.Skill', 'TeamGroup'] },
        { key: 'ramType', label: 'Chuẩn RAM', options: ['DDR4', 'DDR5'] },
        { key: 'capacity', label: 'Dung lượng', options: ['8GB', '16GB', '32GB', '64GB'] },
        { key: 'speed', label: 'Tốc độ (Bus)', options: ['3200MHz', '3600MHz', '5200MHz', '6000MHz'] }
    ],
    vga: [
        { key: 'brand', label: 'Thương hiệu', options: ['ASUS', 'GIGABYTE', 'MSI', 'Zotac'] },
        { key: 'vramCapacity', label: 'Dung lượng VRAM', options: ['4GB', '8GB', '12GB', '16GB', '24GB'] }
    ],
    ssd: [
        { key: 'brand', label: 'Thương hiệu', options: ['Samsung', 'WD', 'Kingston', 'Crucial'] },
        { key: 'capacity', label: 'Dung lượng', options: ['256GB', '512GB', '1TB', '2TB'] }
    ],
    hdd: [
        { key: 'brand', label: 'Thương hiệu', options: ['WD', 'Seagate', 'Toshiba'] },
        { key: 'capacity', label: 'Dung lượng', options: ['1TB', '2TB', '4TB'] }
    ],
    psu: [
        { key: 'brand', label: 'Thương hiệu', options: ['Corsair', 'Cooler Master', 'Deepcool', 'MSI'] },
        { key: 'wattage', label: 'Công suất', options: ['450', '550', '650', '750', '850', '1000'] }
    ],
    case: [
        { key: 'brand', label: 'Thương hiệu', options: ['NZXT', 'Corsair', 'Xigmatek', 'Deepcool'] }
    ],
    cooler: [
        { key: 'brand', label: 'Thương hiệu', options: ['Noctua', 'Deepcool', 'Thermalright', 'Corsair'] }
    ]
};

export default function BuildPC() {
    const [selectedComponents, setSelectedComponents] = useState<Record<string, any[]>>({});
    const [totalPrice, setTotalPrice] = useState(0);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<any>(null);
    const [availableProducts, setAvailableProducts] = useState<any[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('Khuyến mãi tốt nhất');

    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
    const [preloadedCache, setPreloadedCache] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (!isModalOpen || !currentCategory) return;

        const delayDebounceFn = setTimeout(() => {
            fetchProductsForModal(currentCategory, 0, searchTerm, activeFilters);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, JSON.stringify(activeFilters)]);

    useEffect(() => {
        const preloadData = async () => {
            const cache: Record<string, any> = {};
            await Promise.all(componentCategories.map(async (cat) => {
                try {
                    const url = `/api/components?type=${cat.backendType}${cat.subType ? `&subType=${cat.subType}` : ''}&page=0&size=16`;
                    const res = await axiosClient.get(url);
                    cache[cat.id] = res.data;
                } catch (error) {
                    console.error(`Lỗi tải trước ${cat.name}`, error);
                }
            }));
            setPreloadedCache(cache);
        };
        preloadData();
    }, []);

    const recalculateTotal = (selections: Record<string, any[]>) => {
        let total = 0;
        Object.values(selections).forEach(productArray => {
            productArray.forEach(item => total += (item?.price || 0));
        });
        setTotalPrice(total);
    };

    const applyBuildToForm = (componentsFromAi: any[]) => {
        const newSelections: Record<string, any[]> = {};
        componentsFromAi.forEach(comp => {
            const categoryMatch = componentCategories.find(c =>
                c.id.toLowerCase() === comp.type.toLowerCase() ||
                c.backendType.toLowerCase() === comp.type.toLowerCase()
            );

            if (categoryMatch) {
                if (!newSelections[categoryMatch.id]) newSelections[categoryMatch.id] = [];
                newSelections[categoryMatch.id].push({
                    id: comp.id, name: comp.name, price: comp.price, description: comp.reason
                });
            }
        });
        setSelectedComponents(newSelections);
        recalculateTotal(newSelections);
        alert('✨ Đã điền cấu hình AI đề xuất vào danh sách!');
    };

    const handleOpenSelectionModal = async (category: any) => {
        setCurrentCategory(category);
        setIsModalOpen(true);
        setCurrentPage(0);

        setSearchTerm('');
        setActiveFilters({});

        if (preloadedCache[category.id]) {
            setAvailableProducts(preloadedCache[category.id].content);
            setTotalPages(preloadedCache[category.id].totalPages);
            setIsLoadingProducts(false);
            return;
        }
        fetchProductsForModal(category, 0);
    };

    const fetchProductsForModal = async (
        category: any,
        pageIndex: number,
        keyword: string = searchTerm,
        filters: Record<string, string> = activeFilters
    ) => {
        setIsLoadingProducts(true);
        try {
            let url = `/api/components?type=${category.backendType}&page=${pageIndex}&size=16`;
            if (category.subType) url += `&subType=${category.subType}`;
            if (keyword) url += `&keyword=${keyword}`;

            Object.entries(filters).forEach(([key, value]) => {
                if (value) url += `&${key}=${value}`;
            });

            const response = await axiosClient.get(url);
            setAvailableProducts(response.data.content || []);
            setTotalPages(response.data.totalPages || 1);
            setCurrentPage(pageIndex);
        } catch (error) {
            console.error("Lỗi lấy sản phẩm:", error);
        } finally {
            setIsLoadingProducts(false);
        }
    };

    const handleSelectProduct = (product: any) => {
        if (!currentCategory) return;
        const catId = currentCategory.id;
        const currentList = selectedComponents[catId] || [];

        let newList = currentCategory.allowMultiple ? [...currentList, product] : [product];

        const newSelections = { ...selectedComponents, [catId]: newList };
        setSelectedComponents(newSelections);
        recalculateTotal(newSelections);
        setIsModalOpen(false);
    };

    const handleRemoveProduct = (categoryId: string, indexToRemove: number) => {
        const currentList = selectedComponents[categoryId] || [];
        const newList = currentList.filter((_, idx) => idx !== indexToRemove);
        const newSelections = { ...selectedComponents };

        if (newList.length === 0) delete newSelections[categoryId];
        else newSelections[categoryId] = newList;

        setSelectedComponents(newSelections);
        recalculateTotal(newSelections);
    };

    const clearAll = () => {
        setSelectedComponents({});
        setTotalPrice(0);
    };

    const toggleFilter = (filterKey: string, optionValue: string) => {
        setActiveFilters(prev => {
            const newFilters = { ...prev };
            if (newFilters[filterKey] === optionValue) {
                delete newFilters[filterKey];
            } else {
                newFilters[filterKey] = optionValue;
            }
            return newFilters;
        });
    };

    const processedProducts = [...availableProducts].sort((a, b) => {
        if (sortBy === 'Giá tăng dần') return a.price - b.price;
        if (sortBy === 'Giá giảm dần') return b.price - a.price;
        if (sortBy === 'Khuyến mãi tốt nhất') {
            const discountA = a.oldPrice ? a.oldPrice - a.price : 0;
            const discountB = b.oldPrice ? b.oldPrice - b.price : 0;
            return discountB - discountA;
        }
        return 0;
    });

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-[1400px] mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#0066b3] uppercase tracking-tight">Xây Dựng Cấu Hình PC</h1>
                    <p className="text-gray-500 mt-2">Tự chọn linh kiện hoặc để AI tư vấn cấu hình tối ưu nhất cho nhu cầu của bạn.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-6">

                        <AiChatAssistant onApplyBuild={applyBuildToForm} />

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
                                    const selectedItems = selectedComponents[category.id] || [];

                                    return (
                                        <div key={category.id} className={`flex flex-col p-4 hover:bg-gray-50 transition-colors ${index !== componentCategories.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#0066b3]">
                                                        <category.icon size={20} />
                                                    </div>
                                                    <h4 className="font-semibold text-gray-800">{category.name}</h4>
                                                </div>

                                                {(selectedItems.length === 0 || category.allowMultiple) && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleOpenSelectionModal(category)}
                                                        className="border-[#0066b3] text-[#0066b3] hover:bg-[#0066b3] hover:text-white"
                                                    >
                                                        <PlusCircle className="mr-1 h-4 w-4" />
                                                        {selectedItems.length > 0 ? 'Thêm cái nữa' : 'Chọn linh kiện'}
                                                    </Button>
                                                )}
                                            </div>

                                            {selectedItems.length > 0 ? (
                                                <div className="space-y-2 ml-14">
                                                    {selectedItems.map((item, idx) => (
                                                        <div key={idx} className="flex items-center justify-between bg-white border border-gray-200 rounded-md p-3 shadow-sm">
                                                            <div>
                                                                <a href={`/product/${item.id}`} target="_blank" rel="noopener noreferrer" className="font-bold text-[#0066b3] line-clamp-1 hover:text-[#f37021] hover:underline">
                                                                    {item.name}
                                                                </a>
                                                                <p className="text-sm font-semibold text-[#f37021]">{formatCurrency(item.price)}</p>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                {!category.allowMultiple && (
                                                                    <Button variant="ghost" size="sm" onClick={() => handleOpenSelectionModal(category)} className="text-blue-600 hover:bg-blue-50">
                                                                        Đổi
                                                                    </Button>
                                                                )}
                                                                <Button variant="ghost" size="sm" onClick={() => handleRemoveProduct(category.id, idx)} className="text-red-500 hover:bg-red-50">
                                                                    <X size={16} />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="ml-14 border-2 border-dashed border-gray-200 rounded-md p-3 flex items-center justify-center bg-gray-50/50 text-gray-400 text-sm h-[50px]">
                                                    Chưa chọn linh kiện
                                                </div>
                                            )}
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

            {/* MODAL CHỌN SẢN PHẨM */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="!max-w-[1200px] w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden bg-white">
                    <div className="p-4 border-b flex justify-between items-center bg-white shadow-sm z-10">
                        <DialogTitle className="text-xl font-bold text-gray-800 uppercase">
                            Chọn linh kiện: <span className="text-[#0066b3]">{currentCategory?.name}</span>
                        </DialogTitle>
                    </div>

                    <div className="px-6 py-3 bg-gray-50 border-b flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="w-full md:w-1/2 relative">
                            <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                            <Input placeholder="Nhập từ khóa cần tìm..." value={searchTerm}
                                   onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-white" />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                            <span className="text-sm font-semibold text-gray-600 whitespace-nowrap hidden sm:block">Sắp xếp:</span>
                            {['Khuyến mãi tốt nhất', 'Giá tăng dần', 'Giá giảm dần', 'Mới nhất'].map(sort => (
                                <Button key={sort} variant={sortBy === sort ? 'default' : 'outline'} size="sm"
                                        onClick={() => setSortBy(sort)}
                                        className={`whitespace-nowrap ${sortBy === sort ? 'bg-[#0066b3] text-white hover:bg-[#005091]' : 'text-gray-600'}`}>
                                    {sort}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-1 overflow-hidden bg-gray-50/50">
                        <div className="w-64 border-r bg-white p-5 overflow-y-auto hidden md:block">
                            <h5 className="font-bold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2"><Filter size={18} /> Lọc sản phẩm</h5>
                            {FILTER_CONFIG[currentCategory?.id]?.map((filterGroup) => (
                                <div key={filterGroup.key} className="mb-6">
                                    <h6 className="font-semibold text-sm mb-3 text-gray-700">{filterGroup.label}</h6>
                                    <div className="space-y-2">
                                        {filterGroup.options.map((option) => (
                                            <label key={option} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-[#0066b3]">
                                                <input type="checkbox"
                                                       className="rounded text-[#0066b3] focus:ring-[#0066b3] cursor-pointer"
                                                       checked={activeFilters[filterGroup.key] === option}
                                                       onChange={() => toggleFilter(filterGroup.key, option)} /> {option}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {!FILTER_CONFIG[currentCategory?.id] &&
                                <div className="text-sm text-gray-500 italic">Đang cập nhật bộ lọc...</div>}
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto">
                            {isLoadingProducts ? (
                                <div className="flex flex-col items-center justify-center h-64 text-[#0066b3]">
                                    <RefreshCw className="w-8 h-8 animate-spin mb-4" />
                                    <p className="font-medium">Đang tìm kiếm sản phẩm...</p>
                                </div>
                            ) : processedProducts.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {processedProducts.map((product) => (
                                        <div key={product.id} className="bg-white border rounded-xl overflow-hidden hover:shadow-lg hover:border-[#0066b3] transition-all duration-300 flex flex-col group">
                                            <div className="relative h-40 bg-white flex items-center justify-center p-4 border-b border-gray-100">
                                                {product.oldPrice && <div className="absolute top-2 left-2 bg-[#8c52ff] text-white text-xs font-bold px-2 py-1 rounded">Tiết kiệm {formatCurrency(product.oldPrice - product.price)}</div>}
                                                <img
                                                    src={product.imageUrl || `https://via.placeholder.com/200?text=${currentCategory?.id.toUpperCase()}`}
                                                    alt={product.name}
                                                    className="max-h-full object-contain group-hover:scale-105 transition-transform" />
                                            </div>
                                            <div className="p-4 flex flex-col flex-1">
                                                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">{product.brand || 'Thương hiệu'}</div>
                                                <h4 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2 min-h-[40px] group-hover:text-[#0066b3]" title={product.name}>{product.name}</h4>
                                                <div className="mt-auto mb-3">
                                                    {product.oldPrice && <div className="text-gray-400 text-xs line-through mb-0.5">{formatCurrency(product.oldPrice)}</div>}
                                                    <div className="text-[#0066b3] font-bold text-base">{formatCurrency(product.price)}</div>
                                                </div>
                                                <div className="bg-gray-50 border rounded p-2 text-xs text-gray-600 mb-4 flex items-center gap-2">
                                                    <Cpu size={14} className="text-gray-400 flex-shrink-0" />
                                                    <span className="line-clamp-1">{product.specs || product.description || 'Đang cập nhật thông số...'}</span>
                                                </div>
                                                <Button variant="outline" className="w-full border-[#0066b3] text-[#0066b3] hover:bg-[#0066b3] hover:text-white transition-colors" onClick={() => handleSelectProduct(product)}>
                                                    Chọn linh kiện
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-white rounded-lg border border-dashed">
                                    <div className="text-gray-400 mb-2"><Search className="w-12 h-12 mx-auto mb-3 opacity-50" /></div>
                                    <p className="text-gray-600 text-lg">Không tìm thấy sản phẩm nào phù hợp.</p>
                                </div>
                            )}
                        </div>
                    </div>
                    {!isLoadingProducts && totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 py-4 border-t mt-2">
                            <Button variant="outline" disabled={currentPage === 0} onClick={() => fetchProductsForModal(currentCategory, currentPage - 1)}>
                                &laquo; Trang trước
                            </Button>
                            <span className="text-sm text-gray-600 font-medium">Trang {currentPage + 1} / {totalPages}</span>
                            <Button variant="outline" disabled={currentPage >= totalPages - 1} onClick={() => fetchProductsForModal(currentCategory, currentPage + 1)}>
                                Trang sau &raquo;
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}