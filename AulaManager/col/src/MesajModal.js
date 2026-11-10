import React from "react";
import Modal from "react-modal";
import "./MesajModal.css";

Modal.setAppElement("#root"); // Setez elementul root pentru accesibilitate

const MesajModal = ({ isOpen, onClose, message }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="Modal"
      overlayClassName="Overlay"
    >
      <div className="modal-content">
        <h2>{message}</h2>
        <button onClick={onClose} className="modal-button">
          OK
        </button>
      </div>
    </Modal>
  );
};

export default MesajModal;
