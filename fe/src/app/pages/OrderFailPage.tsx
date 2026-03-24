import { Link, useSearchParams } from "react-router-dom";

export default function OrderFailPage() {
    const [params] = useSearchParams();
    const orderId = params.get("orderId");

    return (
        <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 py-10 px-4">
            <div className="mx-auto max-w-2xl">
                {/* Error Icon */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 border-4 border-red-300 mb-4">
                        <span className="text-3xl font-bold text-red-700">Lỗi</span>
                    </div>
                </div>

                <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-lg">
                    <h1 className="text-center text-3xl font-bold text-red-700 mb-2">
                        Thanh toán không thành công
                    </h1>
                    <p className="text-center text-gray-600 mb-6">
                        Có lỗi xảy ra trong quá trình thanh toán hoặc giao dịch chưa hoàn tất.
                    </p>

                    {/* Error Details */}
                    <div className="bg-red-50 rounded-lg p-6 mb-6 border border-red-200">
                        <h3 className="font-semibold text-red-700 mb-3">Nguyên nhân có thể:</h3>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-center gap-2">
                                <span className="text-red-600">•</span>
                                Số dư ví MoMo không đủ
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-red-600">•</span>
                                Giao dịch bị từ chối hoặc hết hạn
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-red-600">•</span>
                                Kết nối mạng bị gián đoạn
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-red-600">•</span>
                                Tài khoản bị khóa hoặc hạn chế
                            </li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 justify-center">
                        <Link
                            to="/checkout"
                            className="rounded-lg bg-[#f37021] px-6 py-3 font-semibold text-white hover:bg-[#d45f1a] transition shadow-md inline-block"
                        >
                            Thử lại thanh toán
                        </Link>
                        {orderId && (
                            <Link
                                to={`/orders/${orderId}`}
                                className="rounded-lg bg-[#0066b3] px-6 py-3 font-semibold text-white hover:bg-[#005091] transition shadow-md inline-block"
                            >
                                Xem đơn hàng
                            </Link>
                        )}
                        <Link
                            to="/orders"
                            className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-100 transition inline-block"
                        >
                            Danh sách đơn hàng
                        </Link>
                    </div>

                    {/* Support Info */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
                        <p className="font-semibold mb-2">Cần trợ giúp?</p>
                        <p>Nếu sự cố tiếp tục xảy ra, vui lòng liên hệ bộ phận hỗ trợ khách hàng hoặc thử lại sau vài phút.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
