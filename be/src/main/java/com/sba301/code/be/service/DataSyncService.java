package com.sba301.code.be.service;

import com.sba301.code.be.model.entity.PcComponent;
import com.sba301.code.be.repository.PcComponentRepository;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class DataSyncService {

    private final PcComponentRepository pcComponentRepository;
    private final VectorStore vectorStore;

    // Spring tự động tiêm Postgres Repo và Qdrant VectorStore vào đây
    public DataSyncService(PcComponentRepository pcComponentRepository, VectorStore vectorStore) {
        this.pcComponentRepository = pcComponentRepository;
        this.vectorStore = vectorStore;
    }

    public void syncComponentsToVectorStore() {
        System.out.println("Bắt đầu lấy dữ liệu từ Postgres...");
        List<PcComponent> components = pcComponentRepository.findAll();

        List<Document> documents = new ArrayList<>();

        for (PcComponent comp : components) {
            // 1. Tạo nội dung văn bản cho AI "đọc hiểu"
            // Việc sắp xếp câu chữ rõ ràng giúp AI tìm kiếm chính xác hơn
            String content = String.format(
                    "Sản phẩm: %s. Loại: %s. Hãng sản xuất: %s. Giá bán: %s VND. Mô tả: %s",
                    comp.getName(),
                    comp.getClass().getSimpleName(), // Lấy tên Class (Cpu, Gpu, Ram...) làm loại
                    comp.getManufacturer(),
                    comp.getPrice(),
                    comp.getDescription()
            );

            // 2. Định nghĩa Metadata (Siêu dữ liệu)
            // Cực kỳ quan trọng: Giúp ta query kiểu "Tìm CPU dưới 5 triệu", Vector Store sẽ lọc metadata trước để tiết kiệm token
            Map<String, Object> metadata = Map.of(
                    "id", comp.getProductId(),
                    "type", comp.getClass().getSimpleName(),
                    "price", comp.getPrice() != null ? comp.getPrice().doubleValue() : 0.0, // <--- SỬA DÒNG NÀY
                    "manufacturer", comp.getManufacturer() != null ? comp.getManufacturer() : "Unknown"
            );

            // 3. Tạo đối tượng Document của Spring AI
            Document document = new Document(content, metadata);
            documents.add(document);
        }

        System.out.println("Bắt đầu Vector hóa và lưu vào Qdrant (Quá trình này có thể mất vài phút)...");
        // 4. Lưu toàn bộ vào Qdrant (Spring AI sẽ tự động gọi model nomic-embed-text để nhúng)
        vectorStore.add(documents);

        System.out.println("✅ Đã đồng bộ thành công " + documents.size() + " linh kiện vào Qdrant!");
    }
}