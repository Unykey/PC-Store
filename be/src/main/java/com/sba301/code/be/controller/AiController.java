package com.sba301.code.be.controller;

//import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiController {

//    private final ChatClient chatClient;
//
//    // Spring Boot tự động Inject ChatClient.Builder vào Constructor
//    public AiController(ChatClient.Builder chatClientBuilder) {
//        // Build đối tượng ChatClient duy nhất để sử dụng cho toàn bộ Controller này
//        this.chatClient = chatClientBuilder.build();
//    }
//
//    @GetMapping("/test")
//    public String testAi(@RequestParam(defaultValue = "Đóng vai chuyên gia phần cứng PC. Chào tôi 1 câu ngắn gọn.") String message) {
//
//        // Gọi AI bằng Fluent API (Chuỗi method liên tiếp)
//        return chatClient.prompt()        // 1. Khởi tạo một yêu cầu (prompt)
//                .user(message)            // 2. Gắn nội dung của user vào
//                .call()                   // 3. Gửi request lên server Google
//                .content();               // 4. Trích xuất text từ JSON trả về
//    }
}