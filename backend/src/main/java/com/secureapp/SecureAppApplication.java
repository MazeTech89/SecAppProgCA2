

package com.secureapp;

// Import Spring Boot core classes
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Main application class for Spring Boot
@SpringBootApplication // Marks this as a Spring Boot application
public class SecureAppApplication {
    // Entry point for the backend application
    public static void main(String[] args) {
        SpringApplication.run(SecureAppApplication.class, args); // Start Spring Boot
    }
}
