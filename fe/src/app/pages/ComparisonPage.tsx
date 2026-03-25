import { useEffect, useState } from "react";
import { ComparisonTable } from "../components/ComparisonTable";
import { publicProductApi } from "@/api/productApi";
import { useParams } from "react-router-dom";

export function ComparisonPage() {
  const { id } = useParams();
  const [comparisonProducts, setComparisonProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!id) return;

      const mapSpecs = (specs: any[]) => {
        const result: Record<string, string> = {};
        specs?.forEach((s) => {
          result[s.specKey.toLowerCase()] = s.specValue;
        });
        return result;
      };

      const mapProduct = (item: any) => {
        const specs = mapSpecs(item.specifications);

        return {
          model: item.name,
          image: null,

          processor: specs["processor"] || specs["cores"] || "",
          ram: specs["ram"] || "",
          rom: specs["storage"] || "",

          display: specs["display"] || "",
          graphics: specs["vram"] || "",
          os: "",

          battery: specs["battery"] || "",

          price: item.price?.toString() || "0",

          brand: item.name?.split(" ")[0] || "",
          year: "",
          weight: "",
          refreshRate: "",
          storageType: item.categoryName || "",
        };
      };

      const productRes = await publicProductApi.getProductById(Number(id));
      const selected = productRes.data.data;

      const selectedMapped = mapProduct(selected);

      const res = await publicProductApi.getAllProducts();

      const mapped = res.data.data.map(mapProduct);

      setComparisonProducts([
        selectedMapped,
        ...mapped.filter((p) => p.model !== selected.name),
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
