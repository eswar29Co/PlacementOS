package com.placementos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PlacementOsApplication {
    public static void main(String[] args) {
        SpringApplication.run(PlacementOsApplication.class, args);
        System.out.println("\n===========================================");
        System.out.println("🚀 PlacementOS is running!");
        System.out.println("===========================================");
        System.out.println("Application: http://localhost:8080");
        System.out.println("H2 Console:  http://localhost:8080/h2-console");
        System.out.println("===========================================\n");
    }
}
