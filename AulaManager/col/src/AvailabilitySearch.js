import React, { useState, useEffect } from "react";
import { Button, TextField, MenuItem } from "@material-ui/core";
import { DateRangePicker } from "react-date-range";
import { addDays, formatISO } from "date-fns";

import StickyHeadTable from "./StickyHeadTable";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import { useSidebar } from "./SidebarContext";

const AvailabilitySearch = () => {
  const [selectedDates, setSelectedDates] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      key: "selection",
    },
  ]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedTimeRange, setSelectedTimeRange] = useState({
    startTime: "08:00:00",
    endTime: "18:00:00",
  });
  const [reservations, setReservations] = useState([]);
  const [availabilityList, setAvailabilityList] = useState([]);
  const [classrooms, setClassrooms] = useState([]);

  const { collapsed } = useSidebar();

  const coloane = [
    { id: "date", label: "Date", minWidth: 100 },
    { id: "classroom", label: "Classroom", minWidth: 100 },
    { id: "startTime", label: "Start Time", minWidth: 100 },
    { id: "endTime", label: "End Time", minWidth: 100 },
  ];

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

  const handleDateTimeChange = (ranges) => {
    setSelectedDates([ranges.selection]);
  };

  const handleRoomChange = (event) => {
    setSelectedRoom(event.target.value);
  };

  const handleTimeRangeChange = (event) => {
    setSelectedTimeRange({
      ...selectedTimeRange,
      [event.target.name]: event.target.value + ":00",
    });
  };

  const handleSearch = () => {
    const startDate = selectedDates[0]?.startDate;
    const endDate = selectedDates[0]?.endDate;

    const searchData = {
      startDate: selectedDates[0]?.startDate
        ? formatISO(startDate, { representation: "date" })
        : "",
      endDate: selectedDates[0]?.endDate
        ? formatISO(endDate, { representation: "date" })
        : "",
      room: selectedRoom,
      startTime: selectedTimeRange.startTime,
      endTime: selectedTimeRange.endTime,
    };

    const url = `/api/searchReservations?startDate=${encodeURIComponent(
      searchData.startDate
    )}&endDate=${encodeURIComponent(
      searchData.endDate
    )}&room=${encodeURIComponent(
      searchData.room
    )}&startTime=${encodeURIComponent(
      searchData.startTime
    )}&endTime=${encodeURIComponent(searchData.endTime)}`;

    fetch(url)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Failed to fetch reservations");
        }
      })
      .then((data) => {
        setReservations(data);
        updateAvailabilityMap(data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const updateAvailabilityMap = (reservations) => {
    const availabilityList = [];

    const startDate = new Date(selectedDates[0]?.startDate);
    const endDate = new Date(selectedDates[0]?.endDate);

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateString = formatISO(currentDate, { representation: "date" });

      classrooms.forEach((classroom) => {
        if (selectedRoom && classroom.Sala !== selectedRoom) {
          return;
        }

        const reservationsForClassroom = reservations.filter(
          (reservation) =>
            reservation.classroom === classroom.Sala &&
            reservation.date === dateString
        );

        if (reservationsForClassroom.length === 0) {
          if (
            selectedTimeRange.startTime <= "08:00:00" &&
            selectedTimeRange.endTime >= "18:00:00"
          ) {
            availabilityList.push({
              date: dateString,
              classroom: classroom.Sala,
              startTime: "08:00:00",
              endTime: "18:00:00",
            });
          }
        } else {
          let previousEndTime = "08:00:00";

          reservationsForClassroom.sort((a, b) => {
            if (a.startTime < b.startTime) return -1;
            if (a.startTime > b.startTime) return 1;
            return 0;
          });

          reservationsForClassroom.forEach((reservation) => {
            if (
              reservation.startTime > previousEndTime &&
              previousEndTime >= selectedTimeRange.startTime &&
              reservation.startTime <= selectedTimeRange.endTime
            ) {
              availabilityList.push({
                date: dateString,
                classroom: classroom.Sala,
                startTime: previousEndTime,
                endTime: reservation.startTime,
              });
            }

            previousEndTime = reservation.endTime;
          });

          if (
            previousEndTime < "18:00:00" &&
            previousEndTime <= selectedTimeRange.endTime
          ) {
            availabilityList.push({
              date: dateString,
              classroom: classroom.Sala,
              startTime: previousEndTime,
              endTime: "18:00:00",
            });
          }
        }
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    setAvailabilityList(availabilityList);
  };

  return (
    <div
      id="main-content"
      className={`main-content ${collapsed ? "collapsed" : ""}`}
    >
      <div className="container">
        <div className="formContainer">
          <div className="formRow">
            <DateRangePicker
              onChange={handleDateTimeChange}
              showSelectionPreview={true}
              moveRangeOnFirstSelection={false}
              months={1}
              ranges={selectedDates}
              direction="horizontal"
            />
            <TextField
              select
              label="Select Room"
              value={selectedRoom}
              onChange={handleRoomChange}
              style={{ marginLeft: 10 }}
            >
              {classrooms.map((classroom) => (
                <MenuItem key={classroom.Sala} value={classroom.Sala}>
                  {classroom.Sala}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Start Time"
              type="time"
              name="startTime"
              value={selectedTimeRange.startTime.slice(0, 5)}
              onChange={handleTimeRangeChange}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                step: 300, // 5 min
              }}
              style={{ marginLeft: 10 }}
            />
            <TextField
              label="End Time"
              type="time"
              name="endTime"
              value={selectedTimeRange.endTime.slice(0, 5)}
              onChange={handleTimeRangeChange}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                step: 300, // 5 min
              }}
              style={{ marginLeft: 10 }}
            />
            <Button
              className="searchButton"
              variant="contained"
              color="primary"
              onClick={handleSearch}
              style={{ marginLeft: 10 }}
            >
              Search
            </Button>
          </div>
        </div>

        <div className="tableContainer">
          <StickyHeadTable columns={coloane} data={availabilityList} />
        </div>
      </div>
    </div>
  );
};

export default AvailabilitySearch;
