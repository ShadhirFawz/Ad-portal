package com.marketplace.marketplace.user.mapper;

import com.marketplace.marketplace.auth.dto.response.UserResponse;
import com.marketplace.marketplace.user.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponse toResponse(User user);

}