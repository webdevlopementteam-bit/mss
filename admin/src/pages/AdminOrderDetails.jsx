import React, {
  useEffect,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

const AdminOrderDetails = () => {
  const { id } = useParams();

  const [order, setOrder] =
    useState(null);

  const [status, setStatus] =
    useState("");

  const fetchOrder = async () => {
    try {
      const res = await API.get(`/orders/admin/${id}`);

      if (res.data.success) {
        setOrder(res.data.order);
        setStatus(
          res.data.order.orderStatus
        );
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to load order");
    }
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  const updateStatus =
    async () => {
      try {
        const res = await API.put(
          `/orders/admin/status/${id}`,
          { orderStatus: status }
        );

        if (res.data.success) {
          toast.success("Status updated successfully");
          fetchOrder();
        }
      } catch (error) {
        console.error(error);
        toast.error(error?.response?.data?.message || "Failed to update status");
      }
    };

  if (!order) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">

      {/* Heading */}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          Order Details
        </h1>

        <span className="bg-gray-100 px-4 py-2 rounded-lg">
          #{order._id}
        </span>
      </div>

      {/* Customer + Address */}

      <div className="grid md:grid-cols-2 gap-6">

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-bold text-xl mb-4">
            Customer Details
          </h2>

          <p>
            <strong>Name:</strong>{" "}
            {
              order.customerInfo
                ?.fullName
            }
          </p>

          <p>
            <strong>Email:</strong>{" "}
            {
              order.customerInfo
                ?.email
            }
          </p>

          <p>
            <strong>Phone:</strong>{" "}
            {
              order.customerInfo
                ?.phone
            }
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-bold text-xl mb-4">
            Shipping Address
          </h2>

          <p>
            {
              order
                .shippingAddress
                ?.address
            }
          </p>

          <p>
            {
              order
                .shippingAddress
                ?.city
            }
            ,{" "}
            {
              order
                .shippingAddress
                ?.state
            }
          </p>

          <p>
            {
              order
                .shippingAddress
                ?.pincode
            }
          </p>

          {order
            .shippingAddress
            ?.landmark && (
            <p>
              Landmark:{" "}
              {
                order
                  .shippingAddress
                  ?.landmark
              }
            </p>
          )}
        </div>

      </div>

      {/* Prescription */}

      <div className="bg-white p-6 rounded-xl shadow mt-6">
        <h2 className="font-bold text-xl mb-4">
          Prescription
        </h2>

        {order.prescription ? (
          <a
            href={`${import.meta.env.VITE_IMAGE_BASE_URL}/${order.prescription}`}
            target="_blank"
            rel="noreferrer"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg inline-block"
          >
            View Prescription
          </a>
        ) : (
          <p>
            No Prescription Uploaded
          </p>
        )}
      </div>

      {/* Invoice */}

      <div className="bg-white p-6 rounded-xl shadow mt-6">
        <h2 className="font-bold text-xl mb-4">
          Invoice
        </h2>

        {order.invoicePdf ? (
          <a
            href={`${import.meta.env.VITE_IMAGE_BASE_URL}${order.invoicePdf}`}
            target="_blank"
            rel="noreferrer"
            className="bg-green-600 text-white px-4 py-2 rounded-lg inline-block"
          >
            Download Invoice
          </a>
        ) : (
          <p>
            Invoice Not Generated
          </p>
        )}
      </div>

      {/* Products */}

      <div className="bg-white p-6 rounded-xl shadow mt-6">
        <h2 className="font-bold text-xl mb-4">
          Ordered Products
        </h2>

        {order.orderItems?.map(
          (item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 py-4 border-b"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg"
              />

              <div>
                <h3 className="font-semibold">
                  {item.name}
                </h3>

                {item.variant?.name && (
                  <p className="text-sm text-gray-500">
                    {item.variant.name}
                    {item.variant.sku ? ` · SKU: ${item.variant.sku}` : ""}
                  </p>
                )}

                <p>
                  Quantity:{" "}
                  {
                    item.quantity
                  }
                </p>

                <p>
                  Price: ₹
                  {item.price}
                </p>
              </div>
            </div>
          )
        )}
      </div>

      {/* Order Summary */}

      <div className="bg-white p-6 rounded-xl shadow mt-6">
        <h2 className="font-bold text-xl mb-4">
          Order Summary
        </h2>

        <p>
          <strong>
            Payment Status:
          </strong>{" "}
          {
            order.paymentStatus
          }
        </p>

        <p>
          <strong>
            Payment Method:
          </strong>{" "}
          {
            order.paymentMethod
          }
        </p>

        <p>
          <strong>
            Subtotal:
          </strong>{" "}
          ₹{order.subtotal}
        </p>

        <p>
          <strong>
            Shipping:
          </strong>{" "}
          ₹
          {
            order.shippingCharge
          }
        </p>

        <p>
          <strong>GST:</strong>{" "}
          ₹{order.gst}
        </p>

        <p className="text-lg font-bold mt-2">
          Total: ₹
          {
            order.totalAmount
          }
        </p>
      </div>

      {/* Status Management */}

      <div className="bg-white p-6 rounded-xl shadow mt-6">
        <h2 className="font-bold text-xl mb-4">
          Order Status
        </h2>

        <div className="flex gap-4 flex-wrap">

          <select
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value
              )
            }
            className="border px-4 py-2 rounded-lg"
          >
            <option value="pending">
              Pending
            </option>

            <option value="confirmed">
              Confirmed
            </option>

            <option value="processing">
              Processing
            </option>

            <option value="packed">
              Packed
            </option>

            <option value="shipped">
              Shipped
            </option>

            <option value="out_for_delivery">
              Out For Delivery
            </option>

            <option value="delivered">
              Delivered
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>

          <button
            onClick={
              updateStatus
            }
            className="bg-green-600 text-white px-5 py-2 rounded-lg"
          >
            Update Status
          </button>

        </div>

        <p className="mt-4">
          Current Status:
          <strong>
            {" "}
            {
              order.orderStatus
            }
          </strong>
        </p>
      </div>

    </div>
  );
};

export default AdminOrderDetails;