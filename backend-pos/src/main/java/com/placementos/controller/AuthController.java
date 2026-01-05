package com.placementos.controller;

import com.placementos.model.User;
import com.placementos.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@Controller
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/")
    public String index(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user != null) {
            return "redirect:/dashboard";
        }
        return "redirect:/login";
    }
    
    @GetMapping("/login")
    public String loginPage(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user != null) {
            return "redirect:/dashboard";
        }
        return "login";
    }
    
    @PostMapping("/login")
    public String login(@RequestParam String email, HttpSession session, Model model) {
        Optional<User> userOpt = userService.findByEmail(email);
        
        if (userOpt.isPresent()) {
            session.setAttribute("user", userOpt.get());
            return "redirect:/dashboard";
        } else {
            model.addAttribute("error", "User not found. Please register first.");
            return "login";
        }
    }
    
    @GetMapping("/register")
    public String registerPage() {
        return "register";
    }
    
    @PostMapping("/register")
    public String register(
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String role,
            @RequestParam String college,
            HttpSession session,
            Model model) {
        
        Optional<User> existing = userService.findByEmail(email);
        if (existing.isPresent()) {
            model.addAttribute("error", "Email already registered");
            return "register";
        }
        
        User.Role userRole = User.Role.valueOf(role);
        User user = userService.createUser(name, email, userRole, college);
        session.setAttribute("user", user);
        
        return "redirect:/dashboard";
    }
    
    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/login";
    }
    
    @GetMapping("/dashboard")
    public String dashboard(HttpSession session, Model model) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return "redirect:/login";
        }
        
        model.addAttribute("user", user);
        
        if (user.getRole() == User.Role.ADMIN) {
            return "admin-dashboard";
        } else {
            return "student-dashboard";
        }
    }
}
