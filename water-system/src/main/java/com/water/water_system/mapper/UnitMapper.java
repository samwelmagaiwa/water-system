package com.water.water_system.mapper;

import com.water.water_system.dto.UnitDTO;
import com.water.water_system.entity.Unit;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface UnitMapper {
    UnitMapper INSTANCE = Mappers.getMapper(UnitMapper.class);

    Unit toEntity(UnitDTO unitDTO);
    
    UnitDTO toDto(Unit unit);
}