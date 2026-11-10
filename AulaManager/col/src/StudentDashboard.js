import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Container, Row, Col } from "react-bootstrap";
import "./StudentDashboard.css";

import { useSidebar } from "./SidebarContext";

const StudentDashboard = () => {
  const [pendingReservations, setPendingReservations] = useState([]);
  const [confirmedReservations, setConfirmedReservations] = useState([]);
  const navigate = useNavigate();

  const { collapsed } = useSidebar();

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const studentInfoResponse = await fetch("/api/student-info");
        const studentInfo = await studentInfoResponse.json();

        /*if (studentInfo.error) {
          navigate("/login"); // Redirecționează către login dacă nu este autentificat
          return;
        }*/

        const reservationsResponse = await fetch("/api/student-reservations");
        const reservations = await reservationsResponse.json();

        const pending = [];
        const confirmed = [];

        const formatDate = (dateString) => {
          const date = new Date(dateString);
          const day = date.getUTCDate().toString().padStart(2, "0");
          const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
          const year = date.getUTCFullYear();
          return `${day}-${month}-${year}`;
        };

        const formatTime = (timeString) => {
          return timeString.slice(11, 16);
        };

        reservations.forEach((reservation) => {
          const reservationData = {
            id: reservation.ID_rezervare,
            roomName: reservation.Sala,
            date: formatDate(reservation.Data_rezervare),
            time: `${formatTime(reservation.Ora_start)} - ${formatTime(
              reservation.Ora_final
            )}`,
          };

          if (reservation.SeatReservedBy === studentInfo.ID_cont) {
            reservationData.seat = `Seat ${reservation.Numar_loc}`;
            confirmed.push(reservationData);
          } else {
            pending.push(reservationData);
          }
        });

        setPendingReservations(pending);
        setConfirmedReservations(confirmed);
      } catch (error) {
        console.error("Error fetching reservations:", error);
      }
    };

    fetchReservations();
  }, [navigate]);

  const handleSeatBooking = (reservationId) => {
    navigate(`/seat-booking/${reservationId}`);
  };

  return (
    <div
      id="main-content"
      className={`main-content ${collapsed ? "collapsed" : ""}`}
    >
      <Container className="student-dashboard">
        <h2 className="dashboard-title">Student Dashboard</h2>

        <h3 className="section-title">Rezervări disponibile</h3>
        <div className="reservations-list">
          {pendingReservations.map((reservation) => (
            <Card key={reservation.id} className="reservation-card pending">
              <Card.Body>
                <Row className="reservation-row">
                  <Col md={3} className="reservation-col">
                    <Card.Title>Sala:</Card.Title>
                    <Card.Text>{reservation.roomName}</Card.Text>
                  </Col>
                  <Col md={3} className="reservation-col">
                    <Card.Title>Data:</Card.Title>
                    <Card.Text>{reservation.date}</Card.Text>
                  </Col>
                  <Col md={3} className="reservation-col">
                    <Card.Title>Orar:</Card.Title>
                    <Card.Text>{reservation.time}</Card.Text>
                  </Col>
                  <Col md={3} className="reservation-col button-col">
                    <Button
                      className="seat-reservation-button"
                      variant="success"
                      onClick={() => handleSeatBooking(reservation.id)}
                    >
                      Alege Loc
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </div>

        <h3 className="section-title">Rezervări confirmate</h3>
        <div className="reservations-list">
          {confirmedReservations.map((reservation) => (
            <Card key={reservation.id} className="reservation-card confirmed">
              <Card.Body>
                <Row className="reservation-row">
                  <Col md={3} className="reservation-col">
                    <Card.Title>Sala:</Card.Title>
                    <Card.Text>{reservation.roomName}</Card.Text>
                  </Col>
                  <Col md={3} className="reservation-col">
                    <Card.Title>Data:</Card.Title>
                    <Card.Text>{reservation.date}</Card.Text>
                  </Col>
                  <Col md={3} className="reservation-col">
                    <Card.Title>Orar:</Card.Title>
                    <Card.Text>{reservation.time}</Card.Text>
                  </Col>
                  <Col md={3} className="reservation-col">
                    <Card.Title>Loc:</Card.Title>
                    <Card.Text>{reservation.seat}</Card.Text>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </div>
      </Container>
    </div>
  );
};

export default StudentDashboard;
