import React from "react";

interface Props {
    onClose: () => void;
}

export const Settings = ({ onClose }: Props) => {
    return (
        <div className="settings-wrapper">
            <div
                className="btn btn-close"
                style={{ marginRight: "20px" }}
                onClick={onClose}
            >
                <img src="/images/close.svg" height="20" width="20" />
            </div>

            <h2>Settings</h2>

            <div className="input-wrapper" style={{ marginTop: "20px" }}>
                <label htmlFor="test">Test Label</label>
                <select name="test"></select>
            </div>
        </div>
    )
}