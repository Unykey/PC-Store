import {useForm} from 'react-hook-form';
import {Link} from 'react-router-dom';
import {Eye, EyeOff, User, Mail, Phone, Lock, Shield, CheckCircle2} from 'lucide-react';
import {useState} from 'react';
import {AxiosError} from 'axios';
import {authApi} from '../../api/authApi';

interface RegisterFormData {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    agreeToTerms: boolean;
}

export function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        setError,
        formState: {errors}
    } = useForm<RegisterFormData>();

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        setApiError(null);
        // 1. Validate thủ công: Check khớp mật khẩu
        if (data.password !== data.confirmPassword) {
            setError('confirmPassword', {
                type: 'manual',
                message: 'Mật khẩu nhập lại không khớp'
            });
            setIsLoading(false);
            return;
        }

        try {
            // 2. Chuẩn bị dữ liệu gửi đi (Map 'phone' -> 'phoneNumber' cho khớp Backend)
            const payload = {
                fullName: data.fullName,
                email: data.email,
                phoneNumber: data.phone, // Backend cần key là phoneNumber
                password: data.password
            };

            // 3. Gọi API
            await authApi.register(payload);

            // 4. Thành công -> Hiển thị UI thông báo
            setIsSubmitted(true);

        } catch (error) {
            // 5. Xử lý lỗi
            const err = error as AxiosError<{ message: string }>;
            const message = err.response?.data?.message || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!";
            setApiError(message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="max-w-7xl mx-auto p-4 md:p-6">
                <div className="max-w-md mx-auto mt-12">
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                        <div
                            className="w-16 h-16 bg-[#0db14b]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={32} className="text-[#0db14b]"/>
                        </div>
                        <h2 className="text-[#0066b3] mb-3">Đăng Ký Thành Công!</h2>
                        <p className="text-gray-600 mb-6">
                            Tài khoản của bạn đã được tạo thành công. Vui lòng kiểm tra email để xác thực tài khoản.
                        </p>
                        <Link
                            to="/"
                            className="inline-block bg-[#f37021] hover:bg-[#d45f1a] text-white px-8 py-3 rounded-lg transition-colors"
                        >
                            Về trang chủ
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6">
            <div className="max-w-5xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    {/* Left Side - Benefits */}
                    <div
                        className="bg-gradient-to-br from-[#0066b3] to-[#004d85] rounded-lg p-8 text-white hidden md:block">
                        <h2 className="text-white mb-6">Đăng Ký Thành Viên</h2>
                        <p className="text-white/90 mb-8">
                            Trở thành thành viên của TechStore để nhận được những ưu đãi và dịch vụ tốt nhất!
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div
                                    className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Shield size={24} className="text-[#0db14b]"/>
                                </div>
                                <div>
                                    <h4 className="text-white mb-1">Bảo hành ưu tiên</h4>
                                    <p className="text-white/80 text-sm">Được ưu tiên bảo hành và hỗ trợ kỹ thuật
                                        24/7</p>
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
                                    <h4 className="text-white mb-1">Giảm giá đặc biệt</h4>
                                    <p className="text-white/80 text-sm">Nhận mã giảm giá 10% cho đơn hàng đầu tiên</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div
                                    className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-[#0db14b]" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M5 13l4 4L19 7"/>
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-white mb-1">Tích điểm thưởng</h4>
                                    <p className="text-white/80 text-sm">Tích điểm mỗi đơn hàng để đổi quà tặng hấp
                                        dẫn</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div
                                    className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-[#f37021]" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-white mb-1">Thông báo ưu đãi</h4>
                                    <p className="text-white/80 text-sm">Cập nhật sớm nhất các chương trình khuyến
                                        mãi</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Register Form */}
                    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
                        <div className="mb-6">
                            <h2 className="text-[#0066b3] mb-2">Tạo Tài Khoản</h2>
                            <p className="text-gray-600 text-sm">
                                Điền thông tin bên dưới để đăng ký tài khoản mới
                            </p>
                        </div>

                        {apiError && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                <Shield className="w-5 h-5 text-red-500 mt-0.5"/>
                                <p className="text-sm text-red-600">{apiError}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Họ và tên</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
                                    <input
                                        type="text"
                                        {...register('fullName', {required: 'Vui lòng nhập họ tên'})}
                                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                                            errors.fullName ? 'border-red-500' : 'border-gray-300'
                                        } focus:ring-2 focus:ring-[#0066b3] focus:border-transparent outline-none transition-all`}
                                        placeholder="Nguyễn Văn A"
                                    />
                                </div>
                                {errors.fullName &&
                                    <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
                                    <input
                                        type="email"
                                        {...register('email', {
                                            required: 'Vui lòng nhập email',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Email không hợp lệ'
                                            }
                                        })}
                                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                                            errors.email ? 'border-red-500' : 'border-gray-300'
                                        } focus:ring-2 focus:ring-[#0066b3] focus:border-transparent outline-none transition-all`}
                                        placeholder="email@example.com"
                                    />
                                </div>
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
                                    <input
                                        type="tel"
                                        {...register('phone', {
                                            required: 'Vui lòng nhập số điện thoại',
                                            pattern: {
                                                value: /(84|0[3|5|7|8|9])+([0-9]{8})\b/,
                                                message: 'Số điện thoại không hợp lệ'
                                            }
                                        })}
                                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                                            errors.phone ? 'border-red-500' : 'border-gray-300'
                                        } focus:ring-2 focus:ring-[#0066b3] focus:border-transparent outline-none transition-all`}
                                        placeholder="0912345678"
                                    />
                                </div>
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        {...register('password', {
                                            required: 'Vui lòng nhập mật khẩu',
                                            minLength: {
                                                value: 6,
                                                message: 'Mật khẩu phải có ít nhất 6 ký tự'
                                            }
                                        })}
                                        className={`w-full pl-10 pr-12 py-2.5 rounded-lg border ${
                                            errors.password ? 'border-red-500' : 'border-gray-300'
                                        } focus:ring-2 focus:ring-[#0066b3] focus:border-transparent outline-none transition-all`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                                    </button>
                                </div>
                                {errors.password &&
                                    <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        {...register('confirmPassword', {
                                            required: 'Vui lòng nhập lại mật khẩu',
                                            validate: (val) => {
                                                if (!val) {
                                                    return "Vui lòng nhập lại mật khẩu";
                                                }
                                                if (watch('password') != val) {
                                                    return "Mật khẩu không khớp";
                                                }
                                            }
                                        })}
                                        className={`w-full pl-10 pr-12 py-2.5 rounded-lg border ${
                                            errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                        } focus:ring-2 focus:ring-[#0066b3] focus:border-transparent outline-none transition-all`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5"/> :
                                            <Eye className="w-5 h-5"/>}
                                    </button>
                                </div>
                                {errors.confirmPassword &&
                                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                            </div>

                            {/* Terms Checkbox */}
                            <div className="flex items-start">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        {...register('agreeToTerms', {required: 'Bạn cần đồng ý với điều khoản sử dụng'})}
                                        className="w-4 h-4 rounded border-gray-300 text-[#0066b3] focus:ring-[#0066b3] mt-1"
                                    />
                                    <span className="text-sm text-gray-600">
                                        Tôi đồng ý với{' '}
                                        <a href="#" className="text-[#0066b3] hover:underline">
                                            Điều khoản sử dụng
                                        </a>{' '}
                                        và{' '}
                                        <a href="#" className="text-[#0066b3] hover:underline">
                                            Chính sách bảo mật
                                        </a>
                                    </span>
                                </label>
                            </div>
                            {errors.agreeToTerms && (
                                <p className="text-red-500 text-sm mt-0">{errors.agreeToTerms.message}</p>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#f37021] hover:bg-[#d45f1a] text-white py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                             xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                    strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor"
                                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang xử lý...
                                    </>
                                ) : "Đăng Ký"}
                            </button>
                        </form>

                        {/* Login Link */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Đã có tài khoản?{' '}
                                <Link to="/login" className="text-[#0066b3] hover:underline">
                                    Đăng nhập ngay
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}