export interface ProductMock {
    id: number;
    image: string;
    name: string;
    price: number;
    oldPrice?: number;
    rating?: number;
    discount?: string;
    inStock?: boolean;
    description?: string;
}

export const mockProducts: ProductMock[] = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1640955014216-75201056c829?auto=format&fit=crop&q=80&w=800",
        name: "Laptop Gaming MSI Katana 15 - Intel Core i7 Gen 13",
        price: 25990000,
        oldPrice: 32990000,
        rating: 4.8,
        discount: "21%",
        inStock: true,
        description: "Laptop gaming hiệu năng cao, màn hình mượt, phù hợp chơi game và học tập/làm việc nặng.",
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&q=80&w=800",
        name: "PC Gaming TechStore Dragon - RTX 4060 Ti",
        price: 18590000,
        oldPrice: 22000000,
        rating: 5.0,
        discount: "15%",
        inStock: true,
        description: "PC gaming tối ưu tầm trung cao, cân tốt game AAA và làm đồ họa.",
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&q=80&w=800",
        name: "Màn hình ASUS TUF Gaming 27\" IPS 165Hz",
        price: 4290000,
        oldPrice: 5500000,
        rating: 4.7,
        discount: "22%",
        inStock: true,
        description: "Màn hình gaming tần số quét cao, màu sắc đẹp, phù hợp cả game và giải trí.",
    },
    {
        id: 4,
        image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=800",
        name: "Bàn phím cơ Keychron K2 Pro - Hot Swap",
        price: 2190000,
        oldPrice: 2500000,
        rating: 4.9,
        discount: "12%",
        inStock: false,
        description: "Bàn phím cơ gọn gàng, cảm giác gõ tốt, hỗ trợ nhiều layout và switch hot-swap.",
    },
];

export const getProductById = (id: number): ProductMock | undefined =>
    mockProducts.find((p) => p.id === id);
