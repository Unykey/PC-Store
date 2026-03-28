import { useEffect, useState } from "react";
import { ComparisonTable } from "../components/ComparisonTable";
import { publicProductApi } from "@/api/productApi";
import { specificationApi } from "@/api/specificationApi";
import { useParams } from "react-router-dom";

export function ComparisonPage() {
  const { id } = useParams();
  const [comparisonProducts, setComparisonProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!id) return;

      const mapProduct = (item: any, allSpecs: any[]) => {
        const specs: Record<string, string> = {};

        allSpecs
          .filter((s) => s.productId === item.productId)
          .forEach((s) => {
            specs[s.specKey] = s.specValue; // giữ nguyên key gốc
          });

        return {
          productId: item.productId,
          model: item.name,
          image: item.image,
          price: item.price?.toString() || "0",
          brand: item.name?.split(" ")[0] || "",
          category: item.categoryName || "",
          specs, // toàn bộ specs
        };
      };

      const productRes = await publicProductApi.getProductById(Number(id));
      const selected = productRes.data.data;

      const specRes = await specificationApi.getAll();
      const allSpecs = specRes.data.data;

      const selectedMapped = mapProduct(selected, allSpecs);

      const res = await publicProductApi.getAllProducts();
      const list = res.data.data;

      const mapped = list.map((item) => mapProduct(item, allSpecs));

      setComparisonProducts([
        selectedMapped,
        ...mapped.filter((p) => p.model !== selectedMapped.model),
      ]);
    };

    fetchProducts();
  }, [id]);

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
