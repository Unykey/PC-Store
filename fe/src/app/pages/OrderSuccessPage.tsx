import { Link, useSearchParams } from "react-router-dom";

export default function OrderSuccessPage() {
    const [params] = useSearchParams();
    const orderId = params.get("orderId") || "-";
    const method = params.get("method") || "-";

    return (
        <div className="min-h-screen bg-green-50 py-10">
            <div className="mx-auto max-w-3xl rounded-xl border border-green-200 bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-green-700">
                    Chuc mung ban da dat hang tra gop thanh cong!
                </h1>

                <div className="mt-4 space-y-2 text-sm text-gray-700">
                    <p>
                        Ma don hang: <span className="font-semibold">#{orderId}</span>
                    </p>
                    <p>
                        Phuong thuc: <span className="font-semibold">{method}</span>
                    </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                        to={`/orders/${orderId}`}
                        className="rounded-md bg-[#0066b3] px-4 py-2 text-white hover:bg-[#005091]"
                    >
                        Xem chi tiet don
                    </Link>
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
