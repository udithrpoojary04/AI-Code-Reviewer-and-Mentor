package com.codementor.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodeUpdateMessage {
    private String roomId;
    private String content; // The actual code
    private String language;
    private String senderId;
}
