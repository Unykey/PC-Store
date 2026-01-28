package com.sba301.code.be.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Table(name = "account_tbl")
@Data
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer accountId;

    @Column(nullable = false, length = 20)
    private String accountName;

    @Column(unique = true, nullable = false, length = 20)
    private String email;

    @Column(nullable = false, length = 50)
    private String password;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;

    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Order> orders;
}
