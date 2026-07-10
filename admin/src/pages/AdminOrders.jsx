import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders/admin/all");

      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading)
    return (
      <div className="p-10">
        Loading Orders...
      </div>
    );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          Orders
        </h1>

        <span className="text-gray-500">
          Total Orders: {orders.length}
        </span>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-4 text-left">
                Order ID
              </th>
              <th className="p-4 text-left">
                Customer
              </th>
              <th className="p-4 text-left">
                Phone
              </th>
              <th className="p-4 text-left">
                Total
              </th>
              <th className="p-4 text-left">
                Status
              </th>
              <th className="p-4 text-left">
                Date
              </th>
              <th className="p-4 text-left">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order._id}
                className="border-b"
              >
                <td className="p-4">
                  {order._id.slice(-8)}
                </td>

                <td className="p-4">
                  {
                    order.customerInfo
                      ?.fullName
                  }
                </td>

                <td className="p-4">
                  {
                    order.customerInfo
                      ?.phone
                  }
                </td>

                <td className="p-4">
                  ₹{order.totalAmount}
                </td>

                <td className="p-4">
                  <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm">
                    {order.orderStatus}
                  </span>
                </td>

                <td className="p-4">
                  {new Date(
                    order.createdAt
                  ).toLocaleDateString()}
                </td>

               <td className="p-4">
  <button
    onClick={() => navigate(`/orders/${order._id}`)}
    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
  >
    View Details
  </button>
</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
