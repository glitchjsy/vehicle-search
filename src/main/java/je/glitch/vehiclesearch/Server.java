package je.glitch.vehiclesearch;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import io.javalin.Javalin;
import io.javalin.json.JsonMapper;
import je.glitch.vehiclesearch.controllers.ApiController;
import org.jetbrains.annotations.NotNull;

import java.io.IOException;
import java.lang.reflect.Type;

public class Server {
    public static final Gson GSON = new GsonBuilder()
            .setPrettyPrinting()
            .serializeNulls()
            .create();

    private final ApiController apiController;

    public Server() {
        this.apiController = new ApiController();
    }

    public static void main(String[] args) {
        try {
            Utils.unpackResources();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        new Server().init();
    }

    public void init() {
        JsonMapper gsonMapper = new JsonMapper() {
            @Override
            public String toJsonString(@NotNull Object obj, @NotNull Type type) {
                return GSON.toJson(obj, type);
            }

            @Override
            public <T> T fromJsonString(@NotNull String json, @NotNull Type targetType) {
                return GSON.fromJson(json, targetType);
            }

        };
        Javalin app = Javalin.create(servlet -> {
            servlet.staticFiles.add("/app");
            servlet.spaRoot.addFile("/", "/app/index.html");
            servlet.jsonMapper(gsonMapper);

            servlet.bundledPlugins.enableCors(cors -> {
                cors.addRule(it -> {
                    it.anyHost();
                });
            });
        }).start(8034);

        app.get("/api/{plate}", apiController::handleGetPlate);
        app.post("/api/upload", apiController::handleUploadImage);
    }
}
