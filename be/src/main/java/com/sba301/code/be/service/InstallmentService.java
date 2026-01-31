package com.sba301.code.be.service;

import com.sba301.code.be.model.entity.Installment;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface InstallmentService {
    public List<Installment> getAllInstallments();
    public Installment getInstallmentById(Long installmentId);
    public Installment createInstallment(Installment installment);
    public Installment updateInstallment(Long installmentId, Installment installment);
    public void deleteInstallment(Long installmentId);
}
