package com.water.water_system.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tenants")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tenant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    @Column(unique = true)
    private String phone;
    
    @Enumerated(EnumType.STRING)
    private Role role = Role.TENANT;
    
    public enum Role {
        ADMIN,
        TENANT
    }
}
