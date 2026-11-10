import React, { useState, useEffect } from "react";
import { Card, Button, Container, Row, Col, Modal } from "react-bootstrap";
import "./ProfesorReservations.css";

import { useSidebar } from "./SidebarContext";

const ProfesorReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const professorId = localStorage.getItem("userId");

  const { collapsed } = useSidebar();

  useEffect(() => {
    if (professorId) {
      const fetchReservations = async () => {
        try {
          const response = await fetch(
            `/api/professor-reservations/${professorId}`
          );
          const data = await response.json();

          if (Array.isArray(data)) {
            setReservations(data);
          } else {
            setReservations([]);
            console.error("Unexpected response format:", data);
          }
        } catch (error) {
          console.error("Error fetching reservations:", error);
          setReservations([]);
        }
      };

      fetchReservations();
    }
  }, [professorId]);

  const handleCancel = (reservationId) => {
    setSelectedReservation(reservationId);
    setShowModal(true);
  };

  const confirmCancel = async () => {
    try {
      await fetch(`/api/reservations/${selectedReservation}`, {
        method: "DELETE",
      });
      setReservations(
        reservations.filter((r) => r.ID_rezervare !== selectedReservation)
      );
      setShowModal(false);
      setSelectedReservation(null);
    } catch (error) {
      console.error("Error canceling reservation:", error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReservation(null);
  };

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

  return (
    <div
      id="main-content"
      className={`main-content ${collapsed ? "collapsed" : ""}`}
    >
      <Container className="professor-reservations">
        <h2 className="dashboard-title">Rezervările mele</h2>
        <div className="reservations-list">
          {reservations.length > 0 ? (
            reservations.map((reservation) => {
              const reservationData = {
                id: reservation.ID_rezervare,
                roomName: reservation.Sala,
                date: formatDate(reservation.Data_rezervare),
                time: `${formatTime(reservation.Ora_start)} - ${formatTime(
                  reservation.Ora_final
                )}`,
                specialization: reservation.Nume_specializare,
                year: reservation.Nume_an,
                group: reservation.Nume_grupa,
              };

              return (
                <Card key={reservationData.id} className="reservation-card">
                  <Card.Body>
                    <Row className="reservation-row">
                      <Col md={2} className="reservation-col">
                        <Card.Title>Sala:</Card.Title>
                        <Card.Text>{reservationData.roomName}</Card.Text>
                      </Col>
                      <Col md={2} className="reservation-col">
                        <Card.Title>Data:</Card.Title>
                        <Card.Text>{reservationData.date}</Card.Text>
                      </Col>
                      <Col md={2} className="reservation-col">
                        <Card.Title>Orar:</Card.Title>
                        <Card.Text className="time">
                          {reservationData.time}
                        </Card.Text>
                      </Col>
                      <Col md={2} className="reservation-col">
                        <Card.Title>An:</Card.Title>
                        <Card.Text>{reservationData.year}</Card.Text>
                      </Col>
                      <Col md={2} className="reservation-col">
                        <Card.Title>Specializare:</Card.Title>
                        <Card.Text>{reservationData.specialization}</Card.Text>
                      </Col>
                      <Col md={2} className="button-col">
                        <Button
                          variant="danger"
                          className="seat-reservation-button"
                          onClick={() => handleCancel(reservationData.id)}
                        >
                          Anulează
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              );
            })
          ) : (
            <p>Nu există rezervări disponibile.</p>
          )}
        </div>

        <Modal show={showModal} onHide={closeModal} className="professor-modal">
          <Modal.Header closeButton>
            <Modal.Title>Confirmare Anulare</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Sunteți sigur că doriți să anulați această rezervare?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>
              Nu
            </Button>
            <Button variant="danger" onClick={confirmCancel}>
              Da
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default ProfesorReservations;
