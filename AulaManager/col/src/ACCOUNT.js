import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import "./Account.css";
import { useSidebar } from "./SidebarContext";
import MesajModal from "./MesajModal";

function AccountPage() {
  const [name, setName] = useState("");
  const [FirstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student");
  const [specialization, setSpecialization] = useState("");
  const [year, setYear] = useState("");
  const [group, setGroup] = useState("");
  const [error, setError] = useState("");

  const [specializations, setSpecializations] = useState([]);
  const [years, setYears] = useState([]);
  const [groups, setGroups] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const { collapsed } = useSidebar();

  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/specializations")
      .then((response) => response.json())
      .then((data) => setSpecializations(data))
      .catch((error) =>
        console.error("Error fetching specializations:", error)
      );

    fetch("/api/years")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched years:", data); // Verificare date primite
        setYears(data);
      })
      .catch((error) => console.error("Error fetching years:", error));
  }, []);

  useEffect(() => {
    if (specialization && year) {
      fetch(`/api/groups/${specialization}/${year}`)
        .then((response) => response.json())
        .then((data) => setGroups(data))
        .catch((error) => console.error("Error fetching groups:", error));
    }
  }, [specialization, year]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("Parolele introduse nu sunt identice");
      return;
    }

    if (role === "student" && (!specialization || !year || !group)) {
      setError("Missing required fields for student");
      return;
    }

    const userData = {
      name,
      FirstName,
      email,
      password,
      role,
      specialization: role === "student" ? specialization : null,
      year: role === "student" ? year : null,
      group: role === "student" ? group : null,
    };

    fetch("/register", {
      method: "POST",
      body: JSON.stringify(userData),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);

        if (data.message === "Registration successful") {
          setModalMessage("Succes! Utilizatorul a fost inregistrat");
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
      <div className="Account">
        <h2>Creează un cont</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Nume:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <br />
          <label>
            Prenume:
            <input
              type="text"
              value={FirstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </label>
          <br />
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <br />
          <label>
            Parola:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <br />
          <label>
            Confirmă Parola:
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </label>
          <br />
          <label>
            Rol:
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="profesor">Profesor</option>
              <option value="admin">Administrator</option>
            </select>
          </label>
          <br />
          {role === "student" && (
            <>
              <label>
                Specializare:
                <select
                  value={specialization}
                  onChange={(e) => {
                    console.log("Specialization selected:", e.target.value);
                    setSpecialization(e.target.value);
                  }}
                >
                  <option value="">Select Specializare</option>
                  {specializations.map((spec) => (
                    <option
                      key={spec.ID_specializare}
                      value={spec.ID_specializare}
                    >
                      {spec.Nume_specializare}
                    </option>
                  ))}
                </select>
              </label>
              <br />
              <label>
                An:
                <select
                  value={year}
                  onChange={(e) => {
                    console.log("Year selected:", e.target.value);
                    setYear(e.target.value);
                  }}
                >
                  <option value="">Select An</option>
                  {years.map((yr) => (
                    <option key={yr.ID_an} value={yr.ID_an}>
                      {yr.Nume_an}
                    </option>
                  ))}
                </select>
              </label>
              <br />
              <label>
                Grupa:
                <select
                  value={group}
                  onChange={(e) => {
                    console.log("Group selected:", e.target.value);
                    setGroup(e.target.value);
                  }}
                >
                  <option value="">Select Grupa</option>
                  {groups.map((grp) => (
                    <option key={grp.ID_grupa} value={grp.ID_grupa}>
                      {grp.Nume_grupa}
                    </option>
                  ))}
                </select>
              </label>
              <br />
            </>
          )}
          {error && (
            <Alert severity="error">
              <AlertTitle>Error</AlertTitle>
              {error} — <strong>Reintrodu Datele</strong>
            </Alert>
          )}
          <button type="submit">Creează Contul</button>
        </form>
      </div>
      <MesajModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          navigate("/admin/dashboard");
        }}
        message={modalMessage}
      />
    </div>
  );
}

export default AccountPage;
