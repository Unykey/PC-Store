import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Bot, User, Zap } from 'lucide-react';
import { Button } from './ui/button.tsx';
import { Input } from './ui/input.tsx';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.tsx';

// Hàm format tiền tệ nội bộ cho Component này
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Định nghĩa kiểu dữ liệu tin nhắn
interface Message {
    role: 'ai' | 'user';
    content: string;
}

// Props nhận từ trang BuildPC (truyền hàm apply cấu hình ra ngoài)
interface AiChatAssistantProps {
    onApplyBuild: (components: any[]) => void;
}

export default function AiChatAssistant({ onApplyBuild }: AiChatAssistantProps) {
    const [aiPrompt, setAiPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', content: 'Chào bạn! Mình là AI tư vấn của PC Store. Bạn cần ráp bộ máy ngân sách bao nhiêu hay đang tìm linh kiện gì?' }
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Tự động cuộn xuống tin nhắn mới nhất
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const handleSendMessage = async () => {
        if (!aiPrompt.trim()) return;
        const userMsg = aiPrompt;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setAiPrompt('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8080/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg }),
            });

            if (!response.ok) throw new Error('Lỗi kết nối server');
            const aiResponse = await response.text();
            setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', content: 'Xin lỗi, hệ thống AI đang bảo trì!' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const renderMessageContent = (msg: Message) => {
        if (msg.role === 'user') return msg.content;
        try {
            let cleanJsonString = msg.content;
            const jsonMatch = msg.content.match(/\{[\s\S]*\}/);
            if (jsonMatch) cleanJsonString = jsonMatch[0];
            const data = JSON.parse(cleanJsonString);

            if (data.isBuildPc) {
                return (
                    <div className="space-y-4 w-full text-sm">
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <h4 className="font-bold text-[#0066b3] mb-2 flex items-center gap-2">
                                <Sparkles size={16} /> Tóm Tắt Cấu Hình
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                                <p><span className="font-semibold text-gray-600">Ngân sách:</span> {data.summary.budget}</p>
                                <p><span className="font-semibold text-gray-600">Nhu cầu:</span> {data.summary.purpose}</p>
                            </div>
                            <p className="text-gray-700">{data.summary.description}</p>
                        </div>

                        <div>
                            <h4 className="font-bold text-gray-800 border-b pb-2 mb-3">Linh Kiện Đề Xuất</h4>
                            <div className="space-y-3">
                                {data.components.map((comp: any, i: number) => (
                                    <div key={i} className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <span className="font-semibold text-[#0066b3]">{comp.name}</span>
                                            <p className="text-xs text-gray-500 mt-0.5">{comp.reason}</p>
                                        </div>
                                        <div className="font-bold text-[#f37021] whitespace-nowrap">
                                            {formatCurrency(comp.price)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Button
                            onClick={() => onApplyBuild(data.components)} // GỌI HÀM TỪ PROPS
                            className="w-full bg-[#0066b3] hover:bg-[#005091] mt-2 shadow-md"
                        >
                            <Zap className="mr-2 h-4 w-4" /> Áp Dụng Cấu Hình
                        </Button>
                    </div>
                );
            }
        } catch (e) {
            return (
                <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
            );
        }
    };

    return (
        <Card className="border-[#0066b3] border-2 shadow-lg bg-gradient-to-r from-blue-50 to-white flex flex-col h-[550px]">
            <CardHeader className="pb-2 flex-shrink-0">
                <CardTitle className="flex items-center gap-2 text-[#0066b3]">
                    <Sparkles className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                    Trợ lý AI Build PC
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto mb-4 bg-white/60 rounded-lg border border-blue-100 p-4 shadow-inner space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'ai' && <div className="w-8 h-8 rounded-full bg-[#0066b3] flex items-center justify-center flex-shrink-0"><Bot size={18} className="text-white" /></div>}
                            <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.role === 'user' ? 'bg-[#0066b3] text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'}`}>
                                {renderMessageContent(msg)}
                            </div>
                            {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><User size={18} className="text-gray-600" /></div>}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-3 justify-start">
                            <div className="w-8 h-8 rounded-full bg-[#0066b3] flex items-center justify-center"><Bot size={18} className="text-white" /></div>
                            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm p-3 flex items-center gap-1"><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span></div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="flex-shrink-0">
                    <div className="flex gap-3">
                        <Input
                            placeholder="Ví dụ: Cần ráp PC 15 triệu chơi Valorant..."
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            disabled={isLoading}
                            className="bg-white"
                        />
                        <Button
                            onClick={handleSendMessage}
                            disabled={isLoading || !aiPrompt.trim()}
                            className="bg-[#f37021] hover:bg-[#d45f1a] text-white font-semibold"
                        >
                            Gửi
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}