import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import "./reservation.css";
import { useSidebar } from "./SidebarContext";
import MesajModal from "./MesajModal";

function ReservationPage({ selectedClassroom }) {
  const [user, setUser] = useState({ ID_cont: localStorage.getItem("userId") });
  const [date, setDate] = useState("");
  const [StartTime, setStartTime] = useState("");
  const [EndTime, setEndTime] = useState("");
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const [specializations, setSpecializations] = useState([]);
  const [years, setYears] = useState([]);
  const [groups, setGroups] = useState([]);

  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const { collapsed } = useSidebar();
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/user-info")
      .then((response) => response.json())
      .then((data) => {
        if (data.ID_cont) {
          setUser({ ID_cont: data.ID_cont });
        } else {
          console.error("User data is incomplete", data);
        }
      })
      .catch((error) => console.log(error));

    fetch("/api/specializations")
      .then((response) => response.json())
      .then((data) => setSpecializations(data))
      .catch((error) => console.log(error));

    fetch("/api/years")
      .then((response) => response.json())
      .then((data) => setYears(data))
      .catch((error) => console.log(error));

    fetch("/api/groups")
      .then((response) => response.json())
      .then((data) => setGroups(data))
      .catch((error) => console.log(error));
  }, []);

  const getUniqueGroups = () => {
    return groups.filter((group, index, self) => {
      return (
        group.ID_specializare === parseInt(selectedSpecialization) &&
        group.ID_an === parseInt(selectedYear) &&
        index === self.findIndex((g) => g.ID_grupa === group.ID_grupa)
      );
    });
  };

  const handleGroupChange = (groupId) => {
    setSelectedGroups((prevSelectedGroups) =>
      prevSelectedGroups.includes(groupId)
        ? prevSelectedGroups.filter((id) => id !== groupId)
        : [...prevSelectedGroups, groupId]
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !date ||
      !StartTime ||
      !EndTime ||
      !selectedSpecialization ||
      !selectedYear ||
      selectedGroups.length === 0
    ) {
      setError("Toate câmpurile trebuie completate");
      return;
    }

    const formattedStartTime = `${StartTime}:00`;
    const formattedEndTime = `${EndTime}:00`;

    const reservationData = {
      ID_cont: user.ID_cont,
      classroom: selectedClassroom.name,
      date,
      StartTime: formattedStartTime,
      EndTime: formattedEndTime,
      ID_specializare: selectedSpecialization,
      ID_an: selectedYear,
      groups: selectedGroups,
    };

    console.log("Reservation Data:", reservationData);

    fetch("/api/reservation", {
      method: "POST",
      body: JSON.stringify(reservationData),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Reservation created successfully") {
          setModalMessage("Rezervarea a fost creată cu succes!");
          setModalOpen(true);
        } else {
          setError(data.error);
        }
      })
      .catch((error) => console.error(error));
  };

  return (
    <div
      id="main-content"
      className={`main-content ${collapsed ? "collapsed" : ""}`}
    >
      <div>
        <h2>Fă o Rezervare</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Classroom:
            <input type="text" value={selectedClassroom.name} readOnly />
          </label>
          <br />
          <label>
            Data Rezervării:
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <br />
          <label>
            Ora Începerii:
            <input
              type="time"
              value={StartTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </label>
          <br />
          <label>
            Ora Încheierii:
            <input
              type="time"
              value={EndTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </label>
          <br />
          <label>
            Specializare:
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
            >
              <option value="" disabled>
                Selectează Specializarea
              </option>
              {specializations.map((spec) => (
                <option key={spec.ID_specializare} value={spec.ID_specializare}>
                  {spec.Nume_specializare}
                </option>
              ))}
            </select>
          </label>
          <br />
          <label>
            An:
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="" disabled>
                Selectează Anul
              </option>
              {years.map((year) => (
                <option key={year.ID_an} value={year.ID_an}>
                  {year.Nume_an}
                </option>
              ))}
            </select>
          </label>
          <br />
          <label>
            Grupa:
            <div>
              {getUniqueGroups().map((group) => (
                <div key={group.ID_grupa}>
                  <input
                    type="checkbox"
                    value={group.ID_grupa}
                    onChange={() => handleGroupChange(group.ID_grupa)}
                  />
                  {group.Nume_grupa}
                </div>
              ))}
            </div>
          </label>
          <br />
          {error && (
            <Alert severity="error">
              <AlertTitle>Eroare</AlertTitle>
              {error} — <strong>Reintrodu datele</strong>
            </Alert>
          )}
          <button type="submit">Trimite</button>
        </form>
      </div>
      <MesajModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          navigate("/professor-dashboard");
        }}
        message={modalMessage}
      />
    </div>
  );
}

export default ReservationPage;
