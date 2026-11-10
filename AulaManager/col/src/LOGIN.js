import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "./login.css";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  function validateForm() {
    return email.length > 0 && password.length > 0;
  }

  function handleSubmit(event) {
    event.preventDefault();

    fetch("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data); // Debug log

        if (data.message === "Login successful") {
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", data.role);
          localStorage.setItem("name", data.name);
          localStorage.setItem("userId", data.userId);

          onLogin(data.name, data.role);

          if (data.role === "profesor") {
            navigate("/home");
          } else if (data.role === "admin") {
            navigate("/admin/dashboard");
          } else if (data.role === "student") {
            navigate("/student-dashboard");
          } else {
            navigate("/");
          }
        } else {
          setErrorMessage(
            "Parola introdusă este greșită sau nu există cont cu acest email"
          );
        }
      })
      .catch((error) => {
        console.error(error);
        setErrorMessage("A apărut o eroare. Te rugăm să încerci din nou.");
      });
  }

  return (
    <div className="Login">
      <Form onSubmit={handleSubmit}>
        <Form.Group size="lg" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            autoFocus
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group size="lg" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        {errorMessage && (
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            {errorMessage} — <strong>Reintrodu Datele</strong>
          </Alert>
        )}
        <Button block="true" size="lg" type="submit" disabled={!validateForm()}>
          Login
        </Button>
      </Form>
    </div>
  );
}
