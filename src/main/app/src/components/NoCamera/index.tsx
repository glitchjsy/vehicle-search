import React from "react";
import "./styles.css";

interface Props {
    error: string;
}

export const NoCamera = ({ error }: Props) => {
    console.error(error);
    return (
        <div className="error-view">
            <div className="container">
                <h1 className="title">Sorry</h1>
                <h2 className="camera-required">This app only works on mobile devices</h2>

                <div className="contact">
                    <p>Need help? Want to talk?</p>
                    <a href="mailto:luke@glitch.je">Contact luke@glitch.je</a>
                </div>
            </div>
        </div>
    )
}