const puppeteer = require("puppeteer");
const exec = require("child_process").exec;
const config = require("./config.json");

const findPlateFromImage = async (filePath) => {
    return new Promise((resolve, reject) => {
        exec(`alpr -c gb -j ${filePath}`, (err, stdout, stderr) => {
            if (err) {
                return reject(err);
            }
            if (stderr) {
                return reject(JSON.parse(stderr));
            }
            return resolve(JSON.parse(stdout));
        })
    });
}

const fetchVehicleInfo = async (numberPlate) => {
    // Setup puppeteer
    const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandox"],
        // executablePath: "/opt/homebrew/bin/chromium",
        executablePath: config.chromiumPath,
        headless: "new"
    });
    const page = await browser.newPage();

    // Relay browser console messages to terminal
    page.on("console", c => console.log(c.text()));

    // Go to search page
    await page.goto("https://vehicle-search.gov.je", { waitUntil: "networkidle2" });

    // Input the number plate
    await page.focus("input[name=plate]");
    await page.keyboard.type(numberPlate);

    // Submit
    await Promise.all([
        await page.click("input[type=submit]"),
        await page.waitForNetworkIdle()
    ]);

    const vehicleData = await page.evaluate(() => {
        const rows = document.getElementsByClassName("detail-row");

        if (rows.length === 0) {
            return null;
        }

        return Array.from(rows).map(row => {
            const cells = row.getElementsByTagName("td");

            return {
                key: cells[0].textContent,
                value: cells[1].textContent
            }
        })
    });

    await browser.close();

    if (vehicleData === null) {
        return null;
    }

    const obj = {};
    vehicleData.forEach(data => obj[data.key] = data.value);
    return obj;
}

module.exports.findPlateFromImage = findPlateFromImage;
module.exports.fetchVehicleInfo = fetchVehicleInfo;