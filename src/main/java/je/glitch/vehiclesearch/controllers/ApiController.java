package je.glitch.vehiclesearch.controllers;

import com.google.gson.JsonObject;
import io.javalin.http.Context;
import io.javalin.http.UploadedFile;
import je.glitch.vehiclesearch.VehicleInfoParser;
import je.glitch.vehiclesearch.models.ErrorResponse;
import je.glitch.vehiclesearch.models.VehicleData;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.io.InputStream;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.util.List;

@Slf4j
public class ApiController {

    public void handleGetPlate(Context ctx) {
        try {
            String plate = ctx.pathParam("plate");
            List<VehicleData> vehicleData = VehicleInfoParser.parseVehicleInfo(plate);
            JsonObject output = new JsonObject();

            if (vehicleData != null) {
                for (VehicleData data : vehicleData) {
                    output.addProperty(data.getKey(), data.getValue());
                }
                ctx.json(output);
            } else {
                ctx.status(400).json(new ErrorResponse("Invalid plate"));
            }
        } catch (IOException | InterruptedException | NoSuchAlgorithmException | KeyManagementException ex) {
            log.error("An error occurred while fetching plate information", ex);
            ctx.status(500).json(new ErrorResponse("An error has occurred"));
        }
    }

    public void handleUploadImage(Context ctx) {
        UploadedFile uploadedFile = ctx.uploadedFile("image");

        if (uploadedFile == null) {
            ctx.status(400).json(new ErrorResponse("Missing image file"));
            return;
        }

        try (InputStream inputStream = uploadedFile.content()) {
            byte[] imageBytes = inputStream.readAllBytes();
//            String plateNumber = VehicleInfoParser.recognizePlate(imageBytes);
//
//            if (plateNumber == null) {
//                JsonObject object = new JsonObject();
//                object.addProperty("error", "Invalid plate");
//                ctx.json(object);
//                return;
//            }
            String plateNumber = "J1";
            JsonObject object = new JsonObject();
            object.addProperty("plate", plateNumber);
            ctx.json(object);
        } catch (Exception ex) {
            log.error("An error occurred while uploading image", ex);
            ctx.status(500).json(new ErrorResponse("An error has occurred"));
        }
    }
}
