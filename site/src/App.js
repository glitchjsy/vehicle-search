import Webcam from "react-webcam";
import "./App.css";
import { useCallback, useEffect, useRef, useState } from "react";
import NoCamera from "./NoCamera";

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
    const [permissionError, setPermissionError] = useState(null);
    const [data, setData] = useState(null);
    const [ratio, setRatio] = useState(0.75)

    const size = useWindowSize();
    const webcamRef = useRef(null);
    const capture = useCallback(
        () => {
            const imageSrc = webcamRef.current.getScreenshot();
            uploadImage(imageSrc);
        },
        [webcamRef]
    );

    let videoConstraints = {
        facingMode: { exact: "environment" }
    }

    const onError = (error) => {
        setError(error);
        setTimeout(() => setError(""), 4000);
    }

    const uploadImage = async (src) => {
        try {
            const blobResponse = await fetch(src);
            const blob = await blobResponse.blob();

            const formData = new FormData();
            formData.append("image", blob);

            const uploadResponse = await fetch("http://13.50.119.155/upload", {
                method: "POST",
                body: formData
            });

            const json = await uploadResponse.json();

            if (json?.error) {
                onError(json.error);
                return;
            }
            setData(json);
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

            <div className="btn btn-capture" onClick={() => capture()}>
                +
            </div>

            {data && (
                <div className="data-wrapper">
                    <div class="btn btn-close" onClick={() => setData(null)}>X</div>
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

export default App;
