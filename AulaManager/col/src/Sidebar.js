import React from "react";
import { NavLink } from "react-router-dom";
import { useSidebar } from "./SidebarContext";
import "./Sidebar.css";
import logo from "../src/images/logo_uvt_mare.png";

const Sidebar = ({ handleLogout, userRole, userName }) => {
  const { collapsed, toggleSidebar } = useSidebar();

  return (
    <div className="sidebar-container">
      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="logo">
          <img src={logo} alt="Logo" />
          <button className="toggle-btn" onClick={toggleSidebar}>
            <i className="fas fa-bars"></i>
          </button>
        </div>

        {userRole === "student" && (
          <>
            <NavLink to="/student-dashboard">
              <i className="fas fa-home"></i>
              {!collapsed && <span>Dashboard</span>}
            </NavLink>
            <NavLink to="/history">
              <i className="fas fa-history"></i>
              {!collapsed && <span>Seat Booking History</span>}
            </NavLink>
          </>
        )}

        {userRole === "profesor" && (
          <>
            <NavLink to="/professor-dashboard">
              <i className="fas fa-home"></i>
              {!collapsed && <span>Dashboard</span>}
            </NavLink>
            <NavLink to="/booking">
              <i className="fas fa-calendar-alt"></i>
              {!collapsed && <span>Classroom Booking</span>}
            </NavLink>
            <NavLink to="/reservation-search">
              <i className="fas fa-search"></i>
              {!collapsed && <span>Reservation Search</span>}
            </NavLink>
            <NavLink to="/availability-search">
              <i className="fas fa-search"></i>
              {!collapsed && <span>Availability Search</span>}
            </NavLink>
            <NavLink to="/room-booking-history">
              <i className="fas fa-history"></i>
              {!collapsed && <span>Istoric rezervari</span>}
            </NavLink>
            <NavLink to="/room-reservations">
              <i className="fas fa-eye"></i>
              {!collapsed && <span>Rezervarile mele</span>}
            </NavLink>
          </>
        )}

        {userRole === "admin" && (
          <>
            <NavLink to="/admin/dashboard">
              <i className="fas fa-tachometer-alt"></i>
              {!collapsed && <span>Admin Dashboard</span>}
            </NavLink>
            <NavLink to="/account">
              <i className="fas fa-solid fa-user"></i>
              {!collapsed && <span>Creare Conturi</span>}
            </NavLink>
            <NavLink to="/users/list">
              <i className="fas fa-solid fa-list"></i>
              {!collapsed && <span>Lista utilizatori</span>}
            </NavLink>
          </>
        )}

        <div className="sidebar-user">
          {!collapsed && <span>{userName + " (" + userRole + ") "}</span>}
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
