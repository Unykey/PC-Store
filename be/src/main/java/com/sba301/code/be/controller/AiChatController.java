package com.sba301.code.be.controller;

import com.sba301.code.be.service.AiChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*") // Rất quan trọng: Mở CORS để React (cổng 3000/5173) có thể gọi API này mà không bị trình duyệt chặn
public class AiChatController {

    private final AiChatService aiChatService;

    // Sử dụng Constructor Injection (khuyên dùng trong Spring Boot thay vì @Autowired)
    public AiChatController(AiChatService aiChatService) {
        this.aiChatService = aiChatService;
    }

    @PostMapping
    public ResponseEntity<String> chatWithAi(@RequestBody Map<String, String> request) {
        // Lấy câu hỏi của người dùng từ body của request ({"message": "Mình cần ráp PC..."})
        String message = request.get("message");

        // 1. Validate dữ liệu đầu vào (Luôn phải có khi làm API)
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Vui lòng nhập câu hỏi tư vấn!");
        }

        try {
            // 2. Gọi Service để xử lý logic RAG (Tìm kiếm vector + Gọi Gemini)
            String response = aiChatService.chatWithAi(message);

            // 3. Trả về kết quả thành công (HTTP 200)
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // In lỗi ra console để dev dễ debug, và trả về HTTP 500 cho frontend
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Đã xảy ra lỗi khi kết nối với AI: " + e.getMessage());
        }
    }
}