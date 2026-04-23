package com.water.water_system.config;

import com.water.water_system.entity.Tenant;
import com.water.water_system.repository.TenantRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Arrays;
import java.util.List;

@Configuration
public class DataInitializer {

    @Autowired
    private TenantRepository tenantRepository;

    @Bean
    CommandLineRunner initData() {
        return args -> {
            if (tenantRepository.count() == 0) {
                List<Tenant> tenants = Arrays.asList(
                    createTenant("John Mbah", "0700000001"),
                    createTenant("Sarah Chen", "0700000002"),
                    createTenant("Michael Okonkwo", "0700000003"),
                    createTenant("Emily Wong", "0700000004"),
                    createTenant("David Kimani", "0700000005"),
                    createTenant("Grace Mwangi", "0700000006"),
                    createTenant("Robert Singh", "0700000007"),
                    createTenant("Anna Ochieng", "0700000008"),
                    createTenant("James Tutu", "0700000009"),
                    createTenant("Maria Hassan", "0700000010")
                );
                tenantRepository.saveAll(tenants);
            }
        };
    }

    private Tenant createTenant(String name, String phone) {
        Tenant t = new Tenant();
        t.setName(name);
        t.setPhone(phone);
        return t;
    }
}