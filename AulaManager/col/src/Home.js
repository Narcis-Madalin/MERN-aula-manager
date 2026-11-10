import React, { useState, useEffect } from "react";
import RESERVATION from "./RESERVATION";
import "./table.css";
import { useNavigate } from "react-router-dom";
import CustomizedDialogs from "./CustomizedDialogs";
import { useSidebar } from "./SidebarContext";

function ClassroomTable() {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const { collapsed } = useSidebar();

  useEffect(() => {
    fetch("/api/classrooms")
      .then((response) => response.json())
      .then((data) => {
        setClassrooms(data);
      })
      .catch((error) => console.log(error));
  }, []);

  const handleReserveClick = (classroom) => {
    setSelectedClassroom(classroom);
    navigate("/booking");
  };

  const handleDetailsClick = (classroom) => {
    setSelectedClassroom(classroom);
    setShowDialog(true);
  };

  const handleFormClose = () => {
    setSelectedClassroom(null);
    setShowForm(false);
  };

  const unbookedClassrooms = classrooms.filter(
    (classroom) => !classroom.booked
  );

  const rows = unbookedClassrooms.map((classroom, index) => (
    <tr key={index}>
      <td>{classroom.name}</td>
      <td>{classroom.capacity}</td>
      <td>{classroom.location}</td>
      <td className={classroom.booked ? "booked" : "available"}>
        {classroom.booked ? "Booked" : "Available"}
      </td>
      <td>
        <button
          className="reserve-button"
          onClick={() => handleReserveClick(classroom)}
        >
          Reserve
        </button>
      </td>
      <td>
        <button
          className="details-button"
          onClick={() => handleDetailsClick(classroom)}
        >
          Details
        </button>
      </td>
    </tr>
  ));

  return (
    <div
      id="main-content"
      className={`main-content ${collapsed ? "collapsed" : ""}`}
    >
      <div className="container">
        <div className="table-header">
          <h2 className="table-title">Sali disponibile pentru rezervare</h2>
        </div>
        <div className="table-container">
          <table className="styled-table">
            <thead>
              <tr>
                <th>Classroom Name</th>
                <th>Capacity</th>
                <th>Location</th>
                <th>Status</th>
                <th>Reservation</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>
        </div>
        {showForm && (
          <RESERVATION
            classroom={selectedClassroom}
            onClose={handleFormClose}
          />
        )}
        {showDialog && (
          <CustomizedDialogs
            classroom={selectedClassroom}
            onClose={() => setShowDialog(false)}
          />
        )}
      </div>
    </div>
  );
}

export default ClassroomTable;
