import React from "react";
import { Link } from "react-router-dom";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const PaymentSuccess = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-green-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-green-600">Payment Successful!</h2>
        <p className="text-gray-700 mt-4 mb-6">
          Your appointment has been successfully booked and confirmed.
        </p>
        <Link
          to="/my-appointments"
          className="inline-block bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition"
        >
          Go to My Appointments
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
