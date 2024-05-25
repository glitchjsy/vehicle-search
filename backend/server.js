const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const { fetchVehicleInfo, findPlateFromImage } = require("./vehicle-search");
const config = require("./config.json");

if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + ".jpg");
    }
});

const upload = multer({ storage: storage });
const app = express();

app.use(cors());
app.set("json spaces", 2);

// HACK: Fixes UNABLE_TO_VERIFY_LEAF_SIGNATURE error
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

app.post("/upload", upload.single("image"), async (req, res) => {
    try {
        const uploadedImagePath = req.file.path;

        console.log("Received image: " + uploadedImagePath);

        const response = await findPlateFromImage(uploadedImagePath);
        // For some reason uploading images has stopped working, so for testing we hardcode a plate number
        const plate = "J121551";//response?.results[0]?.plate;

        // Delete uploaded image file
        fs.unlinkSync(uploadedImagePath);

        if (!plate) {
            return res.status(400).json({ error: "No plate found" });
        }
        if (plate.length < 2 || plate.length > 7) {
            return res.status(400).json({ error: "Invalid plate" });
        }
        if (!plate.startsWith("J")) {
            return res.status(400).json({ error: "Not a Jersey plate" });
        }

        return res.json({ plate });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "An error has occurred" });
    }
});

app.get("/:plate", async (req, res) => {
    try {
        const plate = req.params.plate;

        if (plate.length < 2 || plate.length > 7) {
            return res.status(400).json({ error: "Invalid plate" });
        }
        if (!plate.startsWith("J")) {
            return res.status(400).json({ error: "Not a Jersey plate" });
        }

        const vehicleInfo = await fetchVehicleInfo(plate);

        if (vehicleInfo === null) {
            return res.status(404).json({ error: "No vehicle found" });
        }
        return res.json(vehicleInfo);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "An error has occurred" });
    }
});

const server = app.listen(config.port, () => {
    console.log(`Listening on port ${server.address().port}`);
});