package com.sba301.code.be.service;

import com.sba301.code.be.model.entity.PcComponent;
import com.sba301.code.be.model.entity.component.*;
import com.sba301.code.be.repository.PcComponentRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ComponentServiceImpl implements ComponentService {
    private final PcComponentRepository pcComponentRepository;

    @Override
    public Map<String, Object> searchComponents(Map<String, String> params, int page, int size) {
        // --- 1. PARSE CÁC THAM SỐ CHUNG TỪ MAP ---
        String type = params.get("type");
        String subType = params.get("subType"); // Dành riêng cho Storage (SSD/HDD)
        String keyword = params.get("keyword");
        String brand = params.get("brand");

        Double minPrice = null;
        Double maxPrice = null;
        try {
            if (params.containsKey("minPrice")) minPrice = Double.parseDouble(params.get("minPrice"));
            if (params.containsKey("maxPrice")) maxPrice = Double.parseDouble(params.get("maxPrice"));
        } catch (NumberFormatException ignored) {}

        // Lấy toàn bộ dữ liệu (Nếu DB lớn, sau này chuyển sang dùng JPA Specification)
        List<PcComponent> allComponents = pcComponentRepository.findAll();

        // --- 2. LOGIC LỌC DỮ LIỆU (FILTERING) ---
        Double finalMinPrice = minPrice;
        Double finalMaxPrice = maxPrice;
        List<Map<String, Object>> filteredList = allComponents.stream()
                .filter(comp -> {
                    // ==========================================
                    // A. BỘ LỌC CHUNG (Áp dụng cho mọi Product)
                    // ==========================================

                    // Lọc theo Type (Tên Class: Cpu, Ram, Storage...)
                    if (type != null && !type.trim().isEmpty() && !comp.getClass().getSimpleName().equalsIgnoreCase(type)) {
                        return false;
                    }

                    // Lọc theo Keyword (Tìm trong tên sản phẩm)
                    if (keyword != null && !keyword.trim().isEmpty() && !comp.getName().toLowerCase().contains(keyword.toLowerCase())) {
                        return false;
                    }

                    // Lọc theo Thương hiệu (Brand nằm ở class cha Product)
                    if (brand != null && !brand.trim().isEmpty()) {
                        if (comp.getManufacturer() == null || !comp.getManufacturer().equalsIgnoreCase(brand)) return false;
                    }

                    // Lọc theo Khoảng Giá
                    double price = comp.getPrice() != null ? comp.getPrice().doubleValue() : 0.0;
                    if (finalMinPrice != null && price < finalMinPrice) return false;
                    if (finalMaxPrice != null && price > finalMaxPrice) return false;

                    // ==========================================
                    // B. BỘ LỌC KỸ THUẬT (Tùy theo loại linh kiện)
                    // ==========================================

                    // 1. STORAGE (Ổ Cứng)
                    if (comp instanceof Storage storage) {
                        // Lọc chuẩn SSD hoặc HDD (Từ tham số subType của FE gửi lên)
                        if (subType != null && !subType.trim().isEmpty() && !storage.getType().equalsIgnoreCase(subType)) return false;

                        // Lọc theo dung lượng (Ví dụ: 500GB, 1TB)
                        String capacity = params.get("capacity");
                        if (capacity != null && !capacity.trim().isEmpty() && !storage.getCapacity().equals(capacity)) return false;
                    }

                    // 2. CPU (Vi xử lý)
                    if (comp instanceof Cpu cpu) {
                        String socket = params.get("socket");
                        if (socket != null && !socket.trim().isEmpty() && !cpu.getSocket().equalsIgnoreCase(socket)) return false;

                        String coreCountStr = params.get("coreCount");
                        if (coreCountStr != null && !coreCountStr.trim().isEmpty()) {
                            try {
                                if (!cpu.getCores().equals(Integer.parseInt(coreCountStr))) return false;
                            } catch (NumberFormatException ignored) {}
                        }
                    }

                    // 3. MAINBOARD (Bo mạch chủ)
                    if (comp instanceof Mainboard mainboard) {
                        String socket = params.get("socket");
                        if (socket != null && !socket.trim().isEmpty() && !mainboard.getSocket().equalsIgnoreCase(socket)) return false;

                        String chipset = params.get("chipset");
                        if (chipset != null && !chipset.trim().isEmpty() && !mainboard.getChipset().equalsIgnoreCase(chipset)) return false;

                        String formFactor = params.get("formFactor");
                        if (formFactor != null && !formFactor.trim().isEmpty() && !mainboard.getFormFactor().equalsIgnoreCase(formFactor)) return false;
                    }

                    // 4. RAM (Bộ nhớ trong)
                    if (comp instanceof Ram ram) {
                        String ramType = params.get("ramType"); // Tránh trùng tên với biến 'type' ở trên
                        if (ramType != null && !ramType.trim().isEmpty() && !ram.getType().equalsIgnoreCase(ramType)) return false;

                        String capacity = params.get("capacity");
                        if (capacity != null && !capacity.trim().isEmpty() && !ram.getCapacity().equals(capacity)) return false;

                        String speed = params.get("speed");
                        if (speed != null && !speed.trim().isEmpty() && !ram.getBusSpeed().equals(speed)) return false;
                    }

                    // 5. GPU (Card màn hình)
                    if (comp instanceof Gpu gpu) {
                        String vramCapacity = params.get("vramCapacity");
                        if (vramCapacity != null && !vramCapacity.trim().isEmpty() && !gpu.getVram().equals(vramCapacity)) return false;
                    }

                    // 6. PSU (Nguồn)
                    if (comp instanceof Psu psu) {
                        String wattageStr = params.get("wattage");
                        if (wattageStr != null && !wattageStr.trim().isEmpty()) {
                            try {
                                if (!psu.getWattage().equals(Integer.parseInt(wattageStr))) return false;
                            } catch (NumberFormatException ignored) {}
                        }
                    }

                    return true; // Giữ lại linh kiện nếu qua được tất cả các bài test
                })
                .map(comp -> {
                    // --- 3. ĐÓNG GÓI DỮ LIỆU TRẢ VỀ FRONTEND ---
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("id", comp.getProductId());
                    dto.put("name", comp.getName());
                    dto.put("price", comp.getPrice() != null ? comp.getPrice().doubleValue() : 0.0);
                    dto.put("description", comp.getDescription() != null ? comp.getDescription() : "Chưa có mô tả");
                    dto.put("imageUrl", comp.getImageUrl()); // Map thêm ImageUrl từ class Product
                    dto.put("brand", comp.getManufacturer());       // Map thêm Brand
                    dto.put("type", comp.getClass().getSimpleName());

                    // (Tùy chọn) Gộp Specs vào để FE hiển thị ngắn gọn
//                    dto.put("specs", comp.getSpecs());

                    return dto;
                })
                .collect(Collectors.toList());

        // --- 4. LOGIC PHÂN TRANG (PAGINATION) ---
        int totalElements = filteredList.size();
        int totalPages = (int) Math.ceil((double) totalElements / (size > 0 ? size : 1));

        List<Map<String, Object>> pagedContent = filteredList.stream()
                .skip((long) page * size)
                .limit(size)
                .collect(Collectors.toList());

        // --- 5. TẠO RESPONSE BODY ---
        Map<String, Object> response = new HashMap<>();
        response.put("content", pagedContent);
        response.put("totalPages", totalPages);
        response.put("totalElements", totalElements);
        response.put("currentPage", page);

        return response;
    }
}