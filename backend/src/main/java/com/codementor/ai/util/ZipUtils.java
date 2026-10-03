package com.codementor.ai.util;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public class ZipUtils {

    public static Map<String, String> extractCodeFiles(byte[] zipBytes) throws IOException {
        Map<String, String> files = new HashMap<>();
        
        try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(zipBytes))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if (entry.isDirectory()) {
                    continue;
                }
                
                String fileName = entry.getName();
                
                if (isCodeFile(fileName)) {
                    ByteArrayOutputStream bos = new ByteArrayOutputStream();
                    byte[] buffer = new byte[1024];
                    int len;
                    while ((len = zis.read(buffer)) > 0) {
                        bos.write(buffer, 0, len);
                    }
                    files.put(fileName, bos.toString("UTF-8"));
                }
            }
        }
        return files;
    }

    private static boolean isCodeFile(String fileName) {
        String lowerCaseName = fileName.toLowerCase();
        
        // Exclude common binary and unwanted directories
        if (lowerCaseName.contains(".git/") || 
            lowerCaseName.contains("node_modules/") || 
            lowerCaseName.contains("target/") || 
            lowerCaseName.contains("build/") || 
            lowerCaseName.contains("dist/") || 
            lowerCaseName.contains(".idea/")) {
            return false;
        }

        // Allowed extensions (you can add more depending on what CodeMentor AI should review)
        return lowerCaseName.endsWith(".java") ||
               lowerCaseName.endsWith(".js") ||
               lowerCaseName.endsWith(".ts") ||
               lowerCaseName.endsWith(".jsx") ||
               lowerCaseName.endsWith(".tsx") ||
               lowerCaseName.endsWith(".py") ||
               lowerCaseName.endsWith(".go") ||
               lowerCaseName.endsWith(".rb") ||
               lowerCaseName.endsWith(".php") ||
               lowerCaseName.endsWith(".cs") ||
               lowerCaseName.endsWith(".cpp") ||
               lowerCaseName.endsWith(".h") ||
               lowerCaseName.endsWith(".css") ||
               lowerCaseName.endsWith(".html") ||
               lowerCaseName.endsWith(".xml") ||
               lowerCaseName.endsWith(".yml") ||
               lowerCaseName.endsWith(".yaml") ||
               lowerCaseName.endsWith(".json") ||
               lowerCaseName.endsWith(".md") ||
               lowerCaseName.endsWith(".sql");
    }
}
