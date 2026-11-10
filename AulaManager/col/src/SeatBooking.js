import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./seats.css";
import { useSidebar } from "./SidebarContext";
import MesajModal from "./MesajModal";

function SeatTable() {
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [reservationDetails, setReservationDetails] = useState({});
  const { reservationId } = useParams();
  const [studentId, setStudentId] = useState(null);
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [mesajModal, setMesajModal] = useState("");

  const { collapsed } = useSidebar();

  useEffect(() => {
    const fetchStudentId = async () => {
      try {
        const response = await fetch("/api/current-user");
        const data = await response.json();

        if (data.studentId) {
          setStudentId(data.studentId);
        }
      } catch (error) {
        console.error("Error fetching student ID:", error);
      }
    };

    fetchStudentId();
  }, [navigate]);

  useEffect(() => {
    if (studentId) {
      const fetchOccupiedSeats = async () => {
        try {
          const response = await fetch(`/api/occupied-seats/${reservationId}`);
          const seats = await response.json();
          setOccupiedSeats(seats.map((seat) => seat.Numar_loc));
        } catch (error) {
          console.error("Error fetching occupied seats:", error);
        }
      };

      const fetchReservationDetails = async () => {
        try {
          const response = await fetch(
            `/api/reservation-details/${reservationId}`
          );
          const details = await response.json();
          setReservationDetails(details);
        } catch (error) {
          console.error("Error fetching reservation details:", error);
        }
      };

      fetchOccupiedSeats();
      fetchReservationDetails();
    }
  }, [reservationId, studentId]);

  const handleSeatClick = (seatNumber) => {
    if (occupiedSeats.includes(seatNumber)) return;

    if (selectedSeat === seatNumber) {
      setSelectedSeat(null);
    } else {
      setSelectedSeat(seatNumber);
    }
  };

  const handleReserveSeat = async () => {
    if (selectedSeat && studentId) {
      try {
        const response = await fetch(`/api/reserve-seat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reservationId,
            seatNumber: selectedSeat,
            studentId,
          }),
        });

        if (response.ok) {
          setMesajModal("Locul a fost rezervat cu succes!");
          setModalOpen(true);
        } else {
          setMesajModal("A apărut o problemă la rezervarea locului.");
          setModalOpen(true);
        }
      } catch (error) {
        setMesajModal("A apărut o problemă la rezervarea locului.");
        setModalOpen(true);
      }
    }
  };

  return (
    <div
      id="main-content"
      className={`main-content ${collapsed ? "collapsed" : ""}`}
    >
      <div className="seat-table">
        <h2>Selectează un loc pentru rezervare:</h2>
        <div>
          <h3>{reservationDetails.roomName}</h3>
          <h3>{reservationDetails.date}</h3>
          <h3>{reservationDetails.time}</h3>
        </div>
        <div className="seat-grid">
          <div className="row">
            {[...Array(3)].map((_, rowIndex) => (
              <div className="seat-column" key={rowIndex}>
                {[...Array(7)].map((_, columnIndex) => {
                  const seatNumber = rowIndex * 7 + columnIndex + 1;
                  return (
                    <div
                      className={`seat ${
                        selectedSeat === seatNumber ? "selected" : ""
                      } ${
                        occupiedSeats.includes(seatNumber) ? "occupied" : ""
                      }`}
                      key={seatNumber}
                      onClick={() => handleSeatClick(seatNumber)}
                    >
                      {occupiedSeats.includes(seatNumber) ? "X" : seatNumber}
                    </div>
                  );
                })}
              </div>
            ))}
            <div className="space"></div>{" "}
            {[...Array(8)].map((_, rowIndex) => (
              <div className="seat-column" key={rowIndex + 7}>
                {[...Array(7)].map((_, columnIndex) => {
                  const seatNumber = rowIndex * 7 + columnIndex + 22;
                  return (
                    <div
                      className={`seat ${
                        selectedSeat === seatNumber ? "selected" : ""
                      } ${
                        occupiedSeats.includes(seatNumber) ? "occupied" : ""
                      }`}
                      key={seatNumber}
                      onClick={() => handleSeatClick(seatNumber)}
                    >
                      {occupiedSeats.includes(seatNumber) ? "X" : seatNumber}
                    </div>
                  );
                })}
              </div>
            ))}
            <div className="space"></div>{" "}
            {[...Array(3)].map((_, rowIndex) => (
              <div className="seat-column" key={rowIndex}>
                {[...Array(7)].map((_, columnIndex) => {
                  const seatNumber = rowIndex * 7 + columnIndex + 78;
                  return (
                    <div
                      className={`seat ${
                        selectedSeat === seatNumber ? "selected" : ""
                      } ${
                        occupiedSeats.includes(seatNumber) ? "occupied" : ""
                      }`}
                      key={seatNumber}
                      onClick={() => handleSeatClick(seatNumber)}
                    >
                      {occupiedSeats.includes(seatNumber) ? "X" : seatNumber}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="reserve-button-container">
          <button
            className="seat-reservation-button"
            onClick={handleReserveSeat}
            disabled={!selectedSeat}
          >
            Rezervă Locul
          </button>
        </div>
      </div>
      <MesajModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          if (mesajModal === "Locul a fost rezervat cu succes!") {
            navigate("/student-dashboard");
          }
        }}
        message={mesajModal}
      />
    </div>
  );
}

export default SeatTable;
