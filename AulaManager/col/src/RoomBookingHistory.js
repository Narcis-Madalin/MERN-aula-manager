import React, { useState, useEffect } from "react";
import "./RoomBookingHistory.css";

import { useSidebar } from "./SidebarContext";

function RoomBookingHistory() {
  const [bookingData, setBookingData] = useState(null);
  const userId = localStorage.getItem("userId");
  const [selectedValue, setSelectedValue] = useState("");
  const [classrooms, setClassrooms] = useState([]);

  const { collapsed } = useSidebar();

  useEffect(() => {
    fetch("/api/getClassrooms")
      .then((response) => response.json())
      .then((data) => {
        setClassrooms(data);
      })
      .catch((error) => {
        console.error("Error fetching classrooms:", error);
      });
  }, []);

  const handleChange = (event) => {
    const value = event.target.value;
    setSelectedValue(value);

    const parsedUserId = parseInt(userId, 10);
    if (!isNaN(parsedUserId)) {
      fetch(`/api/bookinghistory/${parsedUserId}/${value}`)
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          if (data.bookings) {
            setBookingData(data.bookings);
          }
        })
        .catch((error) => console.error(error));
    }
  };

  useEffect(() => {
    const parsedUserId = parseInt(userId, 10);
    if (!isNaN(parsedUserId)) {
      fetch(`/api/bookinghistory/${parsedUserId}/${selectedValue}`)
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          if (data.bookings) {
            setBookingData(data.bookings);
          }
        })
        .catch((error) => console.error(error));
    }
  }, [userId, selectedValue]);

  return (
    <div
      id="main-content"
      className={`main-content ${collapsed ? "collapsed" : ""}`}
    >
      <div className="container">
        <h2>Booking History</h2>
        <select value={selectedValue} onChange={handleChange}>
          <option value="">--Select an option--</option>
          {classrooms.map((classroom) => (
            <option key={classroom.Sala} value={classroom.Sala}>
              Sala {classroom.Sala}
            </option>
          ))}
        </select>
        <div>
          {bookingData ? (
            <div>
              {bookingData.map((booking, index) => (
                <div className="booking-card" key={index}>
                  <p>Date: {booking.bookingDate}</p>
                  <p>Start Time: {booking.bookingStartTime}</p>
                  <p>End Time: {booking.bookingEndTime}</p>
                  <hr />
                </div>
              ))}
            </div>
          ) : (
            <p>No bookings found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoomBookingHistory;
