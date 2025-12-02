package com.pawsitivedrive.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadDir;

    public FileStorageService(@Value("${app.upload-dir:uploads}") String uploadDirProperty) throws IOException {
        this.uploadDir = Paths.get(uploadDirProperty).toAbsolutePath().normalize();
        Files.createDirectories(this.uploadDir);
    }

    public String store(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File must not be empty.");
        }

        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "upload" : file.getOriginalFilename());
        String extension = "";
        int extIndex = originalName.lastIndexOf('.');
        if (extIndex > -1) {
            extension = originalName.substring(extIndex);
        }

        String filename = UUID.randomUUID() + extension;
        Path target = uploadDir.resolve(filename);

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
        }

        return filename;
    }

    public String buildPublicUrl(String filename) {
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/")
                .path(filename)
                .toUriString();
    }

    public boolean deleteFile(String filename) {
        if (filename == null || filename.isEmpty()) {
            return false;
        }
        try {
            Path filePath = uploadDir.resolve(filename);
            return Files.deleteIfExists(filePath);
        } catch (IOException e) {
            System.err.println("Failed to delete file: " + filename + " - " + e.getMessage());
            return false;
        }
    }

    public boolean deleteFileByUrl(String url) {
        if (url == null || url.isEmpty()) {
            return false;
        }
        // Extract filename from URL (e.g., "http://localhost:8080/uploads/abc123.jpg" -> "abc123.jpg")
        String filename = url.substring(url.lastIndexOf('/') + 1);
        return deleteFile(filename);
    }

    public Path getUploadDir() {
        return uploadDir;
    }
}

