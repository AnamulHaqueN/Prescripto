// import React, {useContext, useEffect, useState} from 'react'
// import { useNavigate, useParams } from "react-router-dom"
// import { AppContext } from "../context/AppContext"
// import { assets } from '../assets/assets'
// import RelatedDoctors from '../components/RelatedDoctors'
// import { toast } from 'react-toastify'
// import axios from 'axios'

// const Appointment = () => {

//   const {docId} = useParams()
//   const {doctors, currencySymbol, backendUrl, token, getDoctorsData} = useContext(AppContext)
//   const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  
//   const navigate = useNavigate()

//   const [docInfo, setDocInfo] = useState(null)
//   const [docSlots, setDocSlots] = useState([])
//   const [slotIndex, setSlotIndex] = useState(0)
//   const [slotTime, setSlotTime] = useState('')
//   const [isEmergency, setIsEmergency] = useState(false);


//   const fetchDocInfo = async () => {
//     const docInfo = doctors.find(doc => doc._id === docId) 
//     setDocInfo(docInfo)
//     console.log(docInfo)
//   }

//   const getAvailableSlots = async () => {
//     setDocSlots([])

//     // getting current date
//     let today = new Date()
    
//     for(let i = 0; i < 7; i++) {
//       // getting date with index
//       let currentDate = new Date(today)
//       currentDate.setDate(today.getDate() + i)

//       // setting end time of the date with index
//       let endTime = new Date()
//       endTime.setDate(today.getDate() + i)
//       endTime.setHours(21, 0, 0, 0)

//       //setting hours
//       if(today.getDate() === currentDate.getDate()) {
//         currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
//         currentDate.setMinutes(currentDate.getMinutes > 30 ? 30 : 0)
//       } else {
//         currentDate.setHours(10)
//         currentDate.setMinutes(0)
//       }

//       let timeSlots = []
      
//       while(currentDate < endTime) {
//         let formattedTime = currentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})

//         let day = currentDate.getDate()
//         let month = currentDate.getMonth() + 1
//         let year = currentDate.getFullYear()

//         const slotDate = day + "_" + month + "_" + year;
//         const slotTime = formattedTime;

//         const isBooked = docInfo.slot_booked?.[slotDate]?.includes(slotTime);

//         timeSlots.push({
//             datetime: new Date(currentDate),
//             time: formattedTime,
//             isBooked
//         });

        
//         // Increment current time by 30 minutes
//         currentDate.setMinutes(currentDate.getMinutes() + 30)
//       }
//       setDocSlots(prev => ([...prev, timeSlots]))

//     }

//   }

//   const bookAppointment = async () => {
//     if(!token) {
//       toast.warn('Login to book appointment')
//       return navigate('/login')
//     }
    
//     try {
      
//       const date = docSlots[slotIndex][0].datetime
      
//       let day = date.getDate()
//       let month = date.getMonth() + 1
//       let year = date.getFullYear()

//       const slotDate = day + "_" + month + "_" + year

//       const {data} = await axios.post(backendUrl + '/api/user/book-appointment', {docId, slotDate, slotTime, isEmergency}, {headers: {token}})
//       if(data.success) {
//         toast.success(data.message)
//         getDoctorsData()
//         navigate('/my-appointments')
//       } else {
//         toast.error(data.message)
//       }

//     } catch (error) {
//       console.log(error)
//       toast.error(error.message)
//     }
//   }
  
//   useEffect(() => {
//     fetchDocInfo();
//   }, [doctors, docId]);
  
//   useEffect(() => {
//     getAvailableSlots()
//   }, [docInfo])

//   useEffect(() => {
//     console.log(docSlots);
//   }, [docSlots])

//   return docInfo && (
//     <div>
//       {/* -----------Doctor Details ------------ */}
//       <div className='flex flex-col sm:flex-row gap-4'>
//         <div>
//           <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
//         </div>

//         <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0 '>
//           {/* -----------Doc Info : name, degree, experience ------------ */}
//           <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>
//             {docInfo.name} 
//             <img src={assets.verified_icon} alt="" />  
//           </p>
//           <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
//             <p>{docInfo.degree} - {docInfo.speciality}</p>
//             <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
//           </div>

//           {/* -----------Doctor About------------ */}
//           <div>
//             <p className='flex item-center gap-1 text-sm font-medium text-gray-900 mt-3'>
//               About <img src={assets.info_icon} alt="" />
//             </p>
//             <p className='text-sm text-gray-500 max-w-[700px] mt-1' >{docInfo.about}</p>
//           </div>
//           <p className='text-gray-500 font-medium mt-4' >
//             Appointment fee: <span className='text-gray-600'>{currencySymbol} {docInfo.fees}</span>
//           </p>
//         </div>
//       </div>

//       {/* ----------Booking slots----------- */}
//       <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
//         {/* Emergency Mode Toggle */}
//         <label className='flex items-center gap-2 my-4'>
//           <input
//             type="checkbox"
//             checked={isEmergency}
//             onChange={(e) => setIsEmergency(e.target.checked)}
//             className="w-4 h-4"
//           />
//           <span className='text-sm'>Book as Emergency Appointment (Override if already booked)</span>
//         </label>

//         <p>Booking slots</p>
//         <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
//           {
//             docSlots.length && docSlots.map((item, index) => (
//               <div onClick={()=> setSlotIndex(index)} className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : 'border border-gray-200'} `} key={index}>
//                 <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
//                 <p>{item[0] && item[0].datetime.getDate()}</p>
//               </div>
//             ))
//           }
//         </div>

//         <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
//         {docSlots.length && docSlots[slotIndex].map((item, index)=>(
//           <p
//             onClick={() => {
//               if (!isEmergency && item.isBooked) return;
//               setSlotTime(item.time);
//             }}
//             className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer 
//               ${item.time === slotTime ? 'bg-primary text-white' : ''}
//               ${item.isBooked ? (isEmergency ? 'bg-red-100 border-red-300' : 'text-gray-300 cursor-not-allowed') : 'border border-gray-300 text-gray-400'}
//             `}
//             key={index}
//           >
//             {item.time.toLowerCase()}
//           </p>

//         ))}
//       </div>

//       <button onClick={bookAppointment} className='bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6'>Book on appointment</button>
//       </div>

//       {/* Listing Related Doctors */} 
//       <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
//     </div>
//   )
// }

// export default Appointment








import React, {useContext, useEffect, useState} from 'react'
import { useNavigate, useParams } from "react-router-dom"
import { AppContext } from "../context/AppContext"
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import { toast } from 'react-toastify'
import axios from 'axios'

const Appointment = () => {

  const {docId} = useParams()
  const {doctors, currencySymbol, backendUrl, token, getDoctorsData} = useContext(AppContext)
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const navigate = useNavigate()

  const [docInfo, setDocInfo] = useState(null)
  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')
  const [isEmergency, setIsEmergency] = useState(false);

  const fetchDocInfo = async () => {
    const docInfo = doctors.find(doc => doc._id === docId) 
    setDocInfo(docInfo)
    console.log(docInfo)
  }

  const getAvailableSlots = async () => {
    setDocSlots([])

    let today = new Date()

    for(let i = 0; i < 7; i++) {
      let currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)

      let endTime = new Date(currentDate)
      endTime.setHours(21, 0, 0, 0)

      if(today.getDate() === currentDate.getDate()) {
        currentDate.setHours(Math.max(currentDate.getHours() + 1, 10))
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
      } else {
        currentDate.setHours(10)
        currentDate.setMinutes(0)
      }

      let timeSlots = []

      while(currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})

        let day = currentDate.getDate()
        let month = currentDate.getMonth() + 1
        let year = currentDate.getFullYear()

        const slotDate = `${day}_${month}_${year}`;
        const slotTime = formattedTime;

        const slotData = docInfo.slot_booked?.[slotDate]?.[slotTime]
        const isBooked = !!slotData
        const isEmergency = slotData?.emergency === true

        timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime,
            isBooked,
            isEmergency
        });

        currentDate.setMinutes(currentDate.getMinutes() + 30)
      }

      setDocSlots(prev => [...prev, timeSlots])
    }
  }

  const bookAppointment = async () => {
    if(!token) {
      toast.warn('Login to book appointment')
      return navigate('/login')
    }

    try {
      const date = docSlots[slotIndex][0].datetime
      let day = date.getDate()
      let month = date.getMonth() + 1
      let year = date.getFullYear()

      const slotDate = `${day}_${month}_${year}`

      const {data} = await axios.post(backendUrl + '/api/user/book-appointment', {docId, slotDate, slotTime, isEmergency}, {headers: {token}})
      if(data.success) {
        toast.success(data.message)
        getDoctorsData()
        navigate('/my-appointments')
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  useEffect(() => {
    if (docInfo) getAvailableSlots()
  }, [docInfo])

  return docInfo && (
    <div>
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
        </div>

        <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0 '>
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>
            {docInfo.name} 
            <img src={assets.verified_icon} alt="" />  
          </p>
          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
          </div>

          <div>
            <p className='flex item-center gap-1 text-sm font-medium text-gray-900 mt-3'>
              About <img src={assets.info_icon} alt="" />
            </p>
            <p className='text-sm text-gray-500 max-w-[700px] mt-1' >{docInfo.about}</p>
          </div>
          <p className='text-gray-500 font-medium mt-4' >
            Appointment fee: <span className='text-gray-600'>{currencySymbol} {docInfo.fees}</span>
          </p>
        </div>
      </div>

      <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
        <label className='flex items-center gap-2 my-4'>
          <input
            type="checkbox"
            checked={isEmergency}
            onChange={(e) => setIsEmergency(e.target.checked)}
            className="w-4 h-4"
          />
          <span className='text-sm'>Book as Emergency Appointment (Override if already booked)</span>
        </label>

        <p>Booking slots</p>
        <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
          {
            docSlots.length && docSlots.map((item, index) => (
              <div onClick={()=> setSlotIndex(index)} className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : 'border border-gray-200'} `} key={index}>
                <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                <p>{item[0] && item[0].datetime.getDate()}</p>
              </div>
            ))
          }
        </div>

        <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
        {docSlots.length && docSlots[slotIndex].map((item, index)=>(
          <p
            onClick={() => {
              const notEmergencyBookable = !isEmergency && item.isBooked;
              const alreadyEmergencyBooked = item.isEmergency;
              if (notEmergencyBookable || alreadyEmergencyBooked) return;
              setSlotTime(item.time);
            }}
            className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer 
              ${item.time === slotTime ? 'bg-primary text-white' : ''}
              ${item.isEmergency ? 'bg-red-200 text-red-700 cursor-not-allowed' : item.isBooked ? 'text-gray-300 cursor-not-allowed' : 'border border-gray-300 text-gray-400'}
            `}
            key={index}
          >
            {item.time.toLowerCase()}
          </p>
        ))}
      </div>

      <button onClick={bookAppointment} className='bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6'>Book on appointment</button>
      </div>

      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
    </div>
  )
}

export default Appointment




