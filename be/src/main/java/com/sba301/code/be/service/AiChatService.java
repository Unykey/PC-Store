package com.sba301.code.be.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AiChatService {

    private final ChatClient chatClient;
    private final VectorStore vectorStore;

    public AiChatService(ChatClient.Builder chatClientBuilder, VectorStore vectorStore) {
        this.chatClient = chatClientBuilder.build();
        this.vectorStore = vectorStore;
    }

    public String chatWithAi(String userMessage) {
        System.out.println("🤖 Khách hàng hỏi: " + userMessage);

        // ==========================================
        // BƯỚC 1: ROUTER - PHÂN LOẠI Ý ĐỊNH KHÁCH HÀNG
        // ==========================================
        String intentPrompt = """
                Phân tích câu hỏi của khách hàng và trả về CHÍNH XÁC 1 trong 2 từ khóa sau (không giải thích thêm):
                - BUILD_PC: Nếu khách muốn ráp một bộ máy tính hoàn chỉnh, tư vấn cấu hình.
                - FIND_PART: Nếu khách chỉ muốn tìm kiếm, hỏi giá, hoặc mua lẻ một/vài loại linh kiện cụ thể (ví dụ: tìm CPU, tìm RAM, hỏi case dưới 1 triệu).
                """;

        String intent = chatClient.prompt()
                .system(intentPrompt)
                .user(userMessage)
                .call()
                .content()
                .trim();

        System.out.println("🔀 AI Router phân luồng: Khách hàng thuộc nhóm [" + intent + "]");

        // ==========================================
        // BƯỚC 2: TRUY XUẤT DỮ LIỆU TÙY THEO LUỒNG
        // ==========================================
        List<Document> allSelectedComponents = new ArrayList<>();

        if (intent.contains("BUILD_PC")) {
            System.out.println("🔍 Đang chạy luồng BUILD_PC: Lấy đủ 7 loại linh kiện...");
            String[] requiredTypes = {"Cpu", "Mainboard", "Ram", "Gpu", "Storage", "Psu", "PcCase"};
            for (String type : requiredTypes) {
                List<Document> docsForType = vectorStore.similaritySearch(
                        SearchRequest.builder()
                                .query(userMessage)
                                .topK(3)
                                .filterExpression("type == '" + type + "'")
                                .build()
                );
                allSelectedComponents.addAll(docsForType);
            }
        } else {
            System.out.println("🔍 Đang chạy luồng FIND_PART: Quét diện rộng tìm linh kiện lẻ...");
            allSelectedComponents = vectorStore.similaritySearch(
                    SearchRequest.builder()
                            .query(userMessage)
                            .topK(20)
                            .build()
            );
        }

        // ==========================================
        // BƯỚC 3: GỘP DATA VÀ GỌI AI TRẢ LỜI CHÍNH
        // ==========================================
        String productInfo = allSelectedComponents.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n- "));

        String jsonFormat = """
                {
                  "isBuildPc": true,
                  "summary": {
                    "budget": "Ngân sách",
                    "purpose": "Mục đích",
                    "description": "Tóm tắt."
                  },
                  "components": [
                    {
                      "id": 123,
                      "type": "cpu, main, ram, gpu, ssd, psu, case",
                      "name": "Tên sản phẩm",
                      "price": 1500000,
                      "reason": "Lý do chọn"
                    }
                  ],
                  "totalCost": 15000000,
                  "recommendations": "Gợi ý",
                  "conclusion": "Lời kết"
                }
                """;

        String systemPrompt = """
                Bạn là một chuyên gia tư vấn lắp ráp PC của PC Store.
                Danh sách linh kiện có sẵn trong kho:
                {product_info}
                
                QUY TẮC QUAN TRỌNG (VI PHẠM SẼ BỊ PHẠT):
                1. Nếu khách muốn ráp máy, BẮT BUỘC trả về CHỈ MỘT CHUỖI JSON DUY NHẤT theo định dạng sau:
                {json_format}
                
                2. TUYỆT ĐỐI KHÔNG thêm lời chào hỏi (ví dụ: Chào bạn), KHÔNG thêm bất kỳ văn bản giải thích nào ở ngoài khối JSON, và KHÔNG bọc trong thẻ markdown. Toàn bộ câu trả lời phải là một khối JSON hợp lệ.
                
                3. MỘT BỘ PC HOÀN CHỈNH BẮT BUỘC PHẢI CÓ ĐỦ 7 LINH KIỆN CƠ BẢN SAU: CPU, Mainboard, RAM, GPU (Card màn hình), SSD, Nguồn, Case. 
                4. Chỉ được chọn linh kiện có trong danh sách kho, cấm bịa đặt.
                """;

        System.out.println("🚀 Đang gửi " + allSelectedComponents.size() + " linh kiện cho AI phản hồi...");

        return chatClient.prompt()
                .system(s -> s.text(systemPrompt)
                        .param("product_info", productInfo)
                        .param("json_format", jsonFormat))
                .user(userMessage)
                .call()
                .content();
    }
}