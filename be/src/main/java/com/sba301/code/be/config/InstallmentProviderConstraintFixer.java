package com.sba301.code.be.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class InstallmentProviderConstraintFixer implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        // Fix legacy auto-generated CHECK constraints that do not include MOMO.
        List<String> constraintNames = jdbcTemplate.query(
                """
                        SELECT cc.name
                        FROM sys.check_constraints cc
                        JOIN sys.objects o ON cc.parent_object_id = o.object_id
                        JOIN sys.columns c ON c.object_id = o.object_id
                        WHERE o.name = 'purchase_order'
                          AND c.name = 'installment_provider'
                          AND cc.definition LIKE '%installment_provider%'
                        """,
                (rs, rowNum) -> rs.getString(1));

        for (String name : constraintNames) {
            jdbcTemplate.execute("ALTER TABLE purchase_order DROP CONSTRAINT [" + name + "]");
        }

        Integer existing = jdbcTemplate.queryForObject(
                "SELECT COUNT(1) FROM sys.check_constraints WHERE name = 'CK_purchase_order_installment_provider_momo'",
                Integer.class);

        if (existing != null && existing == 0) {
            jdbcTemplate.execute(
                    "ALTER TABLE purchase_order " +
                            "ADD CONSTRAINT CK_purchase_order_installment_provider_momo " +
                            "CHECK (installment_provider IS NULL OR installment_provider = 'MOMO')");
        }
    }
}
