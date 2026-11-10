import React, { useState, useEffect } from "react";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./bookinghistory.css";
import logo from "../src/images/logo_uvt.png";

const BOOKINGHISTORY = () => {
  const [studentFeatureIndex, setStudentFeatureIndex] = useState(0);
  const [professorFeatureIndex, setProfessorFeatureIndex] = useState(0);
  const [studentLastInteraction, setStudentLastInteraction] = useState(
    Date.now()
  );
  const [professorLastInteraction, setProfessorLastInteraction] = useState(
    Date.now()
  );

  const navigate = useNavigate();

  const studentFeatures = [
    {
      title: "Selectarea Locurilor",
      description:
        "Studenții pot vizualiza harta sălii și pot alege locul dorit, dacă această opțiune este disponibilă. Platforma arată locurile disponibile și cele blocate, permițând o selecție informată și personalizată.",
    },
    {
      title: "Programări",
      description:
        "Studenții pot vizualiza programările viitoare ale examenelor.",
    },
    {
      title: "Istoric rezervari",
      description:
        "Platforma stochează istoricul datelor, orelor rezervarilor anterioare și locurilor ocupate de acestia. Studenții pot folosi aceste informații pentru a monitoriza rezervarile din cadrul diferitelor examene.",
    },
  ];

  const professorFeatures = [
    {
      title: "Rezervare și Planificare",
      description:
        "Interfața permite profesorilor să rezerve săli de examen rapid și eficient. Aceștia pot selecta data și intervalul orar pentru rezervarea salii si pot vizualiza disponibilitatea sălilor in cativa pasi simplii.",
    },
    {
      title: "Istoric rezervari",
      description:
        "Platforma ofera detalii legate de rezervarile de sali create anterior sau in prezent.",
    },
    {
      title: "Obtinere informatii utile",
      description:
        "Profesorii pot obtine informatii utile in planificarea unei rezervari prin cautarea pe platforma a programului de disponibilitate a unei sali",
    },
  ];

  const nextFeature = (index, setIndex, featuresLength, setLastInteraction) => {
    setIndex((prevIndex) => (prevIndex + 1) % featuresLength);
    setLastInteraction(Date.now());
  };

  const prevFeature = (index, setIndex, featuresLength, setLastInteraction) => {
    setIndex((prevIndex) => (prevIndex - 1 + featuresLength) % featuresLength);
    setLastInteraction(Date.now());
  };

  const handleIndicatorClick = (index, setIndex, setLastInteraction) => {
    setIndex(index);
    setLastInteraction(Date.now());
  };

  useEffect(() => {
    const studentTimer = setInterval(() => {
      if (Date.now() - studentLastInteraction >= 10000) {
        nextFeature(
          studentFeatureIndex,
          setStudentFeatureIndex,
          studentFeatures.length,
          setStudentLastInteraction
        );
      }
    }, 10000);

    return () => clearInterval(studentTimer);
  }, [studentLastInteraction, studentFeatureIndex]);

  useEffect(() => {
    const professorTimer = setInterval(() => {
      if (Date.now() - professorLastInteraction >= 10000) {
        nextFeature(
          professorFeatureIndex,
          setProfessorFeatureIndex,
          professorFeatures.length,
          setProfessorLastInteraction
        );
      }
    }, 10000);

    return () => clearInterval(professorTimer);
  }, [professorLastInteraction, professorFeatureIndex]);

  const handleStartNow = () => {
    navigate("/login");
  };

  return (
    <div className="homepage">
      <header className="homepage-header">
        <img src={logo} alt="Logo" className="logo" />
        <nav className="navbar">
          <a href="#">Acasă</a>
          <a href="#">Despre</a>
          <a href="#">Contact</a>
          <button onClick={() => navigate("/login")} className="login-btn">
            Autentificare
          </button>
        </nav>
      </header>
      <section className="hero">
        <div className="hero-content">
          <h1>
            Bine ați venit pe platforma noastră de gestionare a sălilor de
            examen!
          </h1>
          <p>
            O soluție eficientă și intuitivă pentru profesori și studenți
            deopotrivă.
          </p>
          <button onClick={handleStartNow} className="cta-btn">
            Începeți acum
          </button>
        </div>
      </section>
      <section className="about-platform">
        <h2>Prezentare Succintă a Platformei și a Beneficiilor Sale</h2>
        <p>
          Platforma noastră reprezintă un instrument esențial pentru
          universități, profesori și studenți, facilitând rezervarea sălilor de
          examen și gestionarea locurilor pentru studenți. Profesorii pot
          rezerva săli de examen. Studenții își pot selecta locurile dorite din
          sălile disponibile in care acestia au fost atribuiti de profesori.
          Această platformă aduce beneficii semnificative prin reducerea
          timpului și a efortului necesar pentru organizarea logistică a
          examenelor, oferind în același timp o transparență și flexibilitate
          sporita.
        </p>
      </section>
      <section className="user-features">
        <h2>Funcționalități pentru Utilizatori</h2>
        <div className="features-carousel">
          <div className="feature-category">
            <h3 className="feature-title">Funcționalități pentru Studenți</h3>
            <div className="feature-card">
              <h3>{studentFeatures[studentFeatureIndex].title}</h3>
              <p>{studentFeatures[studentFeatureIndex].description}</p>
              <div className="carousel-indicators">
                {studentFeatures.map((_, index) => (
                  <div
                    key={index}
                    className={index === studentFeatureIndex ? "active" : ""}
                    onClick={() =>
                      handleIndicatorClick(
                        index,
                        setStudentFeatureIndex,
                        setStudentLastInteraction
                      )
                    }
                  />
                ))}
              </div>
              <div className="carousel-controls">
                <button
                  onClick={() =>
                    prevFeature(
                      studentFeatureIndex,
                      setStudentFeatureIndex,
                      studentFeatures.length,
                      setStudentLastInteraction
                    )
                  }
                >
                  <FaArrowLeft />
                </button>
                <button
                  onClick={() =>
                    nextFeature(
                      studentFeatureIndex,
                      setStudentFeatureIndex,
                      studentFeatures.length,
                      setStudentLastInteraction
                    )
                  }
                >
                  <FaArrowRight />
                </button>
              </div>
            </div>
          </div>
          <div className="feature-category">
            <h3 className="feature-title">Funcționalități pentru Profesori</h3>
            <div className="feature-card">
              <h3>{professorFeatures[professorFeatureIndex].title}</h3>
              <p>{professorFeatures[professorFeatureIndex].description}</p>
              <div className="carousel-indicators">
                {professorFeatures.map((_, index) => (
                  <div
                    key={index}
                    className={index === professorFeatureIndex ? "active" : ""}
                    onClick={() =>
                      handleIndicatorClick(
                        index,
                        setProfessorFeatureIndex,
                        setProfessorLastInteraction
                      )
                    }
                  />
                ))}
              </div>
              <div className="carousel-controls">
                <button
                  onClick={() =>
                    prevFeature(
                      professorFeatureIndex,
                      setProfessorFeatureIndex,
                      professorFeatures.length,
                      setProfessorLastInteraction
                    )
                  }
                >
                  <FaArrowLeft />
                </button>
                <button
                  onClick={() =>
                    nextFeature(
                      professorFeatureIndex,
                      setProfessorFeatureIndex,
                      professorFeatures.length,
                      setProfessorLastInteraction
                    )
                  }
                >
                  <FaArrowRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer className="homepage-footer">
        <div className="footer-links">
          <a href="#">Termeni și condiții</a>
          <a href="#">Politica de confidențialitate</a>
        </div>
        <div className="contact-info">
          <p>Email: contact@e-uvt.ro</p>
          <p>Telefon: +123 456 789</p>
        </div>
        <div className="social-media">
          <a href="#">
            <FaFacebook />
          </a>
          <a href="#">
            <FaTwitter />
          </a>
          <a href="#">
            <FaInstagram />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default BOOKINGHISTORY;
