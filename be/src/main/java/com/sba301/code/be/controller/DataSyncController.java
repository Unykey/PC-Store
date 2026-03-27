package com.sba301.code.be.controller;

import com.sba301.code.be.service.DataSyncService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/data")
public class DataSyncController {

    private final DataSyncService dataSyncService;

    // Dependency Injection: Spring tự động tiêm DataSyncService vào đây
    public DataSyncController(DataSyncService dataSyncService) {
        this.dataSyncService = dataSyncService;
    }

    /**
     * API Đồng bộ dữ liệu linh kiện từ Postgres sang Qdrant
     * Endpoint: POST /api/admin/data/sync-vectors
     */
    @PostMapping("/sync-vectors")
    public ResponseEntity<String> syncDataToVectorStore() {
        try {
            System.out.println("API Gọi: Bắt đầu tiến trình đồng bộ Vector DB...");

            // Gọi hàm logic từ Service
            dataSyncService.syncComponentsToVectorStore();

            return ResponseEntity.ok("✅ Đồng bộ dữ liệu linh kiện lên Qdrant thành công!");
        } catch (Exception e) {
            // Bắt lỗi và trả về HTTP Status 500 nếu có sự cố (Vd: Qdrant sập, Ollama lỗi)
            System.err.println("Lỗi đồng bộ: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Lỗi trong quá trình đồng bộ: " + e.getMessage());
        }
    }
}