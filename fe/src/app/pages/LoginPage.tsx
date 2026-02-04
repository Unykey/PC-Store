import {useForm} from 'react-hook-form';
import { AxiosError } from 'axios';
import {Link, useNavigate} from 'react-router';
import {Eye, EyeOff, Mail, Lock, Shield, CheckCircle2} from 'lucide-react';
import {useState} from 'react';
import { authApi } from '@/api/authApi';

interface LoginFormData {
    email: string;
    password: string;
    rememberMe: boolean;
}

export function LoginPage() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    const {
        register,
        handleSubmit,
        formState: {errors}
    } = useForm<LoginFormData>();

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        setApiError("");
        try {
            // Gọi API (chỉ gửi email & password, rememberMe xử lý sau nếu cần)
            const res = await authApi.login({
                email: data.email,
                password: data.password
            });

            if (res.data && res.data.data) {
                // 1. Lưu token
                localStorage.setItem("accessToken", res.data.data.accessToken);

                // 2. Xử lý Remember Me (Optional - lưu email vào local để lần sau tự điền)
                if (data.rememberMe) {
                    localStorage.setItem("savedEmail", data.email);
                } else {
                    localStorage.removeItem("savedEmail");
                }

                // 3. Chuyển hướng về trang chủ
                navigate("/");
            }
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            const message = err.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại!";
            setApiError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6">
            <div className="max-w-5xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    {/* Left Side - Benefits */}
                    <div
                        className="bg-gradient-to-br from-[#0066b3] to-[#004d85] rounded-lg p-8 text-white hidden md:block">
                        <h2 className="text-white mb-6">Chào Mừng Trở Lại</h2>
                        <p className="text-white/90 mb-8">
                            Đăng nhập để trải nghiệm mua sắm tuyệt vời và nhận được những ưu đãi độc quyền!
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div
                                    className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Shield size={24} className="text-[#Shield]"/>
                                </div>
                                <div>
                                    <h4 className="text-white mb-1">Bảo mật tuyệt đối</h4>
                                    <p className="text-white/80 text-sm">Thông tin của bạn được mã hóa và bảo vệ an
                                        toàn</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div
                                    className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-[#f37021]" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-white mb-1">Ưu đãi độc quyền</h4>
                                    <p className="text-white/80 text-sm">Giảm giá và khuyến mãi dành riêng cho thành
                                        viên</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div
                                    className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <CheckCircle2 size={24} className="text-[#0db14b]"/>
                                </div>
                                <div>
                                    <h4 className="text-white mb-1">Theo dõi đơn hàng</h4>
                                    <p className="text-white/80 text-sm">Quản lý đơn hàng và lịch sử mua hàng dễ
                                        dàng</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div
                                    className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-[#f37021]" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-white mb-1">Mua sắm nhanh chóng</h4>
                                    <p className="text-white/80 text-sm">Thanh toán nhanh với thông tin đã lưu</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
                        <div className="mb-6">
                            <h2 className="text-[#0066b3] mb-2">Đăng Nhập</h2>
                            <p className="text-gray-600 text-sm">
                                Đăng nhập để tiếp tục mua sắm
                            </p>
                        </div>

                        {/* Hiển thị lỗi API nếu có */}
                        {apiError && (
                            <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                {apiError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm mb-2 text-gray-700">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                                    <input
                                        id="email"
                                        type="email"
                                        {...register('email', {
                                            required: 'Vui lòng nhập email',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Email không hợp lệ'
                                            }
                                        })}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066b3] focus:border-transparent"
                                        placeholder="email@example.com"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm mb-2 text-gray-700">
                                    Mật khẩu <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        {...register('password', {
                                            required: 'Vui lòng nhập mật khẩu'
                                        })}
                                        className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066b3] focus:border-transparent"
                                        placeholder="Nhập mật khẩu"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                                )}
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        {...register('rememberMe')}
                                        className="w-4 h-4 text-[#0066b3] border-gray-300 rounded focus:ring-[#0066b3]"
                                    />
                                    <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
                                </label>
                                <a href="#" className="text-sm text-[#0066b3] hover:underline">
                                    Quên mật khẩu?
                                </a>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#f37021] hover:bg-[#d45f1a] text-white py-3 rounded-lg transition-colors"
                            >
                                {isLoading ? "Đang xử lý..." : "Đăng Nhập"}
                            </button>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">hoặc</span>
                                </div>
                            </div>

                            {/* Social Login */}
                            <div className="space-y-3">
                                <button
                                    className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4"
                                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853"
                                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05"
                                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="#EA4335"
                                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                    <span className="text-gray-700">Đăng nhập với Google</span>
                                </button>

                                <button
                                    className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                    <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                                        <path
                                            d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                    <span className="text-gray-700">Đăng nhập với Facebook</span>
                                </button>
                            </div>

                            {/* Register Link */}
                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    Chưa có tài khoản?{' '}
                                    <Link to="/register" className="text-[#0066b3] hover:underline">
                                        Đăng ký ngay
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}