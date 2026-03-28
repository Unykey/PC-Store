package com.sba301.code.be.config;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class InstallmentProviderConstraintFixer implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;
    private static final Logger log = LoggerFactory.getLogger(InstallmentProviderConstraintFixer.class);

    @Override
    public void run(ApplicationArguments args) {
        // Fix legacy auto-generated CHECK constraints that do not include MOMO.
        // PostgreSQL: use pg_constraint / pg_class and pg_get_constraintdef to find check constraints
        List<String> constraintNames = jdbcTemplate.query(
                """
                        SELECT con.conname
                        FROM pg_constraint con
                        JOIN pg_class rel ON rel.oid = con.conrelid
                        WHERE rel.relname = 'purchase_order'
                          AND con.contype = 'c'
                          AND pg_get_constraintdef(con.oid) LIKE '%installment_provider%'
                        """,
                (rs, rowNum) -> rs.getString(1));

        for (String name : constraintNames) {
            if (name == null) continue;
            // Sanitize: allow only typical constraint identifier chars to avoid SQL injection.
            if (!name.matches("[A-Za-z0-9_]+")) {
                log.warn("Skipping unexpected constraint name '{}'; does not match allowed pattern", name);
                continue;
            }
            // PostgreSQL DROP CONSTRAINT uses plain identifier (no square brackets). Quote the identifier safely.
            String safeName = name.replace("\"", "\"\"");
            jdbcTemplate.execute("ALTER TABLE purchase_order DROP CONSTRAINT \"" + safeName + "\"");
            log.info("Dropped constraint {} on purchase_order", name);
        }

        Integer existing = jdbcTemplate.queryForObject(
                "SELECT COUNT(1) FROM pg_constraint con JOIN pg_class rel ON rel.oid = con.conrelid WHERE rel.relname = 'purchase_order' AND lower(con.conname) = 'ck_purchase_order_installment_provider_momo'",
                Integer.class);

        if (existing != null && existing == 0) {
            jdbcTemplate.execute(
                    "ALTER TABLE purchase_order " +
                            "ADD CONSTRAINT ck_purchase_order_installment_provider_momo " +
                            "CHECK (installment_provider IS NULL OR installment_provider = 'MOMO')");
            log.info("Added constraint ck_purchase_order_installment_provider_momo to purchase_order");
        }
    }
}
