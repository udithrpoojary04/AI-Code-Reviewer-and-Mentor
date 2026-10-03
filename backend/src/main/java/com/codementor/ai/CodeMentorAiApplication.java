package com.codementor.ai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableJpaAuditing
@EnableAsync
public class CodeMentorAiApplication {

    public static void main(String[] args) {
        // Force IPv4 to prevent ConnectException if IPv6 routing is broken locally
        System.setProperty("java.net.preferIPv4Stack", "true");
        SpringApplication.run(CodeMentorAiApplication.class, args);
    }
}