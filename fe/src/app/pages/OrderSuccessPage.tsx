import { Link, useSearchParams } from "react-router-dom";

export default function OrderSuccessPage() {
    const [params] = useSearchParams();
    const orderId = params.get("orderId") || "-";
    const method = params.get("method") || "-";

    const isInstallment = method.includes("Tra gop");

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 py-10 px-4">
            <div className="mx-auto max-w-2xl">
                {/* Success Icon */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 border-4 border-green-300 mb-4">
                        <span className="text-3xl font-bold text-green-700">Thành công</span>
                    </div>
                </div>

                <div className="rounded-2xl border border-green-200 bg-white p-8 shadow-lg">
                    <h1 className="text-center text-3xl font-bold text-green-700 mb-2">
                        Đơn hàng đã được tạo thành công!
                    </h1>
                    <p className="text-center text-gray-600 mb-6">
                        Cảm ơn bạn đã mua hàng. Thông tin chi tiết đơn hàng đã được gửi đến email của bạn.
                    </p>

                    {/* Order Details Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 mb-6 border border-green-200">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Mã đơn hàng</p>
                                <p className="text-2xl font-bold text-[#0066b3] mt-1">#{orderId}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Phương thức thanh toán</p>
                                <p className="text-lg font-semibold text-[#f37021] mt-1">{method}</p>
                            </div>
                        </div>
                    </div>

                    {/* Next Steps */}
                    <div className="bg-blue-50 rounded-lg p-5 mb-6 border border-blue-200">
                        <h3 className="font-semibold text-gray-800 mb-3">Bước tiếp theo:</h3>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start gap-3">
                                <span className="text-blue-600 font-bold w-6">1.</span>
                                <span>Xem chi tiết đơn hàng để theo dõi trạng thái giao hàng</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-blue-600 font-bold w-6">2.</span>
                                <span>Chuẩn bị địa chỉ giao hàng và thời gian phù hợp</span>
                            </li>
                            {isInstallment && (
                                <li className="flex items-start gap-3">
                                    <span className="text-blue-600 font-bold w-6">3.</span>
                                    <span>Xem lịch trả góp của bạn trong mục "Lịch trả góp"</span>
                                </li>
                            )}
                            {!isInstallment && (
                                <li className="flex items-start gap-3">
                                    <span className="text-blue-600 font-bold w-6">3.</span>
                                    <span>Nhân viên sẽ liên hệ bạn để xác nhận đơn hàng</span>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 justify-center">
                        <Link
                            to={`/orders/${orderId}`}
                            className="rounded-lg bg-[#0066b3] px-6 py-3 font-semibold text-white hover:bg-[#005091] transition shadow-md inline-block"
                        >
                            Xem chi tiết đơn hàng
                        </Link>
                        {isInstallment && (
                            <Link
                                to="/my-installments"
                                className="rounded-lg bg-[#f37021] px-6 py-3 font-semibold text-white hover:bg-[#d45f1a] transition shadow-md inline-block"
                            >
                                Xem lịch trả góp
                            </Link>
                        )}
                        <Link
                            to="/orders"
                            className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-100 transition inline-block"
                        >
                            Danh sách đơn hàng
                        </Link>
                    </div>

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-gray-700">
                        <p className="font-semibold mb-2">Thông tin quan trọng:</p>
                        <p>Nếu bạn không nhận được email xác nhận, vui lòng kiểm tra thư mục Spam hoặc liên hệ với bộ phận hỗ trợ khách hàng.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
