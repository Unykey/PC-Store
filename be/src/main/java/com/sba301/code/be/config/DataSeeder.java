package com.sba301.code.be.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sba301.code.be.model.entity.*;
import com.sba301.code.be.model.entity.component.*;
import com.sba301.code.be.model.enums.OrderStatus;
import com.sba301.code.be.repository.*;
import com.sba301.code.be.repository.component.*;
import lombok.RequiredArgsConstructor;
import net.datafaker.Faker;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.http.converter.autoconfigure.ClientHttpMessageConvertersCustomizer;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductSpecificationRepository productSpecificationRepository;
    private final OrderRepository orderRepository;

    // PC Components
    private final CpuRepository cpuRepository;
    private final GpuRepository gpuRepository;
    private final MainboardRepository mainboardRepository;
    private final RamRepository ramRepository;
    private final PcCaseRepository pcCaseRepository;
    private final PsuRepository psuRepository;
    private final StorageRepository storageRepository;
    private final CoolerRepository coolerRepository;

    // Jackson Mapper để đọc JSON
//    private final ObjectMapper objectMapper;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final Faker faker = new Faker();
    private final Random random = new Random();
    private final PasswordEncoder passwordEncoder;
    private final ClientHttpMessageConvertersCustomizer clientConvertersCustomizer;

    public DataSeeder(AccountRepository accountRepository,
                      RoleRepository roleRepository,
                      CategoryRepository categoryRepository,
                      ProductRepository productRepository,
                      ProductSpecificationRepository productSpecificationRepository,
                      OrderRepository orderRepository, PasswordEncoder passwordEncoder) {
        this.accountRepository = accountRepository;
        this.roleRepository = roleRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.productSpecificationRepository = productSpecificationRepository;
        this.orderRepository = orderRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Kiểm tra nếu DB đã có dữ liệu thì không seed nữa
        if (roleRepository.count() > 0) {
            return;
        }

        System.out.println("🌱 Starting Data Seeding...");

        // 1. Seed Roles
        List<Role> roles = seedRoles();

        // 2. Seed Accounts (Users)
        List<Account> accounts = seedAccounts(roles);

        // 3. Seed Categories
//        List<Category> categories = seedCategories();
        seedCategories2();

        // 3.1 Seed PC Components (CPU, GPU, Mainboard, etc)
        seedCpus();
        seedGpus();
        seedMainboards();
        seedRams();
        seedPcCases();
        seedPsus();
        seedStrorages();
        seedCooler();

        // 4. Seed Products
//        List<Product> products = seedProducts(categories);

        // 5. Seed Orders (Đơn hàng & Chi tiết đơn hàng)
//        seedOrders(accounts, products);

        System.out.println("✅ Data Seeding Completed!");
    }

    private List<Role> seedRoles() {
        Role admin = new Role();
        admin.setRoleName("ADMIN");

        Role staff = new Role();
        staff.setRoleName("STAFF");

        Role customer = new Role();
        customer.setRoleName("CUSTOMER");

        return roleRepository.saveAll(Arrays.asList(admin, staff, customer));
    }

    private List<Account> seedAccounts(List<Role> roles) {
        List<Account> accounts = new ArrayList<>();

        // Tìm role theo tên (giả định role list đã có đủ)
        Role customerRole = roles.stream().filter(r -> "CUSTOMER".equals(r.getRoleName())).findFirst().orElseThrow();
        Role adminRole = roles.stream().filter(r -> "ADMIN".equals(r.getRoleName())).findFirst().orElseThrow();

        // Tạo 1 Admin cứng để test
        Account admin = new Account();
        admin.setFullName("admin");
        admin.setEmail("admin@pcstore.com");
        admin.setPhoneNumber("0987654321");
        admin.setPassword(passwordEncoder.encode("admin123")); // Lưu ý: Thực tế cần mã hóa BCrypt
        admin.setRole(adminRole);
        accounts.add(admin);

        // Tạo 20 User ngẫu nhiên
        for (int i = 0; i < 20; i++) {
            Account acc = new Account();
            String rawName = faker.name().fullName();
            acc.setFullName(rawName);
            acc.setEmail(faker.internet().emailAddress());

            // Generate a valid Vietnamese phone number
            String[] validPrefixes = {"03", "05", "07", "08", "09"}; // Mobile phone prefixes
            String prefix = validPrefixes[faker.number().numberBetween(0, validPrefixes.length)];
            String phoneNumber = prefix + faker.number().digits(9); // Add 9 random digits after the prefix

            acc.setPhoneNumber(phoneNumber);
            acc.setPassword(passwordEncoder.encode("123456")); // Password mặc định
            acc.setRole(customerRole);
            accounts.add(acc);
        }

        return accountRepository.saveAll(accounts);
    }

    private List<Category> seedCategories() {
        List<String> cateNames = Arrays.asList("CPU", "GPU", "Mainboard", "RAM", "SSD", "Case", "PSU", "Monitor");
        List<Category> categories = new ArrayList<>();

        for (String name : cateNames) {
            Category category = new Category();
            category.setName(name);
            category.setDescription(faker.lorem().sentence());
            // category.setSlug(name.toLowerCase()); // Nếu bạn có trường slug
            categories.add(category);
        }
        return categoryRepository.saveAll(categories);
    }

    private List<Product> seedProducts(List<Category> categories) {
        List<Product> products = new ArrayList<>();

        for (int i = 0; i < 50; i++) {
            Product p = new Product();

            p.setName(faker.computer().brand() + " " + faker.commerce().productName() + " " + i);
            p.setDescription(faker.lorem().paragraph());
            p.setPrice(BigDecimal.valueOf(faker.number().numberBetween(1000000, 50000000)));
            p.setStockQuantity(faker.number().numberBetween(0, 100));
            p.setSerialNumber("SN-" + UUID.randomUUID());
            p.setCategory(categories.get(random.nextInt(categories.size())));

            Map<String, String> imageMap = Map.of(
                    "CPU", "/images/cpu.jpg",
                    "GPU", "/images/gpu.jpg",
                    "RAM", "/images/ram.jpg",
                    "SSD", "/images/ssd.jpg",
                    "Mainboard", "/images/mainboard.jpg",
                    "PSU", "/images/psu.jpg",
                    "Case", "/images/case.jpg",
                    "Monitor", "/images/monitor.jpg"
            );

            String cateName = p.getCategory().getName();
            p.setImage(imageMap.getOrDefault(cateName, "/images/default.jpg"));

            List<ProductSpecification> specs = new ArrayList<>();

            if ("CPU".equalsIgnoreCase(cateName)) {
                specs.add(createSpec("Cores", faker.number().numberBetween(4, 16) + "", p));
                specs.add(createSpec("Threads", faker.number().numberBetween(8, 32) + "", p));
                specs.add(createSpec("Base Clock", faker.number().numberBetween(2, 5) + " GHz", p));

            } else if ("GPU".equalsIgnoreCase(cateName)) {
                specs.add(createSpec("VRAM", faker.options().option("6GB", "8GB", "12GB", "16GB"), p));
                specs.add(createSpec("Bus", faker.options().option("128-bit", "192-bit", "256-bit"), p));
                specs.add(createSpec("Power", faker.number().numberBetween(100, 350) + "W", p));

            } else if ("RAM".equalsIgnoreCase(cateName)) {
                specs.add(createSpec("Capacity", faker.options().option("8GB", "16GB", "32GB"), p));
                specs.add(createSpec("Type", faker.options().option("DDR4", "DDR5"), p));
                specs.add(createSpec("Speed", faker.number().numberBetween(2400, 6000) + " MHz", p));

            } else if ("SSD".equalsIgnoreCase(cateName)) {
                specs.add(createSpec("Capacity", faker.options().option("256GB", "512GB", "1TB", "2TB"), p));
                specs.add(createSpec("Type", faker.options().option("SATA", "NVMe"), p));
                specs.add(createSpec("Read Speed", faker.number().numberBetween(500, 7000) + " MB/s", p));

            } else if ("Mainboard".equalsIgnoreCase(cateName)) {
                specs.add(createSpec("Chipset", faker.options().option("B660", "Z690", "B550", "X570"), p));
                specs.add(createSpec("Socket", faker.options().option("LGA1700", "AM4", "AM5"), p));
                specs.add(createSpec("Form Factor", faker.options().option("ATX", "Micro-ATX", "Mini-ITX"), p));

            } else if ("PSU".equalsIgnoreCase(cateName)) {
                specs.add(createSpec("Wattage", faker.number().numberBetween(400, 1000) + "W", p));
                specs.add(createSpec("Efficiency", faker.options().option("80+ Bronze", "80+ Gold", "80+ Platinum"), p));
                specs.add(createSpec("Modular", faker.options().option("Full", "Semi", "Non"), p));

            } else if ("Case".equalsIgnoreCase(cateName)) {
                specs.add(createSpec("Form Factor", faker.options().option("ATX", "Micro-ATX", "Mini-ITX"), p));
                specs.add(createSpec("Material", faker.options().option("Steel", "Aluminum", "Tempered Glass"), p));
                specs.add(createSpec("Fan Support", faker.number().numberBetween(2, 10) + " fans", p));

            } else if ("Monitor".equalsIgnoreCase(cateName)) {
                specs.add(createSpec("Size", faker.number().numberBetween(21, 34) + " inch", p));
                specs.add(createSpec("Resolution", faker.options().option("Full HD", "2K", "4K"), p));
                specs.add(createSpec("Refresh Rate", faker.options().option("60Hz", "75Hz", "144Hz", "165Hz"), p));

            } else {
                int specCount = random.nextInt(3) + 2;
                for (int j = 0; j < specCount; j++) {
                    specs.add(createSpec(
                            faker.commerce().material(),
                            faker.commerce().productName(),
                            p
                    ));
                }
            }

            p.setSpecifications(specs);
            products.add(p);
        }

        return productRepository.saveAll(products);
    }

    private ProductSpecification createSpec(String key, String value, Product product) {
        ProductSpecification spec = new ProductSpecification();
        spec.setSpecKey(key);
        spec.setSpecValue(value);
        spec.setProduct(product);
        return spec;
    }

    private void seedOrders(List<Account> accounts, List<Product> products) {
        List<Order> orders = new ArrayList<>();

        // Tạo 30 đơn hàng ngẫu nhiên
        for (int i = 0; i < 30; i++) {
            Order order = new Order();

            // Random User
            Account user = accounts.get(random.nextInt(accounts.size()));
            order.setAccount(user);

            order.setOrderDate(LocalDateTime.now().minusDays(random.nextInt(30)));

            // Random Status từ Enum
            OrderStatus[] statuses = OrderStatus.values();
            order.setOrderStatus(statuses[random.nextInt(statuses.length)]);

            // Tạo Set OrderDetail
            Set<OrderDetail> details = new HashSet<>();
            BigDecimal total = BigDecimal.ZERO;

            // Mỗi đơn mua 1-3 sản phẩm
            int itemCount = random.nextInt(3) + 1;

            for (int j = 0; j < itemCount; j++) {
                Product product = products.get(random.nextInt(products.size()));

                OrderDetail detail = new OrderDetail();
                detail.setOrder(order); // Quan trọng: Link ngược lại Order
                detail.setProduct(product);
                detail.setQuantity(random.nextInt(2) + 1); // 1 hoặc 2 cái

                // Lấy giá tại thời điểm mua
                detail.setPriceAtPurchase(product.getPrice());

                // Cộng dồn tổng tiền: total = total + (price * quantity)
                BigDecimal itemTotal = detail.getPriceAtPurchase().multiply(BigDecimal.valueOf(detail.getQuantity()));
                total = total.add(itemTotal);

                details.add(detail);
            }

            order.setTotalAmount(total);
            order.setOrderDetails(details); // Set danh sách chi tiết vào Order

            orders.add(order);
        }

        // Save Order sẽ tự động Cascade save luôn OrderDetail (vì CascadeType.ALL)
        orderRepository.saveAll(orders);
    }

    private void seedCategories2() {
        if (categoryRepository.count() == 0) {
            try {
                // 1. Lấy luồng dữ liệu file JSON
                InputStream inputStream = TypeReference.class.getResourceAsStream("/data/categories.json");

                // 2. Bọc lại bằng Reader để ép chuẩn UTF-8 (Đảm bảo Tiếng Việt hiển thị đúng)
                InputStreamReader reader = new InputStreamReader(inputStream, StandardCharsets.UTF_8);
                Category[] categoryArray = objectMapper.readValue(reader, Category[].class);
                categoryRepository.saveAll(List.of(categoryArray));
                System.out.println("✅ Seeded Categories successfully!");
            } catch (IOException e) {
                System.err.println("❌ Failed to seed Categories: " + e.getMessage());
            }
        }
    }

    private void seedCpus() {
        if (cpuRepository.count() == 0) {
            try {
                InputStream inputStream = TypeReference.class.getResourceAsStream("/data/cpus.json");
                InputStreamReader reader = new InputStreamReader(inputStream, StandardCharsets.UTF_8);
                Cpu[] cpuArray = objectMapper.readValue(reader, Cpu[].class);
                List<Cpu> cpus = List.of(cpuArray);

                // Lấy Category CPU từ DB để gán vào
                Category cpuCategory = categoryRepository.findByName("CPU")
                        .orElseThrow(() -> new RuntimeException("Category CPU not found"));

                // Gán category cho từng sản phẩm
                cpus.forEach(cpu -> cpu.setCategory(cpuCategory));

                // Lưu vào DB
                cpuRepository.saveAll(cpus);
                System.out.println("✅ Seeded CPUs successfully!");
            } catch (IOException e) {
                System.err.println("❌ Failed to seed CPUs: " + e.getMessage());
            }
        }
    }

    private void seedGpus() {
        if (gpuRepository.count() == 0) {
            try {
                InputStream inputStream = TypeReference.class.getResourceAsStream("/data/gpus.json");
                InputStreamReader reader = new InputStreamReader(inputStream, StandardCharsets.UTF_8);
                Gpu[] gpuArray = objectMapper.readValue(reader, Gpu[].class);
                List<Gpu> gpus = List.of(gpuArray);

                Category gpuCategory = categoryRepository.findByName("VGA")
                        .orElseThrow(() -> new RuntimeException("Category VGA not found"));

                gpus.forEach(gpu -> gpu.setCategory(gpuCategory));

                gpuRepository.saveAll(gpus);
                System.out.println("✅ Seeded GPUs successfully!");
            } catch (IOException e) {
                System.err.println("❌ Failed to seed GPUs: " + e.getMessage());
            }
        }
    }

    private void seedMainboards() {
        if (mainboardRepository.count() == 0) {
            try {
                InputStream inputStream = TypeReference.class.getResourceAsStream("/data/mainboards.json");
                InputStreamReader reader = new InputStreamReader(inputStream, StandardCharsets.UTF_8);
                Mainboard[] mainboardArray = objectMapper.readValue(reader, Mainboard[].class);
                List<Mainboard> mainboards = List.of(mainboardArray);

                Category mainboCategory = categoryRepository.findByName("Mainboard")
                        .orElseThrow(() -> new RuntimeException("Category Mainboard not found"));

                mainboards.forEach(mainboard -> mainboard.setCategory(mainboCategory));

                mainboardRepository.saveAll(mainboards);
                System.out.println("✅ Seeded Mainboards successfully!");
            } catch (IOException e) {
                System.err.println("❌ Failed to seed Mainboards: " + e.getMessage());
            }
        }
    }

    private void seedRams() {
        if (ramRepository.count() == 0) {
            try {
                InputStream inputStream = TypeReference.class.getResourceAsStream("/data/rams.json");
                InputStreamReader reader = new InputStreamReader(inputStream, StandardCharsets.UTF_8);
                Ram[] ramArray = objectMapper.readValue(reader, Ram[].class);
                List<Ram> rams = List.of(ramArray);

                Category ramCategory = categoryRepository.findByName("RAM")
                        .orElseThrow(() -> new RuntimeException("Category RAM not found"));

                rams.forEach(ram -> ram.setCategory(ramCategory));

                ramRepository.saveAll(rams);
                System.out.println("✅ Seeded RAMs successfully!");
            } catch (IOException e) {
                System.err.println("❌ Failed to seed RAMs: " + e.getMessage());
            }
        }
    }

    private void seedPcCases() {
        if (pcCaseRepository.count() == 0) {
            try {
                InputStream inputStream = TypeReference.class.getResourceAsStream("/data/cases.json");
                InputStreamReader reader = new InputStreamReader(inputStream, StandardCharsets.UTF_8);
                PcCase[] pcCaseArray = objectMapper.readValue(reader, PcCase[].class);
                List<PcCase> pcCases = List.of(pcCaseArray);

                Category caseCategory = categoryRepository.findByName("Case")
                        .orElseThrow(() -> new RuntimeException("Category Case not found"));

                pcCases.forEach(pcCase -> pcCase.setCategory(caseCategory));

                pcCaseRepository.saveAll(pcCases);
                System.out.println("✅ Seeded PC Cases successfully!");
            } catch (IOException e) {
                System.err.println("❌ Failed to seed PC Cases: " + e.getMessage());
            }
        }
    }

    private void seedPsus() {
        if (psuRepository.count() == 0) {
            try {
                InputStream inputStream = TypeReference.class.getResourceAsStream("/data/psus.json");
                InputStreamReader reader = new InputStreamReader(inputStream, StandardCharsets.UTF_8);
                Psu[] psuArray = objectMapper.readValue(reader, Psu[].class);
                List<Psu> psus = List.of(psuArray);

                Category psuCategory = categoryRepository.findByName("PSU")
                        .orElseThrow(() -> new RuntimeException("Category PSU not found"));

                psus.forEach(psu -> psu.setCategory(psuCategory));

                psuRepository.saveAll(psus);
                System.out.println("✅ Seeded PSUs successfully!");
            } catch (IOException e) {
                System.err.println("❌ Failed to seed PSUs: " + e.getMessage());
            }
        }
    }

    private void seedStrorages() {
        if (storageRepository.count() == 0) {
            try {
                InputStream inputStream = TypeReference.class.getResourceAsStream("/data/storages.json");
                InputStreamReader reader = new InputStreamReader(inputStream, StandardCharsets.UTF_8);
                Storage[] storageArray = objectMapper.readValue(reader, Storage[].class);
                List<Storage> storages = List.of(storageArray);

                Category storageCategory = categoryRepository.findByName("Storage")
                        .orElseThrow(() -> new RuntimeException("Category Storage not found"));

                storages.forEach(storage -> storage.setCategory(storageCategory));

                storageRepository.saveAll(storages);
                System.out.println("✅ Seeded Storages successfully!");
            } catch (IOException e) {
                System.err.println("❌ Failed to seed Storages: " + e.getMessage());
            }
        }
    }

    private void seedCooler() {
        if (coolerRepository.count() == 0) {
            try {
                InputStream inputStream = TypeReference.class.getResourceAsStream("/data/coolers.json");
                InputStreamReader reader = new InputStreamReader(inputStream, StandardCharsets.UTF_8);
                Cooler[] coolerArray = objectMapper.readValue(reader, Cooler[].class);
                List<Cooler> coolers = List.of(coolerArray);

                Category coolerCategory = categoryRepository.findByName("Cooler")
                        .orElseThrow(() -> new RuntimeException("Category Cooler not found"));

                coolers.forEach(cooler -> cooler.setCategory(coolerCategory));

                coolerRepository.saveAll(coolers);
                System.out.println("✅ Seeded Cooler successfully!");
            } catch (IOException e) {
                System.err.println("❌ Failed to seed Cooler: " + e.getMessage());
            }
        }
    }


}