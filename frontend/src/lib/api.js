import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

export const verifyPin = (pin) => api.post("/auth/verify-pin", { pin });
export const specialistLogin = (access_code) => api.post("/auth/specialist-login", { access_code }).then((r) => r.data);

export const fetchBranches = () => api.get("/branches").then((r) => r.data);
export const createBranch = (data) => api.post("/branches", data).then((r) => r.data);
export const updateBranch = (id, data) => api.put(`/branches/${id}`, data).then((r) => r.data);
export const deleteBranch = (id) => api.delete(`/branches/${id}`).then((r) => r.data);

export const fetchSpecialists = (params = {}) => api.get("/specialists", { params }).then((r) => r.data);
export const createSpecialist = (data) => api.post("/specialists", data).then((r) => r.data);
export const updateSpecialist = (id, data) => api.put(`/specialists/${id}`, data).then((r) => r.data);
export const deleteSpecialist = (id) => api.delete(`/specialists/${id}`).then((r) => r.data);

export const fetchServices = () => api.get("/services").then((r) => r.data);
export const createService = (data) => api.post("/services", data).then((r) => r.data);
export const updateService = (id, data) => api.put(`/services/${id}`, data).then((r) => r.data);
export const deleteService = (id) => api.delete(`/services/${id}`).then((r) => r.data);

export const fetchAppointments = (params = {}) => api.get("/appointments", { params }).then((r) => r.data);
export const createAppointment = (data) => api.post("/appointments", data).then((r) => r.data);
export const updateAppointmentStatus = (id, status) => api.patch(`/appointments/${id}`, { status }).then((r) => r.data);
export const deleteAppointment = (id) => api.delete(`/appointments/${id}`).then((r) => r.data);

export const fetchClients = (q) => api.get("/clients", { params: q ? { q } : {} }).then((r) => r.data);
