import Webcam from "react-webcam";
import "./App.css";
import { useCallback, useEffect, useRef, useState } from "react";
import NoCamera from "./NoCamera";

const API_URL = "https://api.vehicle-search.glitch.je";

const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
        width: undefined,
        height: undefined,
    });

    useEffect(() => {
        const onResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }
        onResize();

        window.addEventListener("resize", onResize);

        return () => window.removeEventListener("resize", onResize);
    }, []);
    return windowSize;
}

const App = () => {
    const [error, setError] = useState("");
    const [stage, setStage] = useState("Waiting...");
    const [permissionError, setPermissionError] = useState(null);
    const [data, setData] = useState(null);
    const [settingsShown, setSettingsShown] = useState(false);
    const [cropScreenshot, setCropScreenshot] = useState(true);

    const size = useWindowSize();
    const webcamRef = useRef(null);
    const capture = useCallback(
        () => {
            const imageSrc = webcamRef.current.getScreenshot();

            cropImage(imageSrc, rectWidth, rectHeight, rectTop, rectLeft).then(croppedImage => {
                uploadImage(croppedImage);
            })
        },
        [webcamRef]
    );

    // first portrait, second landscape
    const rectWidth = size.height > size.width ? size.width - 20 : size.width / 2;
    const rectHeight = 130;
    const rectTop = (size.height - rectHeight) / 2;
    const rectLeft = (size.width - rectWidth) / 2;

    let videoConstraints = {
        facingMode: { exact: "environment" },
        aspectRatio: size.height > size.width ? undefined : 1.7
    }

    const onError = (error) => {
        setError(error);
        setStage("Waiting...");
        setTimeout(() => setError(""), 4000);
    }

    const cropImage = (imageSrc, width, height, top, left) => {
        return new Promise((resolve) => {
            const img = new Image();

            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, -left, -top);

                const croppedImage = canvas.toDataURL("image/jpeg");
                resolve(croppedImage);
            };
            img.src = imageSrc;
        });
    };

    const uploadImage = async (src) => {
        try {
            setStage("Identifying plate...");

            const blobResponse = await fetch(src);
            const blob = await blobResponse.blob();

            const formData = new FormData();
            formData.append("image", blob);

            const uploadResponse = await fetch(`${API_URL}/upload`, {
                method: "POST",
                body: formData
            });

            const json = await uploadResponse.json();

            if (json?.error) {
                onError(json.error);
                return;
            }

            const plate = json?.plate;
            setStage(`Fetching vehicle information... (${plate})`);

            const vehicleResponse = await fetch(`${API_URL}/${plate}`);
            const vehicleJson = await vehicleResponse.json();

            if (vehicleJson?.error) {
                onError(vehicleJson.error);
                return;
            }
            setData(vehicleJson);
            setStage("Waiting...");
        } catch (e) {
            console.error(e);
            setError("An error has occurred");
        }
    }

    if (permissionError) {
        return <NoCamera error={permissionError} />
    }

    return (
        <>
            {error && (
                <div className="error-wrapper">
                    <p>{error}</p>
                </div>
            )}
            {(stage && !error && !settingsShown) && (
                <div className="error-wrapper" style={{ backgroundColor: "rgba(4,59,92,0.5)", zIndex: 997 }}>
                    <p>{stage}</p>
                </div>
            )}

            {settingsShown && (
                <div className="settings-wrapper">
                    <div
                        className="btn btn-close"
                        style={{ marginRight: "20px" }}
                        onClick={() => setSettingsShown(false)}
                    >
                        <img src="/close.svg" height="20" width="20" />
                    </div>
                    
                    <h2>Settings</h2>

                    <div className="input-wrapper" style={{ marginTop: "20px" }}>
                        <label for="test">Test Label</label>
                        <select name="test"></select>
                    </div>
                </div>
            )}

            {cropScreenshot && (
                <RectangleOverlay
                    width={rectWidth}
                    height={rectHeight}
                    top={rectTop}
                    left={rectLeft}
                />
            )}

            {!settingsShown && (
                <div className="btn btn-capture" onClick={() => capture()}>
                    <img src="/plus.svg" />
                </div>
            )}

            <div className="btn btn-settings" onClick={() => {
                setData(null);
                setSettingsShown(!settingsShown);
            }}>
                <img src="/settings.svg" />
            </div>

            {data && (
                <div className="data-wrapper">
                    <div
                        className="btn btn-close"
                        style={{ marginRight: "20px" }}
                        onClick={() => setData(null)}
                    >
                        <img src="/close.svg" height="20" width="20" />
                    </div>

                    {Object.keys(data).map(key => (
                        <div key={key} className="entry">
                            <div className="entry-title">{key}</div>
                            <div className="entry-value">{data[key]}</div>
                        </div>
                    ))}
                </div>
            )}

            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                onUserMediaError={(e) => setPermissionError(e)}
                height={size.height}
                width={size.width}
                controls={false}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                playsInline={true}
            />
        </>
    );
}

const RectangleOverlay = ({ width, height, top, left }) => {
    const style = {
        position: "absolute",
        border: "2px solid red",
        width,
        height,
        top,
        left,
        pointerEvents: "none",
    };

    return <div style={style}></div>;
};

export default App;
