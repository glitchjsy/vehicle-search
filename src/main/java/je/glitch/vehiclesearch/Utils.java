package je.glitch.vehiclesearch;

import java.io.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public class Utils {

    public static HttpResponse<String> sendRequest(HttpClient client, String url, String method, String body) throws IOException, InterruptedException {
        return sendRequest(client, url, method, body, null);
    }

    public static HttpResponse<String> sendRequest(HttpClient client, String url, String method, String body, String cookies) throws IOException, InterruptedException {
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7")
                .header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36");

        if (cookies != null) {
            requestBuilder.header("Cookie", cookies);
        }

        if (method.equalsIgnoreCase("POST") && body != null) {
            requestBuilder.header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(body));
        } else {
            requestBuilder.GET();
        }

        return client.send(requestBuilder.build(), HttpResponse.BodyHandlers.ofString());
    }

    public static void unpackResources() throws IOException {
        extractResource("openalpr.conf");
        extractResource("runtime_data.zip");
    }

    public static void extractResource(String resourceName) throws IOException {
        Path currentDir = Paths.get("").toAbsolutePath();
        Path targetFile = currentDir.resolve(resourceName);

        try (InputStream resourceStream = VehicleInfoParser.class.getResourceAsStream("/" + resourceName)) {
            if (resourceStream == null) {
                throw new FileNotFoundException("Resource not found: " + resourceName);
            }
            Files.copy(resourceStream, targetFile, StandardCopyOption.REPLACE_EXISTING);
        }

        if (resourceName.endsWith(".zip")) {
            Path outputDir = currentDir.resolve(resourceName.replaceFirst("\\.zip$", ""));
            Files.createDirectories(outputDir);

            try (ZipInputStream zipStream = new ZipInputStream(Files.newInputStream(targetFile))) {
                ZipEntry entry;
                while ((entry = zipStream.getNextEntry()) != null) {
                    Path entryPath = outputDir.resolve(entry.getName());

                    if (entry.isDirectory()) {
                        Files.createDirectories(entryPath);
                    } else {
                        Files.createDirectories(entryPath.getParent());
                        try (OutputStream out = Files.newOutputStream(entryPath)) {
                            zipStream.transferTo(out);
                        }
                    }
                    zipStream.closeEntry();
                }
            }
            Files.delete(targetFile);
        }
    }
}
