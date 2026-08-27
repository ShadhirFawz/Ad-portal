package com.marketplace.marketplace.common.exception;

import com.marketplace.marketplace.common.response.ApiResponse;
import com.marketplace.marketplace.common.response.ErrorResponse;
import com.marketplace.marketplace.common.response.FieldError;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<?> handleNotFound(ResourceNotFoundException ex) {

                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(new ErrorResponse(ex.getMessage(), null));
        }

        @ExceptionHandler(BadRequestException.class)
        public ResponseEntity<?> handleBadRequest(BadRequestException ex) {

                return ResponseEntity.badRequest()
                                .body(new ErrorResponse(ex.getMessage(), null));
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {

                BindingResult result = ex.getBindingResult();

                List<FieldError> errors = result
                                .getFieldErrors()
                                .stream()
                                .map(error -> new FieldError(
                                                error.getField(),
                                                error.getDefaultMessage()))
                                .toList();

                return ResponseEntity.badRequest()
                                .body(new ErrorResponse("Validation Failed", errors));
        }

        @ExceptionHandler(ConflictException.class)
        public ResponseEntity<?> handleConflict(ConflictException ex) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(new ErrorResponse(ex.getMessage(), null));
        }

        @ExceptionHandler(AuthenticationException.class)
        public ResponseEntity<ApiResponse<Void>> handleAuthenticationException(
                        AuthenticationException ex) {

                return ResponseEntity
                                .status(HttpStatus.UNAUTHORIZED)
                                .body(
                                                ApiResponse.error(
                                                                ex.getMessage()));
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
                log.error("Unhandled exception: ", ex);
                return ResponseEntity
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(ApiResponse.error(ex.getMessage() != null ? ex.getMessage() : "An unexpected error occurred."));
        }

}