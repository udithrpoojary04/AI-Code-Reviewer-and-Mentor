package com.codementor.ai.controller;

import com.codementor.ai.client.GroqClient;
import com.codementor.ai.dto.ChatMessage;
import com.codementor.ai.dto.CodeUpdateMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
public class CollaborationController {

    private final SimpMessagingTemplate messagingTemplate;
    private final GroqClient groqClient;

    @MessageMapping("/collab/{roomId}/code")
    public void handleCodeUpdate(@DestinationVariable String roomId, @Payload CodeUpdateMessage message) {
        // Broadcast code update to all subscribers in the room
        messagingTemplate.convertAndSend("/topic/collab/" + roomId + "/code", message);
    }

    @MessageMapping("/collab/{roomId}/chat")
    public void handleChatMessage(@DestinationVariable String roomId, @Payload ChatMessage message) {
        message.setTimestamp(LocalDateTime.now());
        message.setAiResponse(false);
        
        // Broadcast the user's message
        messagingTemplate.convertAndSend("/topic/collab/" + roomId + "/chat", message);

        // Check if AI was tagged
        if (message.getContent() != null && message.getContent().contains("@AI")) {
            String prompt = "You are an AI Code Mentor participating in a real-time collaboration chat room. " +
                    "A user named " + message.getSenderName() + " asked: " + message.getContent() +
                    "\nProvide a helpful, concise response.";
            
            try {
                String aiResponseText = groqClient.generateContent(prompt);
                
                ChatMessage aiMessage = ChatMessage.builder()
                        .roomId(roomId)
                        .senderName("AI Mentor")
                        .content(aiResponseText)
                        .timestamp(LocalDateTime.now())
                        .isAiResponse(true)
                        .build();
                        
                // Broadcast AI response
                messagingTemplate.convertAndSend("/topic/collab/" + roomId + "/chat", aiMessage);
            } catch (Exception e) {
                // Log and optionally send an error message to chat
                System.err.println("Failed to get AI response: " + e.getMessage());
            }
        }
    }
}
