package com.water.water_system.mapper;

import com.water.water_system.dto.PaymentDTO;
import com.water.water_system.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface PaymentMapper {
    PaymentMapper INSTANCE = Mappers.getMapper(PaymentMapper.class);

    Payment toEntity(PaymentDTO paymentDTO);
    
    PaymentDTO toDto(Payment payment);
}