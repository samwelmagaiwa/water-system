package com.water.water_system.mapper;

import com.water.water_system.dto.TenantDTO;
import com.water.water_system.entity.Tenant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface TenantMapper {
    TenantMapper INSTANCE = Mappers.getMapper(TenantMapper.class);

    Tenant toEntity(TenantDTO tenantDTO);
    
    TenantDTO toDto(Tenant tenant);
}