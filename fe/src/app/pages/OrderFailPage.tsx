import { Link, useSearchParams } from "react-router-dom";

export default function OrderFailPage() {
    const [params] = useSearchParams();
    const orderId = params.get("orderId");

    return (
        <div className="min-h-screen bg-red-50 py-10">
            <div className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-red-700">Thanh toan that bai hoac chua hoan tat</h1>

                <p className="mt-3 text-sm text-gray-700">
                    Vui long thu lai thanh toan hoac kiem tra trang thai don hang.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                    {orderId && (
                        <Link
                            to={`/orders/${orderId}`}
                            className="rounded-md bg-[#0066b3] px-4 py-2 text-white hover:bg-[#005091]"
                        >
                            Xem chi tiet don
                        </Link>
                    )}
                    <Link
                        to="/orders"
                        className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
                    >
                        Danh sach don hang
                    </Link>
                </div>
            </div>
        </div>
    );
}
