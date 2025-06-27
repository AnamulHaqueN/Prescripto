import React, { useContext, useEffect, useState } from "react";
import { doctors } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);

  const [appointments, setAppointments] = useState([]);

  const months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",];

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("_");
    return (
      dateArray[0] + " " + months[Number(dateArray[1]) - 1] + " " + dateArray[2]
    );
  };

   // ✅ Fetch user appointments
  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, {
        headers: { token },
      });
      if (data.success) {
        setAppointments(data.appointments.reverse()); // newest first
      } else {
        toast.error("Failed to fetch appointments");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  // ✅ Cancel appointment
  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/cancel-appointment`,
        { appointmentId },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData(); // refresh slots
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  // ✅ Handle AmarPay payment
  const handlePayment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/payment-amarpay`,
        { appointmentId },
        { headers: { token } }
      );
      if (data.success) {
        // Redirect to AmarPay payment URL
        window.location.href = data.paymentUrl;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);



  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b ">
        My appointments
      </p>
      <div>
        {appointments.map((item, index) => (
          <div
            className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-2 "
            key={index}
          >
            <div>
              <img
                className="w-32 bg-indigo-50 "
                src={item.docData.image}
                alt=""
              />
            </div>
            <div className="flex-1 text-sm text-zinc-600 ">
              <p className="text-neutral-800 font-semibold ">
                {item.docData.name}
              </p>
              <p>{item.docData.speciality}</p>
              <p className="text-zinc-700 font-medium mt-1 ">Address:</p>
              <p className="text-xs">{item.docData.address.line1}</p>
              <p className="text-xs mt-1">{item.docData.address.line2}</p>
              <p>
                <span className="text-sm text-neutral-700 font-medium ">
                  Date & Time:
                </span>{" "}
                {slotDateFormat(item.slotDate)} | {item.slotTime}
              </p>
            </div>
            <div></div>
            <div className="flex flex-col gap-2 justify-end ">
              {!item.cancelled && item.payment && (<button className="text-sm text-center sm:min-w-48 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-all duration-300">Paid</button>)}
              {!item.cancelled && !item.payment && (<button onClick={() => handlePayment(item._id)} className="text-sm text-stone-500 text-center sm:min-w-48 py-2 hover:bg-primary hover:text-white transition-all duration-300">Pay Online</button>)}
              {item.paid && !item.cancelled && (<button className="sm:min-w-48 py-2 border border-green-500 rounded text-green-500">Payment Completed</button>)}
              {!item.cancelled && (<button onClick={() => cancelAppointment(item._id)} className="text-sm text-stone-500 text-center sm:min-w-48 py-2 hover:bg-red-600 hover:text-white transition-all duration-300 ">  Cancel appointment</button>)}
              {item.cancelled && (<button className="sm:min-w-48 py-2 border border-red-500 rounded text-red-500">Appointment cancelled</button>)} 
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;
