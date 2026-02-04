package com.sba301.code.be.config;

import com.sba301.code.be.model.entity.*;
import com.sba301.code.be.model.enums.OrderStatus;
import com.sba301.code.be.repository.*;
import net.datafaker.Faker;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Component
public class DataSeeder implements CommandLineRunner {

    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    private final Faker faker = new Faker();
    private final Random random = new Random();
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(AccountRepository accountRepository,
                      RoleRepository roleRepository,
                      CategoryRepository categoryRepository,
                      ProductRepository productRepository,
                      OrderRepository orderRepository, PasswordEncoder passwordEncoder) {
        this.accountRepository = accountRepository;
        this.roleRepository = roleRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
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
        List<Category> categories = seedCategories();

        // 4. Seed Products
        List<Product> products = seedProducts(categories);

        // 5. Seed Orders (Đơn hàng & Chi tiết đơn hàng)
        seedOrders(accounts, products);

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
            String device = faker.commerce().productName();
            p.setName(faker.computer().brand() + " " + device + " " + faker.number().digits(4));

            p.setDescription(faker.lorem().paragraph());

            // Dùng BigDecimal cho giá tiền
            p.setPrice(BigDecimal.valueOf(faker.number().numberBetween(1000000, 50000000)));

            p.setStockQuantity(faker.number().numberBetween(0, 100));
            p.setSerialNumber(faker.idNumber().valid());
//            p.setImageUrl("https://picsum.photos/200/300?random=" + i);

            // Random Category
            p.setCategory(categories.get(random.nextInt(categories.size())));

            products.add(p);
        }
        return productRepository.saveAll(products);
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
}