import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Modal,
  Box,
  Typography,
  TablePagination,
} from "@mui/material";

import { useSidebar } from "./SidebarContext";

const fetchUsers = () => {
  return fetch("/api/users")
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error fetching users:", error);
      throw error;
    });
};

const fetchUserDetails = (userId) => {
  return fetch(`/api/users/${userId}`)
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error fetching user details:", error);
      throw error;
    });
};

const deleteUser = async (userId) => {
  return fetch(`/api/users/${userId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error deleting user:", error);
      throw error;
    });
};

const AdminUsersList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { collapsed } = useSidebar();

  useEffect(() => {
    fetchUsers().then((data) => setUsers(data));
  }, []);

  useEffect(() => {
    const filterUsers = users.filter((user) => {
      const matchesSearch =
        (user.name &&
          user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.FirstName &&
          user.FirstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email &&
          user.email.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesRole = filterRole ? user.role === filterRole : true;
      return matchesSearch && matchesRole;
    });
    setFilteredUsers(filterUsers);
  }, [users, searchTerm, filterRole]);

  const handleOpenDetails = (user) => {
    setSelectedUser(user);
    fetchUserDetails(user.id).then((data) => setUserDetails(data));
    setOpenDetails(true);
  };

  const handleOpenConfirmation = (user) => {
    setSelectedUser(user);
    setOpenConfirmation(true);
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser(selectedUser.id);
      setUsers(users.filter((user) => user.id !== selectedUser.id));
    } catch (error) {
      console.error("Failed to delete user:", error);
    } finally {
      setOpenConfirmation(false);
      setSelectedUser(null);
    }
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setUserDetails(null);
  };

  const handleCloseConfirmation = () => {
    setOpenConfirmation(false);
    setSelectedUser(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div
      id="main-content"
      className={`main-content ${collapsed ? "collapsed" : ""}`}
    >
      <Container>
        <Typography variant="h4" gutterBottom>
          Lista utilizatori
        </Typography>

        <Box display="flex" justifyContent="space-between" mb={2}>
          <TextField
            label="Cauta"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FormControl variant="outlined" style={{ minWidth: 200 }}>
            <InputLabel>Tip utilizator</InputLabel>
            <Select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              label="Role"
            >
              <MenuItem value="">
                <em>Niciunul</em>
              </MenuItem>
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="profesor">Profesor</MenuItem>
              <MenuItem value="admin">Administrator</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nume</TableCell>
                <TableCell>Prenume</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Tip utilizator</TableCell>
                <TableCell>Detalii</TableCell>
                <TableCell>Ștergere</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.FirstName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        onClick={() => handleOpenDetails(user)}
                      >
                        Mai multe detalii
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        color="error"
                        variant="contained"
                        onClick={() => handleOpenConfirmation(user)}
                      >
                        Sterge cont
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>

        <Modal open={openDetails} onClose={handleCloseDetails}>
          <Box
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              backgroundColor: "white",
              padding: 20,
              boxShadow: 24,
            }}
          >
            {userDetails ? (
              <div>
                <Typography variant="h6" gutterBottom>
                  {selectedUser.name} {selectedUser.FirstName}
                </Typography>
                {selectedUser.role === "student" ? (
                  <div>
                    <Typography variant="subtitle1">
                      Specializare: {userDetails.user.specialization}
                    </Typography>
                    <Typography variant="subtitle1">
                      An: {userDetails.user.year}
                    </Typography>
                    <Typography variant="subtitle1">
                      Grupă: {userDetails.user.group}
                    </Typography>
                  </div>
                ) : null}
              </div>
            ) : (
              <Typography>Loading...</Typography>
            )}
          </Box>
        </Modal>

        <Modal open={openConfirmation} onClose={handleCloseConfirmation}>
          <Box
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              backgroundColor: "white",
              padding: 20,
              boxShadow: 24,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Ești sigur că vrei să ștergi acest cont?
            </Typography>
            <Box display="flex" justifyContent="space-between" mt={2}>
              <Button
                variant="outlined"
                color="error"
                onClick={handleDeleteUser}
              >
                Da
              </Button>
              <Button variant="outlined" onClick={handleCloseConfirmation}>
                Nu
              </Button>
            </Box>
          </Box>
        </Modal>
      </Container>
    </div>
  );
};

export default AdminUsersList;
