import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { publicProductApi } from "@/api/productApi";
import { formatVnd } from "../utils/formatCurrency";
import { getImageUrl } from "../utils/image";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [openInstallmentModal, setOpenInstallmentModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const res = await publicProductApi.getProductById(Number(id));
        setProduct(res.data.data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin sản phẩm:", error);
      }
    };
    fetchProduct();
  }, [id]);

  const installmentPreview = useMemo(() => {
    if (!product) return [];
    const months = [3, 6, 9] as const;
    return months.map((m) => ({
      months: m,
      monthly: Math.ceil(product.price / m),
      total: Math.ceil(product.price / m) * m,
    }));
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="mx-auto max-w-4xl rounded-lg border bg-white p-6">
          <p className="text-gray-700">Không tìm thấy sản phẩm.</p>
          <Link
            to="/"
            className="mt-3 inline-block text-[#0066b3] hover:underline"
          >
            Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-5xl px-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 md:grid-cols-2">
            <img
              src={getImageUrl(product.image)}
              alt={product.name}
              className="h-[360px] w-full rounded-lg object-cover"
            />

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {product.name}
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                {product.description}
              </p>

              <div className="mt-4 flex items-end gap-3">
                <span className="text-3xl font-bold text-[#f37021]">
                  {formatVnd(product.price)}
                </span>
                {product.oldPrice && (
                  <span className="text-gray-400 line-through">
                    {formatVnd(product.oldPrice)}
                  </span>
                )}
              </div>

              <p className="mt-4 text-sm text-gray-600">
                Đánh giá:{" "}
                <span className="font-semibold">{product.rating ?? 4.5}/5</span>
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to={`/checkout?productId=${product.id}&quantity=1`}
                  className="rounded-md bg-[#f37021] px-4 py-2.5 font-medium text-white hover:bg-[#d45f1a]"
                >
                  Mua ngay
                </Link>
                <Link
                  to={`/compare/${product.productId}`}
                  className="rounded-md border border-[#0066b3] px-4 py-2.5 font-medium text-[#0066b3] hover:bg-[#0066b3]/10"
                >
                  So sánh
                </Link>
              </div>

              <button
                onClick={() => setOpenInstallmentModal(true)}
                className="mt-4 w-full rounded-lg border border-[#0066b3]/30 bg-[#0066b3]/5 p-3 text-left text-sm hover:bg-[#0066b3]/10"
              >
                <span className="font-semibold text-[#0066b3]">
                  Trả góp chỉ từ {formatVnd(Math.ceil(product.price / 9))}/tháng
                  qua MoMo
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {openInstallmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#0066b3]">
                Bảng tính trả góp MoMo (ước tính)
              </h2>
              <button
                onClick={() => setOpenInstallmentModal(false)}
                className="rounded-md border px-2 py-1 text-sm hover:bg-gray-50"
              >
                Đóng
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-3 py-2 text-left">Kỳ hạn</th>
                    <th className="px-3 py-2 text-left">Trả mỗi tháng</th>
                    <th className="px-3 py-2 text-left">Tổng dự kiến</th>
                  </tr>
                </thead>
                <tbody>
                  {installmentPreview.map((row) => (
                    <tr key={row.months} className="border-b">
                      <td className="px-3 py-2">{row.months} tháng</td>
                      <td className="px-3 py-2 font-semibold text-[#f37021]">
                        {formatVnd(row.monthly)}
                      </td>
                      <td className="px-3 py-2">{formatVnd(row.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              Lưu ý: Đây là bảng tính nhẩm frontend. Số tiền thực tế phụ thuộc
              cấu hình trả góp backend và trạng thái đơn.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
