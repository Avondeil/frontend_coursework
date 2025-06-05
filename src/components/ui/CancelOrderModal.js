import React, { useEffect, useRef } from 'react';
import '../styles/CancelOrderModal.css';

const CancelOrderModal = ({ isOpen, onClose, onConfirm, orderNumber }) => {
    const noButtonRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            if (noButtonRef.current) {
                noButtonRef.current.focus();
            }
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <p>Вы уверены, что хотите отменить заказ №{orderNumber}?</p>
                <div className="modal-buttons">
                    <button className="modal-button yes" onClick={onConfirm}>Да</button>
                    <button className="modal-button no" onClick={onClose} ref={noButtonRef}>Нет</button>
                </div>
            </div>
        </div>
    );
};

export default CancelOrderModal;