import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import * as orderService from "../api/orderService";

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchOrder = async () => {
      try {
        const { data } = await orderService.getOrderById(orderId);
        if (!cancelled) setOrder(data.order);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message || "This order could not be found."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOrder();
    return () => { cancelled = true; };
  }, [orderId]);

  if (loading) {
    return (
      <section className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <p className="text-gray-500 text-sm">Loading your order...</p>
      </section>
    );
  }

  if (error || !order) {
    return (
      <section className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Order not found</h2>
          <p className="text-gray-500 text-sm mb-6">{error || "We couldn't find this order."}</p>
          <Link to="/shop" className="inline-block bg-black text-white px-6 py-3 rounded-xl font-semibold">
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully</h1>
        <p className="text-gray-500 text-sm mb-6">
          Thank you for your order! We've received it and will start processing it shortly.
        </p>

        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 text-left space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Order ID</span>
            <span className="font-semibold text-gray-800">#{order._id.slice(-8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Order Date</span>
            <span className="font-semibold text-gray-800">{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Payment Status</span>
            <span className="font-semibold text-gray-800 capitalize">{order.paymentStatus}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-gray-200 pt-3">
            <span className="text-gray-500">Total Amount</span>
            <span className="font-bold text-gray-900">₹{Number(order.totalAmount).toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/user-dashboard"
            className="flex-1 bg-black text-white py-3 rounded-xl font-semibold text-sm">
            View My Orders
          </Link>
          <Link to="/shop"
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold text-sm">
            Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OrderSuccess;
