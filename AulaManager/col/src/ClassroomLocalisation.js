import React, { useState } from "react";
import { useSidebar } from "./SidebarContext";
import "./modal.css";
import planImage from "./images/plan.jpeg";
import Image44 from "./images/eta44.jpeg";
import Image22 from "./images/eta22.jpeg";
import Image33 from "./images/et33.jpeg";
import Image5 from "./images/5.jpeg";

function MyTable() {
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const { collapsed } = useSidebar();

  const handleButtonClick = (imageUrl) => {
    setShowModal(true);
    setModalImage(imageUrl);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalImage("");
  };

  return (
    <div
      id="main-content"
      className={`main-content ${collapsed ? "collapsed" : ""}`}
    >
      <div>
        <table>
          <thead>
            <tr>
              <th>Classroom Names</th>
              <th>Located</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>A01</td>
              <td>
                <button onClick={() => handleButtonClick(planImage)}>
                  Click Me
                </button>
              </td>
            </tr>
            <tr>
              <td>A02</td>
              <td>
                <button onClick={() => handleButtonClick(Image44)}>
                  Click Me
                </button>
              </td>
            </tr>
            <tr>
              <td>A03</td>
              <td>
                <button onClick={() => handleButtonClick(Image22)}>
                  Click Me
                </button>
              </td>
            </tr>
            <tr>
              <td>A04</td>
              <td>
                <button onClick={() => handleButtonClick(Image33)}>
                  Click Me
                </button>
              </td>
            </tr>
            <tr>
              <td>B01</td>
              <td>
                <button onClick={() => handleButtonClick(Image5)}>
                  Click Me
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={handleCloseModal}>
                &times;
              </span>
              <img src={modalImage} alt="My Image" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyTable;
