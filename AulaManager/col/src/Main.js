import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./Home";
import RESERVATION from "./RESERVATION";
import BOOKINGHISTORY from "./BOOKINGHISTORY";
import ClassroomLocalisation from "./ClassroomLocalisation";
import ACCOUNT from "./ACCOUNT";
import LOGIN from "./LOGIN";
import ClassroomBooking from "./ClassroomBooking";
import ReservationSearch from "./ReservationSearch";
import AvailabilitySearch from "./AvailabilitySearch";
import SeatTable from "./SeatBooking";
import Sidebar from "./Sidebar";
import StudentDashboard from "./StudentDashboard";
import AdminDashboard from "./AdminDashboard";
import AdminUsersList from "./AdminUsersList";
import RoomBookingHistory from "./RoomBookingHistory";
import SeatBookingHistory from "./SeatBookingHistory";
import { SidebarProvider } from "./SidebarContext";
import ProfesorReservations from "./ProfesorReservations";

function Main() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const name = localStorage.getItem("name");

    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);
      setUserName(name);
    }
  }, []);

  const handleLogin = (name, role) => {
    setIsAuthenticated(true);
    setUserName(name);
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    setIsAuthenticated(false);
    setUserRole("");
    setUserName("");
  };

  return (
    <Router>
      <SidebarProvider>
        {isAuthenticated && (
          <Sidebar
            handleLogout={handleLogout}
            userRole={userRole}
            userName={userName}
          />
        )}
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" />
              ) : (
                <Navigate to="/home" />
              )
            }
          />
          <Route
            path="/home"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" />
              ) : (
                <BOOKINGHISTORY />
              )
            }
          />
          <Route path="/login" element={<LOGIN onLogin={handleLogin} />} />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
          />
          <Route
            path="/reservation"
            element={
              isAuthenticated ? <RESERVATION /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/history"
            element={
              isAuthenticated ? (
                <SeatBookingHistory />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/localisation"
            element={
              isAuthenticated ? (
                <ClassroomLocalisation />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/account"
            element={isAuthenticated ? <ACCOUNT /> : <Navigate to="/login" />}
          />
          <Route
            path="/booking"
            element={
              isAuthenticated ? <ClassroomBooking /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/reservation-search"
            element={
              isAuthenticated ? <ReservationSearch /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/availability-search"
            element={
              isAuthenticated ? (
                <AvailabilitySearch />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/room-reservations"
            element={
              isAuthenticated ? (
                <ProfesorReservations />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/room-booking-history"
            element={
              isAuthenticated ? (
                <RoomBookingHistory />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/seat-booking/:reservationId"
            element={isAuthenticated ? <SeatTable /> : <Navigate to="/login" />}
          />
          <Route
            path="/student-dashboard"
            element={
              isAuthenticated && userRole === "student" ? (
                <StudentDashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/professor-dashboard"
            element={
              isAuthenticated && userRole === "profesor" ? (
                <Home />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              isAuthenticated && userRole === "admin" ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/users/list"
            element={
              isAuthenticated && userRole === "admin" ? (
                <AdminUsersList />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </SidebarProvider>
    </Router>
  );
}

export default Main;
