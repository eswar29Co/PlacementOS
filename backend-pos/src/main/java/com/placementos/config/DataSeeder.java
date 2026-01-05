package com.placementos.config;

import com.placementos.model.*;
import com.placementos.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDate;

@Component
public class DataSeeder implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JobRepository jobRepository;
    
    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedJobs();
        System.out.println("✅ Sample data seeded successfully!");
    }
    
    private void seedUsers() {
        if (userRepository.count() == 0) {
            // Create sample students
            userRepository.save(new User(
                "Rahul Kumar",
                "rahul@example.com",
                User.Role.STUDENT,
                "IIT Delhi"
            ));
            
            userRepository.save(new User(
                "Priya Sharma",
                "priya@example.com",
                User.Role.STUDENT,
                "NIT Trichy"
            ));
            
            // Create admin
            userRepository.save(new User(
                "Admin User",
                "admin@placementos.com",
                User.Role.ADMIN,
                "PlacementOS"
            ));
            
            System.out.println("👥 Users seeded");
        }
    }
    
    private void seedJobs() {
        if (jobRepository.count() == 0) {
            jobRepository.save(new Job(
                "Software Developer - Java",
                "Backend Developer",
                "Product Startup",
                8.0,
                12.0,
                "B.Tech in CS/IT, Strong Java skills, Knowledge of Spring Boot",
                LocalDate.now().plusDays(30)
            ));
            
            jobRepository.save(new Job(
                "Frontend Developer - React",
                "Frontend Developer",
                "Service Company",
                6.0,
                10.0,
                "B.Tech/MCA, Experience with React, HTML, CSS, JavaScript",
                LocalDate.now().plusDays(25)
            ));
            
            jobRepository.save(new Job(
                "Data Analyst",
                "Analytics",
                "E-commerce",
                7.0,
                11.0,
                "Strong SQL skills, Python/R knowledge, Statistics background",
                LocalDate.now().plusDays(20)
            ));
            
            jobRepository.save(new Job(
                "Full Stack Developer",
                "Full Stack",
                "Tech Startup",
                10.0,
                15.0,
                "Experience with Java/Node.js backend and React/Angular frontend",
                LocalDate.now().plusDays(15)
            ));
            
            jobRepository.save(new Job(
                "DevOps Engineer",
                "DevOps",
                "Cloud Company",
                12.0,
                18.0,
                "AWS/Azure experience, Docker, Kubernetes, CI/CD pipelines",
                LocalDate.now().plusDays(10)
            ));
            
            System.out.println("💼 Jobs seeded");
        }
    }
}
