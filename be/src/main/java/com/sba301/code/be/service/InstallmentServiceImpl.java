package com.sba301.code.be.service;

import com.sba301.code.be.model.entity.Installment;
import com.sba301.code.be.repository.InstallmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InstallmentServiceImpl implements InstallmentService{

    @Autowired
    private InstallmentRepository installmentRepository;

    @Override
    public List<Installment> getAllInstallments() {
        return installmentRepository.findAll();
    }

    @Override
    public Installment getInstallmentById(Long installmentId) {
        return installmentRepository.findById(installmentId).get();
    }

    @Override
    public Installment createInstallment(Installment installment) {
        return installmentRepository.save(installment);
    }

    @Override
    public Installment updateInstallment(Long installmentId, Installment installment) {
        return installmentRepository.save(installment);
    }

    @Override
    public void deleteInstallment(Long installmentId) {
        installmentRepository.deleteById(installmentId);
    }
}
