import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import doctorModel from '../models/doctorModel.js'
import notificationModel from '../models/notificationModel.js';
import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary'
import appointmentModel from '../models/appointmentModel.js'
import axios from 'axios'
import qs from "qs";

// API to register user
const registerUser = async (req, res) => {

    try {

        const {name, email, password} = req.body

        if(!name || !email || !password) {
            return res.json({success:false, message: "Missing Details"})
        }
        
        // validating email
        if(!validator.isEmail(email)) {
            return res.json({success:false, message:"enter a valid email"})
        }

        // validating strong password
        if(password.length < 8) {
            return res.json({success:false, message:"enter a strong password"})
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        
        const userData = {
            name,
            email,
            password : hashedPassword
        }
        
        const newUser = new userModel(userData)
        const user = await newUser.save()

        //create token for user
        const token = jwt.sign({id:user._id}, process.env.JWT_SECRET)

        res.json({success:true, token})

    } catch (error) {
       console.log(error)
       res.json({success:false, message:error.message})
    }

}

// API to login user
const loginUser = async (req, res) => {

    try {

        const {email, password} = req.body
        const user = await userModel.findOne({email})

        if(!user) {
            return res.json({success:false, message: 'User does not exist'})
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(isMatch) {
            const token = jwt.sign({id:user._id}, process.env.JWT_SECRET)
            res.json({success:true, token})
        } else {
            res.json({success:false, message:"Invalid credentials"})
        }

    } catch(error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }

}

// API to get user profile data
const getProfile = async (req, res) => {

   try {
    const userId = req.userId;
    //const { userId } = req.userId;
    const userData = await userModel.findById(userId).select('-password')
    res.json({success:true, userData})

   } catch (error) {
      console.log(error)
      res.json({success:false, message:error.message})
   }

}

// API to update user profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const {name, phone, address, dob, gender} = req.body
        const imageFile = req.file

        if(!name || !phone || !address || !dob || !gender) {
            return res.json({success: false, message: "Data Missing"})
        }

        await userModel.findByIdAndUpdate(userId, {name, phone, address: JSON.parse(address), dob, gender})

        if(imageFile) {

            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type: 'image'})
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, {image:imageURL})
        }

        res.json({success:true, message:"Profile Updated"}) 

    } catch(error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

// API to book appointment
// Updated bookAppointment with auto-shift logic for normal appointments

const bookAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const { docId, slotDate, slotTime, isEmergency = false } = req.body;
    const emergencyFlag = isEmergency === true || isEmergency === 'true';

    if (!userId) {
      return res.json({ success: false, message: "Unauthorized: user not found" });
    }

    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData.available) {
      return res.json({ success: false, message: "Doctor not available" });
    }

    let slot_booked = docData.slot_booked || {};
    if (!slot_booked[slotDate]) {
      slot_booked[slotDate] = {};
    }

    const slotInfo = slot_booked[slotDate][slotTime];

    // If already booked as emergency, block any booking
    if (slotInfo && slotInfo.emergency) {
      return res.json({ success: false, message: "Slot not available - emergency booked" });
    }

    // If emergency appointment, and slot booked normally, shift normal appointments
    if (slotInfo && emergencyFlag) {
      const existingAppointments = await appointmentModel.find({
        docId,
        slotDate,
        slotTime,
        cancelled: false
      });

      const allSlots = [
        "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
        "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
        "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
        "04:00 PM", "04:30 PM", "05:00 PM"
      ];

      const currentIndex = allSlots.indexOf(slotTime);

      for (let appt of existingAppointments) {
        if (!appt.isEmergency) {
          const nextSlot = allSlots[currentIndex + 1];

          if (!nextSlot) {
            return res.json({ success: false, message: "No available next slot to shift appointment" });
          }

          const clash = await appointmentModel.findOne({
            docId,
            slotDate,
            slotTime: nextSlot,
            cancelled: false
          });

          if (!clash) {
            await appointmentModel.findByIdAndUpdate(appt._id, {
              slotTime: nextSlot
            });
            slot_booked[slotDate][nextSlot] = { emergency: false };
            delete slot_booked[slotDate][slotTime];

            // Notify user about the shift
            const user = await userModel.findById(appt.userId);
            if (user) {
              const msg = `Your appointment on ${slotDate} has been shifted from ${slotTime} to ${nextSlot} due to an emergency booking.`;
              await notificationModel.create({
                userId: user._id,
                message: msg,
                date: new Date()
              });
            }

          } else {
            return res.json({ success: false, message: `Next slot ${nextSlot} already occupied.` });
          }
        }
      }
    }

    // For normal booking, if slot already taken, reject
    if (slotInfo && !emergencyFlag) {
      return res.json({ success: false, message: "Slot not available" });
    }

    // Save emergency slot
    slot_booked[slotDate][slotTime] = { emergency: emergencyFlag };

    const userData = await userModel.findById(userId).select('-password');
    delete docData.slot_booked;

    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
      isEmergency: emergencyFlag,
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // Save new slot data in docData
    await doctorModel.findByIdAndUpdate(docId, { slot_booked });

    res.json({ success: true, message: 'Appointment Booked' });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}




// API to get user appointments for frontend my-appointment page
const listAppointment = async (req, res) => {

    try {

        const userId = req.userId
        const appointments = await appointmentModel.find({userId})

        res.json({success: true, appointments})

    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }

}

// API to cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    // verify appointment belongs to user
    if (appointmentData.userId.toString() !== userId.toString()) {
      return res.json({ success: false, message: 'Unauthorized action' });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

    // releasing doctor slot
    const { docId, slotDate, slotTime } = appointmentData;

    const doctorData = await doctorModel.findById(docId);

    let slot_booked = doctorData.slot_booked || {};
    if (slot_booked[slotDate]) {
      delete slot_booked[slotDate][slotTime]; // Correctly remove the slot key
    }

    await doctorModel.findByIdAndUpdate(docId, { slot_booked });

    res.json({ success: true, message: 'Appointment Cancelled' });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

// API to make payment of appointment using AmarPay

// ✅ POST /api/user/payment-amarpay
const paymentAmarpay = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData || appointmentData.cancelled) {
      return res.json({ success: false, message: "Appointment not found or cancelled." });
    }

    const paymentPayload = {
        store_id: process.env.AMARPAY_KEY_ID,
        signature_key: process.env.AMARPAY_KEY_SECRET,
        tran_id: `TRX-${Date.now()}`,
        amount: appointmentData.amount.toString(), // MUST be string
        currency: process.env.CURRENCY || "BDT",
        desc: "Doctor Appointment Payment",
        cus_name: appointmentData.userData.name,
        cus_email: appointmentData.userData.email,
        cus_phone: appointmentData.userData.phone || "01700000000",
        cus_add1: "Dhaka",
        cus_city: "Dhaka",
        cus_country: "Bangladesh",
        success_url: `${process.env.BACKEND_URL}/api/user/payment-success-callback`,
        fail_url: `${process.env.FRONTEND_URL}/payment-fail`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
        type: "json",
        opt_a: appointmentId,
    };

    //console.log("AmarPay JSON payload:", paymentPayload);

    const response = await axios.post(
        "https://sandbox.aamarpay.com/jsonpost.php",
        paymentPayload,
        {
            headers: {
            "Content-Type": "application/json", // critical for JSON body
            },
        }
    );

    //console.log("AmarPay response:", response.data);


    if (response.data && response.data.payment_url) {
        res.json({ success: true, paymentUrl: response.data.payment_url });
        } else {
        res.json({ success: false, message: "Failed to generate payment link." });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// ✅ GET /api/user/payment-success-callback
const paymentSuccessCallback = async (req, res) => {
  try {
    const { opt_a, pay_status } = req.body;
    // console.log("AmarPay callback data:", req.body);

    if (!opt_a) {
      return res.send("Invalid callback: missing appointment ID.");
    }

    if (pay_status && pay_status.toLowerCase() === "successful") {
      await appointmentModel.findByIdAndUpdate(opt_a, { payment: true });
    }

    return res.redirect(`${process.env.FRONTEND_URL}/payment-success`);
  } catch (error) {
    console.error(error);
    return res.send("Payment verification failed: " + error.message);
  }
};



export {registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentAmarpay, paymentSuccessCallback}
