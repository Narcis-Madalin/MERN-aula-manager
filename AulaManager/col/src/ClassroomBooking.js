import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@material-ui/core";
import "./ClassroomBooking.css";
import ReservationPage from "./RESERVATION";

import { useSidebar } from "./SidebarContext";

const ClassroomBooking = () => {
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [classrooms, setClassrooms] = useState([]);

  const { collapsed } = useSidebar();

  useEffect(() => {
    fetch("/api/rooms")
      .then((response) => response.json())
      .then((data) => {
        setClassrooms(data);
      })
      .catch((error) => console.log(error));
  }, []);

  const handleClassroomClick = (classroom) => {
    setSelectedClassroom(classroom);
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div
      id="main-content"
      className={`main-content ${collapsed ? "collapsed" : ""}`}
    >
      <div>
        <h2>Classroom Booking</h2>
        <div className="classroom-container">
          {classrooms.map((classroom) => (
            <div
              key={classroom.id}
              className={`classroom ${
                classroom.booked ? "booked" : "available"
              } ${selectedClassroom?.id === classroom.id ? "selected" : ""}`}
              onClick={() => handleClassroomClick(classroom)}
            >
              {classroom.name}
            </div>
          ))}
        </div>
        {selectedClassroom && (
          <div>
            <h3>Classroom Details</h3>
            <TableContainer component={Paper}>
              <Table aria-label="classroom details">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Booked</TableCell>
                    <TableCell align="right">Capacity</TableCell>
                    <TableCell align="right">Current Booking</TableCell>
                    <TableCell align="right">Next Booking</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow key={selectedClassroom.id}>
                    <TableCell component="th" scope="row">
                      {selectedClassroom.name}
                    </TableCell>
                    <TableCell align="right">
                      {selectedClassroom.booked ? "Yes" : "No"}
                    </TableCell>
                    <TableCell align="right">
                      {selectedClassroom.capacity}
                    </TableCell>
                    <TableCell align="right">
                      {selectedClassroom.currentDate ? (
                        <div>
                          {formatDate(selectedClassroom.currentDate)} <br />
                          {selectedClassroom.currentStartTime} -{" "}
                          {selectedClassroom.currentEndTime}
                        </div>
                      ) : (
                        "No current bookings"
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {selectedClassroom.nextDate ? (
                        <div>
                          {formatDate(selectedClassroom.nextDate)} <br />
                          {selectedClassroom.nextStartTime} -{" "}
                          {selectedClassroom.nextEndTime}
                        </div>
                      ) : (
                        "No upcoming bookings"
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}

        {selectedClassroom && (
          <ReservationPage selectedClassroom={selectedClassroom} />
        )}
      </div>
    </div>
  );
};

export default ClassroomBooking;
