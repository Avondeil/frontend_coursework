import React, { useState, useEffect, useRef } from "react";
import "../styles/VerificationModal.css";

const VerificationModal = ({ email, onConfirm, onResend }) => {
    const [code, setCode] = useState(Array(6).fill(""));
    const [error, setError] = useState(false);
    const [timer, setTimer] = useState(60);
    const inputRefs = useRef([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleInputChange = (index, value) => {
        if (error) setError(false);
        if (/^\d$/.test(value) || value === "") {
            const newCode = [...code];
            newCode[index] = value;
            setCode(newCode);
            if (value && index < 5) {
                inputRefs.current[index + 1].focus();
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleConfirm = () => {
        const fullCode = code.join("");
        if (fullCode.length === 6) {
            onConfirm(fullCode).catch(() => setError(true));
        }
    };

    const handleResend = () => {
        onResend();
        setTimer(60);
    };

    return (
        <div className="vm-modal-overlay">
            <div className="vm-modal-content">
                <h2>Подтверждение кода</h2>
                <p>Код отправлен на {email}</p>
                <div className="vm-code-inputs">
                    {code.map((digit, index) => (
                        <input
                            key={index}
                            type="text"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleInputChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            ref={(el) => (inputRefs.current[index] = el)}
                            className={error ? "vm-error" : ""}
                        />
                    ))}
                </div>
                <button className="vm-button" onClick={handleConfirm}>Подтвердить</button>
                <span
                    className={`vm-resend-link ${timer > 0 ? "disabled" : ""}`}
                    onClick={timer > 0 ? null : handleResend}
                >
                    Отправить снова {timer > 0 && `(${timer}s)`}
                </span>
                {error && <p className="vm-error-message">Неверный код</p>}
            </div>
        </div>
    );
};

export default VerificationModal;