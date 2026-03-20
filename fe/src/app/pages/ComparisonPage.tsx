import { useEffect, useState } from "react";
import { ComparisonTable } from "../components/ComparisonTable";
import { productApi } from "@/api/productApi";

export function ComparisonPage() {
  const [comparisonProducts, setComparisonProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await productApi.getAllProducts();
      console.log(res.data);

      const mapped = res.data.map((item: any) => ({
        model: item.name,
        image: item.image || "",

        processor: item.processor || "",
        ram: item.ram || "",
        rom: item.rom || "",

        display: item.display || "",
        graphics: item.graphics || "",
        os: item.os || "",
        battery: item.battery || "",

        price: item.price?.toString() || "0",

        brand: item.name?.split(" ")[0] || "",
        year: item.year?.toString() || "",
        weight: item.weight || "",
        refreshRate: item.refreshRate || "",
        storageType: item.categoryName || "",
      }));

      setComparisonProducts(mapped);
    };

    fetchProducts();
  }, []);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-[#0066b3] mb-2">So Sánh Laptop</h1>
        <p className="text-gray-600">
          So sánh thông số kỹ thuật để chọn laptop phù hợp nhất
        </p>
      </div>

      <ComparisonTable products={comparisonProducts} />
    </div>
  );
}
