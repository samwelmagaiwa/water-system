package com.water.water_system.mapper;

import com.water.water_system.dto.BillRequestDTO;
import com.water.water_system.entity.Bill;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface BillMapper {
    BillMapper INSTANCE = Mappers.getMapper(BillMapper.class);

    Bill toEntity(BillRequestDTO billRequestDTO);

    BillRequestDTO toDto(Bill bill);
}