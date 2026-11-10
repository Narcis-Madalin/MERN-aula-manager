import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import "./SeatBookingHistory.css";

import { useSidebar } from "./SidebarContext";

function SeatBookingHistory() {
  const [bookingData, setBookingData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const userId = localStorage.getItem("userId");

  const { collapsed } = useSidebar();

  useEffect(() => {
    fetch("/api/getClassrooms")
      .then((response) => response.json())
      .then((data) => setClassrooms(data))
      .catch((error) => console.error("Error fetching classrooms:", error));
  }, []);

  const fetchBookingData = (classroom) => {
    const parsedUserId = parseInt(userId, 10);
    if (!isNaN(parsedUserId)) {
      fetch(`/api/seatbookinghistory/${parsedUserId}/${classroom}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.bookings) {
            setBookingData(data.bookings);
            setFilteredData(data.bookings);
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const handleClassroomChange = (event) => {
    const value = event.target.value;
    setSelectedClassroom(value);
    if (value) fetchBookingData(value);
    else {
      setBookingData([]);
      setFilteredData([]);
    }
  };

  const handleFilterChange = () => {
    const filtered = bookingData.filter((booking) => {
      return !selectedDate || booking.bookingDate === selectedDate;
    });
    setFilteredData(filtered);
  };

  useEffect(() => {
    handleFilterChange();
  }, [selectedDate]);

  const columns = [
    { field: "room", headerName: "Room", width: 130 },
    { field: "bookingDate", headerName: "Date", width: 130 },
    { field: "bookingStartTime", headerName: "Start Time", width: 130 },
    { field: "bookingEndTime", headerName: "End Time", width: 130 },
    { field: "seatNumber", headerName: "Seat Number", width: 130 },
  ];

  return (
    <div
      id="main-content"
      className={`main-content ${collapsed ? "collapsed" : ""}`}
    >
      <div className="container">
        <h2>Booking History</h2>
        <div className="filters">
          <FormControl
            variant="outlined"
            style={{ minWidth: 200, marginRight: 10 }}
          >
            <InputLabel>Sala</InputLabel>
            <Select
              value={selectedClassroom}
              onChange={handleClassroomChange}
              label="Classroom"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {classrooms.map((classroom) => (
                <MenuItem key={classroom.Sala} value={classroom.Sala}>
                  Sala {classroom.Sala}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ marginRight: 10 }}
          />
        </div>
        <div style={{ height: 400, width: "100%", marginTop: 20 }}>
          <DataGrid
            rows={filteredData}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            getRowId={(row) =>
              row.room + row.bookingDate + row.bookingStartTime
            }
          />
        </div>
      </div>
    </div>
  );
}

export default SeatBookingHistory;
