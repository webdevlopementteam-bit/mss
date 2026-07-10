import API from "./axios";

export const createOrder = (formData) => API.post("/orders/create", formData);
export const getMyOrders = () => API.get("/orders/my-orders");
export const getOrderById = (id) => API.get(`/orders/${id}`);
export const cancelOrder = (id) => API.put(`/orders/cancel/${id}`);
