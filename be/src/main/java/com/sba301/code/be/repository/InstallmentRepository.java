package com.sba301.code.be.repository;

import com.sba301.code.be.model.entity.Installment;
import com.sba301.code.be.model.enums.InstallmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

@Repository
public interface InstallmentRepository extends JpaRepository<Installment, Long> {

    List<Installment> findByOrder_OrderId(Long orderId);

    List<Installment> findByOrder_Account_AccountId(Long accountId);

    /** For overdue detection: installments still PENDING but past due date */
    List<Installment> findByInstallmentStatusAndDueDateBefore(InstallmentStatus status, LocalDate date);

    List<Installment> findByInstallmentStatusInAndDueDateBefore(Collection<InstallmentStatus> statuses, LocalDate date);

    long countByOrder_OrderIdAndInstallmentStatusNot(Long orderId, InstallmentStatus status);

    List<Installment> findByInstallmentStatus(InstallmentStatus status);
}
