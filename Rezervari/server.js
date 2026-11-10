const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const port = 8000;
const sql = require("mssql");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const { expressjwt: expressjwt } = require("express-jwt");
const session = require("express-session");
const nodemailer = require("nodemailer");
require("dotenv").config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  trustServerCertificate: true,
};

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

const secretKey = process.env.SECRET_KEY;

var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

app.post("/register", (req, res) => {
  const {
    name,
    FirstName,
    email,
    password,
    role,
    specialization,
    year,
    group,
  } = req.body;

  console.log({
    name,
    FirstName,
    email,
    password,
    role,
    specialization,
    year,
    group,
  });

  const pool = new sql.ConnectionPool(dbConfig);

  pool
    .connect()
    .then(() => {
      const checkUserQuery = `SELECT * FROM ACCOUNT WHERE Email='${email}'`;
      pool
        .request()
        .query(checkUserQuery)
        .then((checkUserResult) => {
          if (checkUserResult.recordset.length > 0) {
            res
              .status(409)
              .json({ error: "User with this email already exists" });
          } else {
            bcrypt.hash(password, 10, (err, hashedPassword) => {
              if (err) {
                console.error(err);
                res.status(500).json({ error: "Error hashing password" });
              } else {
                const insertUserQuery = `INSERT INTO ACCOUNT (Nume, Prenume, Email, Parola, Rol) 
                                         VALUES ('${name}', '${FirstName}', '${email}', '${hashedPassword}', '${role}');
                                         SELECT SCOPE_IDENTITY() AS ID_cont;`;

                pool
                  .request()
                  .query(insertUserQuery)
                  .then((insertUserResult) => {
                    const newUserId = insertUserResult.recordset[0].ID_cont;

                    if (role === "student") {
                      if (!specialization || !year || !group) {
                        return res.status(400).json({
                          error: "Missing required fields for student",
                        });
                      }

                      const insertGroupStudentQuery = `INSERT INTO GRUPA_STUDENT (ID_student, ID_grupa, ID_specializare, ID_an) 
                                                       VALUES ('${newUserId}', '${group}', '${specialization}', '${year}')`;

                      pool
                        .request()
                        .query(insertGroupStudentQuery)
                        .then(() => {
                          res.json({ message: "Registration successful" });
                        })
                        .catch((err) => {
                          console.error(err);
                          res.status(500).json({
                            error:
                              "An error occurred while inserting data into GRUPA_STUDENT",
                          });
                        });
                    } else {
                      res.json({ message: "Registration successful" });
                    }
                  })
                  .catch((err) => {
                    console.error(err);
                    res.status(500).json({
                      error:
                        "An error occurred while inserting data into ACCOUNT",
                    });
                  });
              }
            });
          }
        })
        .catch((err) => {
          console.error(err);
          res
            .status(500)
            .json({ error: "An error occurred while checking if user exists" });
        });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .json({ error: "An error occurred while connecting to the database" });
    });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log({ email, password });

  const pool = new sql.ConnectionPool(dbConfig);
  pool
    .connect()
    .then(() => {
      const loginQuery = `SELECT * FROM ACCOUNT WHERE Email='${email}'`;
      pool
        .request()
        .query(loginQuery)
        .then((loginResult) => {
          if (loginResult.recordset.length === 1) {
            const user = loginResult.recordset[0];
            bcrypt.compare(password, user.Parola, (err, result) => {
              if (err) {
                console.error(err);
                return res
                  .status(500)
                  .json({ error: "Error comparing passwords" });
              }
              if (result) {
                const token = jwt.sign({ email, role: user.Rol }, secretKey, {
                  expiresIn: "1h",
                });

                const name = user.Nume + " " + user.Prenume;

                // Salvarea ID-ului utilizatorului în sesiune
                req.session.userId = user.ID_cont; // Modificare: utilizăm ID_cont în loc de ID
                req.session.role = user.Rol;
                req.session.name = name;

                console.log("Login successful");

                res.json({
                  message: "Login successful",
                  token,
                  role: user.Rol,
                  name,
                  userId: user.ID_cont, // Trimite ID-ul utilizatorului în răspuns
                });
              } else {
                res.status(401).json({ error: "Invalid email or password" });
              }
            });
          } else {
            res.status(401).json({ error: "Invalid email or password" });
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({
            error: "An error occurred while checking user credentials",
          });
        })
        .finally(() => {
          pool.close();
        });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .json({ error: "An error occurred while connecting to the database" });
    });
});

// Middleware to verify JWT
const authenticate = expressjwt({ secret: secretKey, algorithms: ["HS256"] });

// Endpoint pentru obținerea sălilor și a rezervărilor actuale si care este folosita pentru tabelul din componenta Home.js(aka homepage/dashboard profesor)
app.get("/api/classrooms", (req, res) => {
  sql
    .connect(dbConfig)
    .then((pool) => {
      return pool.request().query(`SELECT R.Sala, R.Capacitate, 
                            CASE 
                                WHEN EXISTS (SELECT 1 FROM RESERVATION WHERE Sala = R.Sala AND Data_rezervare = CONVERT(date, GETDATE()) AND CONVERT(time, GETDATE()) BETWEEN Ora_start AND Ora_final) 
                                THEN 1 
                                ELSE 0 
                            END AS booked
                        FROM ROOM R`);
    })
    .then((result) => {
      const classrooms = result.recordset.map((room) => ({
        id: room.Sala,
        name: room.Sala,
        booked: room.booked === 1,
        capacity: room.Capacitate,
        location: "Building A, Floor 1", // ar cam trebui modificat cu info din baza de date
        bookingStartTime: null,
        bookingEndTime: null,
      }));
      res.json(classrooms);
    })
    .catch((error) => {
      console.error("SQL error", error);
      res.status(500).send("Error executing SQL query");
    });
});

// Endpoint pentru a prelua toate sălile si care este folosit pentru componenta din ClassroomBooking.js
app.get("/api/rooms", (req, res) => {
  sql
    .connect(dbConfig)
    .then((pool) => {
      return pool.request().query(`
        SELECT 
          R.Sala, 
          R.Capacitate, 
          CASE 
            WHEN EXISTS (
              SELECT 1 
              FROM RESERVATION 
              WHERE Sala = R.Sala 
                AND Data_rezervare = CONVERT(date, GETDATE()) 
                AND CONVERT(time, GETDATE()) BETWEEN Ora_start AND Ora_final
            ) THEN 1 
            ELSE 0 
          END AS booked,
          CURR_RES.Data_rezervare AS currentDate,
          CONVERT(VARCHAR, CURR_RES.Ora_start, 108) AS currentStartTime,
          CONVERT(VARCHAR, CURR_RES.Ora_final, 108) AS currentEndTime,
          NEXT_RES.Data_rezervare AS nextDate,
          CONVERT(VARCHAR, NEXT_RES.Ora_start, 108) AS nextStartTime,
          CONVERT(VARCHAR, NEXT_RES.Ora_final, 108) AS nextEndTime
        FROM ROOM R
        LEFT JOIN (
          SELECT Sala, Data_rezervare, Ora_start, Ora_final
          FROM RESERVATION
          WHERE Data_rezervare = CONVERT(date, GETDATE())
            AND CONVERT(time, GETDATE()) BETWEEN Ora_start AND Ora_final
        ) AS CURR_RES ON R.Sala = CURR_RES.Sala
        LEFT JOIN (
          SELECT Sala, MIN(Data_rezervare) AS Data_rezervare, MIN(Ora_start) AS Ora_start, MIN(Ora_final) AS Ora_final
          FROM RESERVATION
          WHERE Data_rezervare > CONVERT(date, GETDATE())
            OR (Data_rezervare = CONVERT(date, GETDATE()) AND Ora_start > CONVERT(time, GETDATE()))
          GROUP BY Sala
        ) AS NEXT_RES ON R.Sala = NEXT_RES.Sala;
      `);
    })
    .then((result) => {
      const classrooms = result.recordset.map((room) => ({
        id: room.Sala,
        name: room.Sala,
        booked: room.booked === 1,
        capacity: room.Capacitate,
        currentDate: room.currentDate,
        currentStartTime: room.currentStartTime,
        currentEndTime: room.currentEndTime,
        nextDate: room.nextDate,
        nextStartTime: room.nextStartTime,
        nextEndTime: room.nextEndTime,
      }));
      res.json(classrooms);
    })
    .catch((error) => {
      console.error("SQL error", error);
      res.status(500).send("Error executing SQL query");
    });
});

// Endpoint pentru a insera o rezervare
app.post("/api/reservation", (req, res) => {
  const {
    ID_cont,
    classroom,
    date,
    StartTime,
    EndTime,
    ID_specializare,
    ID_an,
    groups,
  } = req.body;

  if (!ID_cont) {
    return res.status(400).json({ error: "User ID is missing" });
  }

  console.log("Received reservation data:", req.body);
  console.log("sala: ", req.body.classroom);

  sql
    .connect(dbConfig)
    .then((pool) => {
      return pool
        .request()
        .input("ID_cont", sql.Int, ID_cont)
        .input("Data_rezervare", sql.Date, date)
        .input("Ora_start", sql.VarChar, StartTime)
        .input("Ora_final", sql.VarChar, EndTime)
        .input("Sala", sql.VarChar(5), classroom)
        .input("ID_specializare", sql.Int, ID_specializare)
        .input("ID_an", sql.Int, ID_an)
        .query(`INSERT INTO RESERVATION (ID_cont, Data_rezervare, Ora_start, Ora_final, Sala, ID_specializare, ID_an)
                VALUES (@ID_cont, @Data_rezervare, @Ora_start, @Ora_final, @Sala, @ID_specializare, @ID_an);
                SELECT SCOPE_IDENTITY() AS ID_rezervare;`);
    })
    .then((result) => {
      const reservationId = result.recordset[0].ID_rezervare;
      console.log("New reservation ID:", reservationId);

      const groupInsertPromises = groups.map((groupId) => {
        console.log("Inserting group ID:", groupId);
        return sql
          .connect(dbConfig)
          .then((pool) =>
            pool
              .request()
              .input("ID_rezervare", sql.Int, reservationId)
              .input("ID_grupa", sql.Int, groupId)
              .query(
                `INSERT INTO RESERVATION_GROUP (ID_rezervare, ID_grupa) VALUES (@ID_rezervare, @ID_grupa);`
              )
          );
      });

      return Promise.all(groupInsertPromises);
    })
    .then(() => {
      res.json({ message: "Reservation created successfully" });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    });
});

app.get("/api/user-info", (req, res) => {
  const userId = req.session.userId; // Asumând că ID-ul utilizatorului este stocat în sesiune

  sql
    .connect(dbConfig)
    .then((pool) => {
      return pool
        .request()
        .input("ID_cont", sql.Int, userId)
        .query("SELECT ID_cont FROM ACCOUNT WHERE ID_cont = @ID_cont");
    })
    .then((result) => {
      if (result.recordset.length > 0) {
        const user = result.recordset[0];
        res.json({
          ID_cont: userId,
        });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    });
});

app.get("/api/bookinghistory/:userId/:selectedValue", (req, res) => {
  const userId = req.params.userId;
  const selectedValue = req.params.selectedValue;

  sql.connect(dbConfig, (err) => {
    if (err) {
      console.log(err);
      res.status(500).json({ error: "Failed to connect to the database" });
    } else {
      const request = new sql.Request();
      request.input("id_cont", sql.Int, userId);
      request.input("sala", sql.VarChar(5), selectedValue);
      request.query(
        `SELECT *, 
                CONVERT(varchar(10), Data_rezervare, 120) AS Data_rezervare_str, 
                CONVERT(varchar(8), Ora_start, 108) AS Ora_start_str, 
                CONVERT(varchar(8), Ora_final, 108) AS Ora_final_str 
         FROM RESERVATION 
         WHERE ID_cont = @id_cont AND Sala = @sala 
         ORDER BY Data_rezervare DESC`,
        (err, result) => {
          if (err) {
            console.log(err);
            res.status(500).json({ error: "Failed to fetch booking history" });
          } else {
            const bookings = result.recordset.map((booking) => ({
              bookingDate: booking.Data_rezervare_str,
              bookingStartTime: booking.Ora_start_str,
              bookingEndTime: booking.Ora_final_str,
            }));
            res.json({ bookings });
          }
        }
      );
    }
  });
});

// Endpoint pentru preluarea sălilor
app.get("/api/getClassrooms", (req, res) => {
  sql.connect(dbConfig, (err) => {
    if (err) {
      console.log(err);
      res.status(500).json({ error: "Failed to connect to the database" });
    } else {
      const request = new sql.Request();
      request.query("SELECT Sala FROM ROOM", (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).json({ error: "Failed to fetch classrooms" });
        } else {
          res.json(result.recordset);
        }
      });
    }
  });
});

// Endpoint pentru căutarea rezervărilor cu filtre suplimentare
app.get("/api/searchReservations", (req, res) => {
  const { startDate, endDate, room, startTime, endTime } = req.query;

  let query =
    "SELECT Sala, Data_rezervare, Ora_start, Ora_final, " +
    "CONVERT(varchar(10), Data_rezervare, 120) AS Data_rezervare_str, " +
    "CONVERT(varchar(8), Ora_start, 108) AS Ora_start_str, " +
    "CONVERT(varchar(8), Ora_final, 108) AS Ora_final_str " +
    "FROM RESERVATION " +
    "WHERE Data_rezervare BETWEEN @startDate AND @endDate";

  if (room) {
    query += " AND Sala = @room";
  }
  if (startTime) {
    query += " AND Ora_start >= @startTime";
  }
  if (endTime) {
    query += " AND Ora_final <= @endTime";
  }

  query += " ORDER BY Data_rezervare, Ora_start";

  sql.connect(dbConfig, (err) => {
    if (err) {
      console.log(err);
      res.status(500).json({ error: "Failed to connect to the database" });
    } else {
      const request = new sql.Request();
      request.input("startDate", sql.Date, startDate);
      request.input("endDate", sql.Date, endDate);
      if (room) request.input("room", sql.VarChar, room);
      if (startTime) request.input("startTime", sql.VarChar, startTime);
      if (endTime) request.input("endTime", sql.VarChar, endTime);

      request.query(query, (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).json({ error: "Failed to fetch reservations" });
        } else {
          const bookings = result.recordset.map((booking) => ({
            classroom: booking.Sala,
            date: booking.Data_rezervare_str,
            startTime: booking.Ora_start_str,
            endTime: booking.Ora_final_str,
          }));
          res.json(bookings);
        }
      });
    }
  });
});

// Adăugare specializări
app.post("/api/specializations", (req, res) => {
  const { Nume_specializare } = req.body;
  const pool = new sql.ConnectionPool(dbConfig);
  pool
    .connect()
    .then(() => {
      const insertSpecializationQuery = `INSERT INTO SPECIALIZARE (Nume_specializare) VALUES ('${Nume_specializare}')`;
      pool
        .request()
        .query(insertSpecializationQuery)
        .then(() => {
          res.json({ message: "Specialization added" });
        })
        .catch((err) => {
          console.error(err);
          res
            .status(500)
            .json({ error: "An error occurred while adding specialization" });
        })
        .finally(() => {
          pool.close();
        });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .json({ error: "An error occurred while connecting to the database" });
    });
});

// Adăugare ani de studiu
app.post("/api/years", (req, res) => {
  const { Nume_an } = req.body;
  const pool = new sql.ConnectionPool(dbConfig);
  pool
    .connect()
    .then(() => {
      const insertYearQuery =
        "INSERT INTO AN_STUDIU (Nume_an) VALUES (@Nume_an)";
      pool
        .request()
        .input("Nume_an", sql.VarChar, Nume_an)
        .query(insertYearQuery)
        .then((result) => {
          res.status(201).json({ message: "Year added successfully" });
        })
        .catch((err) => {
          console.error(err);
          res
            .status(500)
            .json({ error: "An error occurred while adding the year" });
        })
        .finally(() => {
          pool.close();
        });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .json({ error: "An error occurred while connecting to the database" });
    });
});

// Adăugare grupe
app.post("/api/groups", (req, res) => {
  const { Nume_grupa } = req.body;
  const pool = new sql.ConnectionPool(dbConfig);
  pool
    .connect()
    .then(() => {
      const insertGroupQuery = `INSERT INTO GRUPA (Nume_grupa) VALUES ('${Nume_grupa}')`;
      pool
        .request()
        .query(insertGroupQuery)
        .then(() => {
          res.json({ message: "Group added" });
        })
        .catch((err) => {
          console.error(err);
          res
            .status(500)
            .json({ error: "An error occurred while adding group" });
        })
        .finally(() => {
          pool.close();
        });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .json({ error: "An error occurred while connecting to the database" });
    });
});

// Preluare specializări
app.get("/api/specializations", (req, res) => {
  const pool = new sql.ConnectionPool(dbConfig);
  pool
    .connect()
    .then(() => {
      const getSpecializationsQuery = "SELECT * FROM SPECIALIZARE";
      pool
        .request()
        .query(getSpecializationsQuery)
        .then((result) => {
          res.json(result.recordset);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({
            error: "An error occurred while fetching specializations",
          });
        })
        .finally(() => {
          pool.close();
        });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .json({ error: "An error occurred while connecting to the database" });
    });
});

// Preluare ani de studiu
app.get("/api/years", (req, res) => {
  const pool = new sql.ConnectionPool(dbConfig);
  pool
    .connect()
    .then(() => {
      const getYearsQuery = "SELECT * FROM AN_STUDIU";
      pool
        .request()
        .query(getYearsQuery)
        .then((result) => {
          res.json(result.recordset);
        })
        .catch((err) => {
          console.error(err);
          res
            .status(500)
            .json({ error: "An error occurred while fetching years" });
        })
        .finally(() => {
          pool.close();
        });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .json({ error: "An error occurred while connecting to the database" });
    });
});

// Preluare grupe
app.get("/api/groups", (req, res) => {
  const pool = new sql.ConnectionPool(dbConfig);
  pool
    .connect()
    .then(() => {
      const getGroupsQuery = "SELECT * FROM GRUPA";
      pool
        .request()
        .query(getGroupsQuery)
        .then((result) => {
          res.json(result.recordset);
        })
        .catch((err) => {
          console.error(err);
          res
            .status(500)
            .json({ error: "An error occurred while fetching groups" });
        })
        .finally(() => {
          pool.close();
        });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .json({ error: "An error occurred while connecting to the database" });
    });
});

// preluare de grupe unice
app.get("/api/unique-groups", (req, res) => {
  const pool = new sql.ConnectionPool(dbConfig);
  pool
    .connect()
    .then(() => {
      const getGroupsQuery = `
        SELECT DISTINCT Nume_grupa 
        FROM GRUPA`;
      pool
        .request()
        .query(getGroupsQuery)
        .then((result) => {
          res.json(result.recordset);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({
            error: "An error occurred while fetching groups",
          });
        })
        .finally(() => {
          pool.close();
        });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .json({ error: "An error occurred while connecting to the database" });
    });
});

// un nou endpoint care să returneze ID-ul unic al grupei bazat pe specializare, an și nume de grupă
app.get("/api/groups/:specialization/:year", (req, res) => {
  const { specialization, year } = req.params;
  const pool = new sql.ConnectionPool(dbConfig);

  pool
    .connect()
    .then(() => {
      const getGroupsQuery = `
        SELECT ID_grupa, Nume_grupa
        FROM GRUPA
        WHERE ID_specializare='${specialization}' AND ID_an='${year}'
      `;

      pool
        .request()
        .query(getGroupsQuery)
        .then((result) => {
          res.json(result.recordset);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({
            error: "An error occurred while fetching groups",
          });
        })
        .finally(() => {
          pool.close();
        });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .json({ error: "An error occurred while connecting to the database" });
    });
});

app.get("/api/users", (req, res) => {
  const pool = new sql.ConnectionPool(dbConfig);
  pool
    .connect()
    .then(() => {
      const query = `SELECT ID_cont AS id, Nume AS name, Prenume AS FirstName, Email AS email, Rol AS role FROM ACCOUNT`;
      pool
        .request()
        .query(query)
        .then((result) => {
          res.json(result.recordset);
        })
        .catch((err) => {
          console.error(err);
          res
            .status(500)
            .json({ error: "An error occurred while fetching users" });
        })
        .finally(() => {
          pool.close();
        });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .json({ error: "An error occurred while connecting to the database" });
    });
});

app.get("/api/users/:userId", (req, res) => {
  const userId = req.params.userId;

  const query = `
    SELECT A.*, G.Nume_grupa, S.Nume_specializare, Y.Nume_an
    FROM ACCOUNT A
    LEFT JOIN GRUPA_STUDENT GS ON A.ID_cont = GS.ID_student
    LEFT JOIN GRUPA G ON GS.ID_grupa = G.ID_grupa
    LEFT JOIN SPECIALIZARE S ON GS.ID_specializare = S.ID_specializare
    LEFT JOIN AN_STUDIU Y ON GS.ID_an = Y.ID_an
    WHERE A.ID_cont = @userId;
    
    SELECT * FROM RESERVATION WHERE ID_cont = @userId;
  `;

  const pool = new sql.ConnectionPool(dbConfig);
  pool.connect().then(() => {
    const request = pool.request();
    request
      .input("userId", sql.Int, userId)
      .query(query)
      .then((result) => {
        const user = result.recordsets[0][0]; // primul rând din primul set de rezultate
        const reservations = result.recordsets[1]; // al doilea set de rezultate

        const userDetails = {
          user: {
            id: user.ID_cont,
            name: user.Nume,
            FirstName: user.Prenume,
            email: user.Email,
            role: user.Rol,
            specialization: user.Nume_specializare,
            year: user.Nume_an,
            group: user.Nume_grupa,
          },
          reservations: reservations.map((reservation) => ({
            id: reservation.ID_rezervare,
            date: reservation.Data_rezervare,
            startTime: reservation.Ora_start,
            endTime: reservation.Ora_final,
            classroom: reservation.Sala,
          })),
        };

        res.json(userDetails);
      })
      .catch((err) => {
        console.error("Error fetching user details:", err);
        res.status(500).json({ error: "Error fetching user details" });
      })
      .finally(() => {
        pool.close();
      });
  });
});

app.delete("/api/users/:userId", async (req, res) => {
  const userId = req.params.userId;
  const pool = new sql.ConnectionPool(dbConfig);

  try {
    await pool.connect();

    // Începe o tranzacție
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    // Obține informațiile despre utilizator
    const userQuery = `
      SELECT Rol FROM ACCOUNT WHERE ID_cont = @userId;
    `;
    const userResult = await transaction
      .request()
      .input("userId", sql.Int, userId)
      .query(userQuery);

    if (userResult.recordset.length === 0) {
      throw new Error("User not found");
    }

    const userRole = userResult.recordset[0].Rol;

    if (userRole === "student") {
      // Șterge rezervările de locuri
      await transaction.request().input("userId", sql.Int, userId).query(`
          DELETE FROM SEAT_RESERVATION
          WHERE ID_student = @userId;
        `);

      // Șterge înregistrările din GRUPA_STUDENT
      await transaction.request().input("userId", sql.Int, userId).query(`
          DELETE FROM GRUPA_STUDENT
          WHERE ID_student = @userId;
        `);
    } else if (userRole === "profesor") {
      // Șterge rezervările de locuri asociate cu rezervările profesorului
      await transaction.request().input("userId", sql.Int, userId).query(`
          DELETE FROM SEAT_RESERVATION
          WHERE ID_rezervare IN (
            SELECT ID_rezervare FROM RESERVATION WHERE ID_cont = @userId
          );
        `);

      // Șterge înregistrările din RESERVATION_GROUP
      await transaction.request().input("userId", sql.Int, userId).query(`
          DELETE FROM RESERVATION_GROUP
          WHERE ID_rezervare IN (
            SELECT ID_rezervare FROM RESERVATION WHERE ID_cont = @userId
          );
        `);

      // Șterge rezervările generale
      await transaction.request().input("userId", sql.Int, userId).query(`
          DELETE FROM RESERVATION
          WHERE ID_cont = @userId;
        `);
    }

    // Șterge înregistrările din ACCOUNT
    await transaction.request().input("userId", sql.Int, userId).query(`
        DELETE FROM ACCOUNT
        WHERE ID_cont = @userId;
      `);

    // Confirmă tranzacția
    await transaction.commit();

    res
      .status(200)
      .json({ message: "User and associated data deleted successfully" });
  } catch (err) {
    console.error(err);
    // Rotează înapoi în cazul unui eșec
    if (transaction) {
      await transaction.rollback();
    }
    res
      .status(500)
      .json({ error: "An error occurred while deleting the user" });
  } finally {
    pool.close();
  }
});

app.get("/api/professor-reservations/:idProfesor", async (req, res) => {
  const idProfesor = req.params.idProfesor;
  const pool = new sql.ConnectionPool(dbConfig);

  try {
    await pool.connect();

    const query = `
      SELECT r.ID_rezervare, r.Data_rezervare, r.Ora_start, r.Ora_final, r.Sala, 
             s.Nume_specializare, a.Nume_an
      FROM RESERVATION r
      JOIN SPECIALIZARE s ON r.ID_specializare = s.ID_specializare
      JOIN AN_STUDIU a ON r.ID_an = a.ID_an
      WHERE r.ID_cont = @idProfesor AND 
            (r.Data_rezervare > CAST(GETDATE() AS DATE) OR 
            (r.Data_rezervare = CAST(GETDATE() AS DATE) AND 
             r.Ora_final > FORMAT(GETDATE(), 'HH:mm:ss')))
      GROUP BY r.ID_rezervare, r.Data_rezervare, r.Ora_start, r.Ora_final, r.Sala, 
               s.Nume_specializare, a.Nume_an
      ORDER BY r.Data_rezervare, r.Ora_start;
    `;

    const result = await pool
      .request()
      .input("idProfesor", sql.Int, idProfesor)
      .query(query);

    console.log("Query Result:", result.recordset);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching reservations" });
  } finally {
    pool.close();
  }
});

app.delete("/api/reservations/:reservationId", async (req, res) => {
  const reservationId = req.params.reservationId;
  const pool = new sql.ConnectionPool(dbConfig);

  try {
    await pool.connect();

    // Începe o tranzacție
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    // Șterge rezervările de locuri asociate cu rezervarea respectivă
    await transaction.request().input("reservationId", sql.Int, reservationId)
      .query(`
      DELETE FROM SEAT_RESERVATION
      WHERE ID_rezervare = @reservationId;
    `);

    // Șterge înregistrările din RESERVATION_GROUP
    await transaction.request().input("reservationId", sql.Int, reservationId)
      .query(`
      DELETE FROM RESERVATION_GROUP
      WHERE ID_rezervare = @reservationId;
    `);

    // Șterge rezervarea generală
    await transaction.request().input("reservationId", sql.Int, reservationId)
      .query(`
      DELETE FROM RESERVATION
      WHERE ID_rezervare = @reservationId;
    `);

    // Confirmă tranzacția
    await transaction.commit();

    res.status(200).json({ message: "Reservation deleted successfully" });
  } catch (err) {
    console.error(err);
    // Rotează înapoi în cazul unui eșec
    if (transaction) {
      await transaction.rollback();
    }
    res
      .status(500)
      .json({ error: "An error occurred while deleting the reservation" });
  } finally {
    pool.close();
  }
});

app.put("/api/users/:userId", (req, res) => {
  const userId = req.params.userId;
  const { name, FirstName, email, role } = req.body;

  const query = `
    UPDATE ACCOUNT
    SET Nume = @name, Prenume = @FirstName, Email = @email, Rol = @role
    WHERE ID_cont = @userId;
  `;

  const pool = new sql.ConnectionPool(dbConfig);
  pool.connect().then(() => {
    const request = pool.request();
    request
      .input("userId", sql.Int, userId)
      .input("name", sql.VarChar(20), name)
      .input("FirstName", sql.VarChar(50), FirstName)
      .input("email", sql.VarChar(50), email)
      .input("role", sql.VarChar(10), role)
      .query(query)
      .then(() => {
        res.json({ message: "User updated successfully" });
      })
      .catch((err) => {
        console.error("Error updating user:", err);
        res.status(500).json({ error: "Error updating user" });
      })
      .finally(() => {
        pool.close();
      });
  });
});

app.get("/api/student-info", (req, res) => {
  const userId = req.session.userId;

  sql
    .connect(dbConfig)
    .then((pool) => {
      return pool.request().input("ID_student", sql.Int, userId)
        .query(`SELECT A.ID_cont, A.Nume, A.Prenume, G.ID_grupa, G.ID_specializare, G.ID_an
                FROM ACCOUNT A
                JOIN GRUPA_STUDENT GS ON A.ID_cont = GS.ID_student
                JOIN GRUPA G ON GS.ID_grupa = G.ID_grupa
                WHERE A.ID_cont = @ID_student`);
    })
    .then((result) => {
      if (result.recordset.length > 0) {
        res.json(result.recordset[0]);
      } else {
        res.status(404).json({ error: "Student not found" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    });
});

app.get("/api/student-reservations", async (req, res) => {
  const studentId = req.session.userId; // presupunem că ID-ul studentului este extras din sesiunea curentă

  try {
    const pool = await sql.connect(dbConfig);

    const reservations = await pool
      .request()
      .input("ID_student", sql.Int, studentId).query(`
        SELECT r.ID_rezervare, r.Data_rezervare, r.Ora_start, r.Ora_final, r.Sala,
               sr.Numar_loc, sr.ID_student AS SeatReservedBy
        FROM RESERVATION r
        LEFT JOIN SEAT_RESERVATION sr ON r.ID_rezervare = sr.ID_rezervare AND sr.ID_student = @ID_student
        WHERE EXISTS (
          SELECT 1
          FROM GRUPA_STUDENT gs
          JOIN RESERVATION_GROUP rg ON gs.ID_grupa = rg.ID_grupa
          WHERE gs.ID_student = @ID_student
            AND rg.ID_rezervare = r.ID_rezervare
        )
        AND (r.Data_rezervare > CAST(GETDATE() AS DATE) OR (r.Data_rezervare = CAST(GETDATE() AS DATE)))
      `);

    res.json(reservations.recordset);
  } catch (error) {
    console.error("Error fetching student reservations:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// Endpoint pentru preluarea locurilor ocupate pentru o anumită rezervare
app.get("/api/occupied-seats/:reservationId", (req, res) => {
  const reservationId = req.params.reservationId;

  sql
    .connect(dbConfig)
    .then((pool) => {
      return pool.request().input("ID_rezervare", sql.Int, reservationId)
        .query(`
        SELECT Numar_loc FROM SEAT_RESERVATION WHERE ID_rezervare = @ID_rezervare
      `);
    })
    .then((result) => {
      res.json(result.recordset);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    });
});

// Endpoint pentru inserarea unei rezervări de loc
app.post("/api/reserve-seat", (req, res) => {
  const { reservationId, studentId, seatNumber } = req.body;

  if (isNaN(reservationId) || isNaN(studentId) || isNaN(seatNumber)) {
    return res.status(400).json({ error: "Invalid input data" });
  }

  sql
    .connect(dbConfig)
    .then((pool) => {
      return pool
        .request()
        .input("ID_rezervare", sql.Int, reservationId)
        .input("ID_student", sql.Int, studentId)
        .input("Numar_loc", sql.Int, seatNumber).query(`
          INSERT INTO SEAT_RESERVATION (ID_rezervare, ID_student, Numar_loc)
          VALUES (@ID_rezervare, @ID_student, @Numar_loc)
        `);
    })
    .then(() => {
      res.status(200).json({ message: "Seat reserved successfully" });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    });
});

// Endpoint pentru a obține detaliile utilizatorului curent
app.get("/api/current-user", (req, res) => {
  if (req.session.userId) {
    res.json({ studentId: req.session.userId });
  } else {
    res.status(401).json({ error: "User not authenticated" });
  }
});

// Endpoint pentru a obține detaliile unei rezervări
app.get("/api/reservation-details/:reservationId", (req, res) => {
  const reservationId = req.params.reservationId;

  sql
    .connect(dbConfig)
    .then((pool) => {
      return pool.request().input("ID_rezervare", sql.Int, reservationId)
        .query(`
          SELECT r.ID_rezervare, r.Data_rezervare, r.Ora_start, r.Ora_final, r.Sala
          FROM RESERVATION r
          WHERE r.ID_rezervare = @ID_rezervare
        `);
    })
    .then((result) => {
      if (result.recordset.length > 0) {
        const reservation = result.recordset[0];
        res.json({
          roomName: reservation.Sala,
          date: reservation.Data_rezervare,
          time: `${reservation.Ora_start.slice(
            0,
            5
          )} - ${reservation.Ora_final.slice(0, 5)}`,
        });
      } else {
        res.status(404).json({ error: "Reservation not found" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    });
});

// Endpoint pentru a obține istoricul rezervărilor pentru un student specific
app.get("/api/seatbookinghistory/:studentId/:classroom", (req, res) => {
  const { studentId, classroom } = req.params;

  sql
    .connect(dbConfig)
    .then((pool) => {
      return pool
        .request()
        .input("ID_student", sql.Int, studentId)
        .input("Sala", sql.VarChar, classroom).query(`
          SELECT r.Sala, r.Data_rezervare, r.Ora_start, r.Ora_final, sr.Numar_loc,
                 CONVERT(varchar(10), r.Data_rezervare, 120) AS Data_rezervare_str, 
                 CONVERT(varchar(8), r.Ora_start, 108) AS Ora_start_str, 
                 CONVERT(varchar(8), r.Ora_final, 108) AS Ora_final_str 
          FROM RESERVATION r
          JOIN SEAT_RESERVATION sr ON r.ID_rezervare = sr.ID_rezervare
          WHERE sr.ID_student = @ID_student AND r.Sala = @Sala
          ORDER BY r.Data_rezervare DESC
        `);
    })
    .then((result) => {
      const bookings = result.recordset.map((booking) => ({
        room: booking.Sala,
        bookingDate: booking.Data_rezervare_str,
        bookingStartTime: booking.Ora_start_str,
        bookingEndTime: booking.Ora_final_str,
        seatNumber: booking.Numar_loc,
      }));
      res.json({ bookings });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    });
});

// endpoint-uri folosite in AdminDashboard (pentru statisticile prezentate)

app.get("/api/user-count", (req, res) => {
  const pool = new sql.ConnectionPool(dbConfig);
  pool
    .connect()
    .then(() => {
      const query = "SELECT COUNT(*) AS userCount FROM ACCOUNT";
      return pool.request().query(query);
    })
    .then((result) => {
      res.json(result.recordset[0]);
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching user count" });
    })
    .finally(() => {
      pool.close();
    });
});

app.get("/api/recent-reservations-count", (req, res) => {
  const pool = new sql.ConnectionPool(dbConfig);
  pool
    .connect()
    .then(() => {
      const query = `
        SELECT COUNT(*) AS recentReservationsCount 
        FROM RESERVATION 
        WHERE Data_rezervare >= DATEADD(day, -7, GETDATE())`;
      return pool.request().query(query);
    })
    .then((result) => {
      res.json(result.recordset[0]);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({
        error: "An error occurred while fetching recent reservations count",
      });
    })
    .finally(() => {
      pool.close();
    });
});

app.get("/api/classroom-count", (req, res) => {
  const pool = new sql.ConnectionPool(dbConfig);
  pool
    .connect()
    .then(() => {
      const query = "SELECT COUNT(*) AS classroomCount FROM ROOM";
      return pool.request().query(query);
    })
    .then((result) => {
      res.json(result.recordset[0]);
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching classroom count" });
    })
    .finally(() => {
      pool.close();
    });
});

app.get("/api/available-classroom-count", (req, res) => {
  const pool = new sql.ConnectionPool(dbConfig);
  pool
    .connect()
    .then(() => {
      const query = `
        SELECT COUNT(*) AS availableClassroomCount 
        FROM ROOM R
        WHERE NOT EXISTS (
          SELECT 1 
          FROM RESERVATION 
          WHERE Sala = R.Sala 
          AND Data_rezervare = CONVERT(date, GETDATE()) 
          AND CONVERT(time, GETDATE()) BETWEEN Ora_start AND Ora_final
        )`;
      return pool.request().query(query);
    })
    .then((result) => {
      res.json(result.recordset[0]);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({
        error: "An error occurred while fetching available classroom count",
      });
    })
    .finally(() => {
      pool.close();
    });
});

app.get("/api/student-count", (req, res) => {
  const pool = new sql.ConnectionPool(dbConfig);
  pool
    .connect()
    .then(() => {
      const query =
        "SELECT COUNT(*) AS studentCount FROM ACCOUNT WHERE Rol = 'student'";
      return pool.request().query(query);
    })
    .then((result) => {
      res.json({ studentCount: result.recordset[0].studentCount });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching student count" });
    })
    .finally(() => {
      pool.close();
    });
});

app.get("/api/profesor-count", (req, res) => {
  const pool = new sql.ConnectionPool(dbConfig);
  pool
    .connect()
    .then(() => {
      const query =
        "SELECT COUNT(*) AS professorCount FROM ACCOUNT WHERE Rol = 'profesor'";
      return pool.request().query(query);
    })
    .then((result) => {
      res.json({ professorCount: result.recordset[0].professorCount });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching professor count" });
    })
    .finally(() => {
      pool.close();
    });
});

app.get("/api/admin-count", (req, res) => {
  const pool = new sql.ConnectionPool(dbConfig);
  pool
    .connect()
    .then(() => {
      const query =
        "SELECT COUNT(*) AS adminCount FROM ACCOUNT WHERE Rol = 'admin'";
      return pool.request().query(query);
    })
    .then((result) => {
      res.json({ adminCount: result.recordset[0].adminCount });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching admin count" });
    })
    .finally(() => {
      pool.close();
    });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
