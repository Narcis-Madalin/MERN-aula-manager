import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import {
  FaUsers,
  FaCalendarAlt,
  FaSchool,
  FaDoorOpen,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUserShield,
} from "react-icons/fa";
import "./AdminDashboard.css";

import { useSidebar } from "./SidebarContext";

const AdminDashboard = () => {
  const [userCount, setUserCount] = useState(0);
  const [recentReservationsCount, setRecentReservationsCount] = useState(0);
  const [classroomCount, setClassroomCount] = useState(0);
  const [availableClassroomCount, setAvailableClassroomCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [professorCount, setProfessorCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);

  const { collapsed } = useSidebar();

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const response = await fetch("/api/user-count");
        const data = await response.json();
        setUserCount(data.userCount);
      } catch (error) {
        console.error("Error fetching user count:", error);
      }
    };

    const fetchRecentReservationsCount = async () => {
      try {
        const response = await fetch("/api/recent-reservations-count");
        const data = await response.json();
        setRecentReservationsCount(data.recentReservationsCount);
      } catch (error) {
        console.error("Error fetching recent reservations count:", error);
      }
    };

    const fetchClassroomCount = async () => {
      try {
        const response = await fetch("/api/classroom-count");
        const data = await response.json();
        setClassroomCount(data.classroomCount);
      } catch (error) {
        console.error("Error fetching classroom count:", error);
      }
    };

    const fetchAvailableClassroomCount = async () => {
      try {
        const response = await fetch("/api/available-classroom-count");
        const data = await response.json();
        setAvailableClassroomCount(data.availableClassroomCount);
      } catch (error) {
        console.error("Error fetching available classroom count:", error);
      }
    };

    const fetchStudentCount = async () => {
      try {
        const response = await fetch("/api/student-count");
        const data = await response.json();
        setStudentCount(data.studentCount);
      } catch (error) {
        console.error("Error fetching student count:", error);
      }
    };

    const fetchProfessorCount = async () => {
      try {
        const response = await fetch("/api/profesor-count");
        const data = await response.json();
        setProfessorCount(data.professorCount);
      } catch (error) {
        console.error("Error fetching profesor count:", error);
      }
    };

    const fetchAdminCount = async () => {
      try {
        const response = await fetch("/api/admin-count");
        const data = await response.json();
        setAdminCount(data.adminCount);
      } catch (error) {
        console.error("Error fetching admin count:", error);
      }
    };

    fetchUserCount();
    fetchRecentReservationsCount();
    fetchClassroomCount();
    fetchAvailableClassroomCount();
    fetchStudentCount();
    fetchProfessorCount();
    fetchAdminCount();
  }, []);

  return (
    <div
      id="main-content"
      className={`main-content ${collapsed ? "collapsed" : ""}`}
    >
      <Container className="admin-dashboard">
        <h2 className="admin-dashboard-title">Admin Dashboard</h2>
        <Row className="admin-dashboard-summary-row">
          <Col md={6} lg={4} xl={3}>
            <Card className="admin-dashboard-summary-card users">
              <Card.Body>
                <FaUsers className="admin-dashboard-icon" />
                <Card.Title className="admin-dashboard-card-title">
                  Număr total de utilizatori
                </Card.Title>
                <Card.Text className="admin-dashboard-card-text">
                  {userCount}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={4} xl={3}>
            <Card className="admin-dashboard-summary-card reservations">
              <Card.Body>
                <FaCalendarAlt className="admin-dashboard-icon" />
                <Card.Title className="admin-dashboard-card-title">
                  Număr de rezervări recente
                </Card.Title>
                <Card.Text className="admin-dashboard-card-text">
                  {recentReservationsCount}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={4} xl={3}>
            <Card className="admin-dashboard-summary-card total-rooms">
              <Card.Body>
                <FaSchool className="admin-dashboard-icon" />
                <Card.Title className="admin-dashboard-card-title">
                  Număr total de săli
                </Card.Title>
                <Card.Text className="admin-dashboard-card-text">
                  {classroomCount}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={4} xl={3}>
            <Card className="admin-dashboard-summary-card available-rooms">
              <Card.Body>
                <FaDoorOpen className="admin-dashboard-icon" />
                <Card.Title className="admin-dashboard-card-title">
                  Număr de săli disponibile
                </Card.Title>
                <Card.Text className="admin-dashboard-card-text">
                  {availableClassroomCount}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className="admin-dashboard-summary-row">
          <Col md={6} lg={4} xl={3}>
            <Card className="admin-dashboard-summary-card students">
              <Card.Body>
                <FaUserGraduate className="admin-dashboard-icon" />
                <Card.Title className="admin-dashboard-card-title">
                  Număr de studenți
                </Card.Title>
                <Card.Text className="admin-dashboard-card-text">
                  {studentCount}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={4} xl={3}>
            <Card className="admin-dashboard-summary-card professors">
              <Card.Body>
                <FaChalkboardTeacher className="admin-dashboard-icon" />
                <Card.Title className="admin-dashboard-card-title">
                  Număr de profesori
                </Card.Title>
                <Card.Text className="admin-dashboard-card-text">
                  {professorCount}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={4} xl={3}>
            <Card className="admin-dashboard-summary-card admins">
              <Card.Body>
                <FaUserShield className="admin-dashboard-icon" />
                <Card.Title className="admin-dashboard-card-title">
                  Număr de administratori
                </Card.Title>
                <Card.Text className="admin-dashboard-card-text">
                  {adminCount}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminDashboard;
