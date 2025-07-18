import React, { useState, useContext, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'

const MyProfile = () => {
  const { userData, setUserData, token, backendUrl, loadUserProfileData } = useContext(AppContext)

  const [isEdit, setIsEdit] = useState(false)
  const [image, setImage] = useState(false)
  const [notifications, setNotifications] = useState([])

  const updateUserProfileData = async () => {
    try {
      const formData = new FormData()
      formData.append('name', userData.name)
      formData.append('phone', userData.phone)
      formData.append('address', JSON.stringify(userData.address))
      formData.append('gender', userData.gender)
      formData.append('dob', userData.dob)
      image && formData.append('image', image)

      const { data } = await axios.post(backendUrl + '/api/user/update-profile', formData, {
        headers: { token }
      })

      if (data.success) {
        toast.success(data.message)
        await loadUserProfileData()
        setIsEdit(false)
        setImage(false)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/user/notifications`, {
          headers: { token }
        })
        if (data.success) {
          setNotifications(data.notifications)
        } else {
          toast.error(data.message)
        }
      } catch (err) {
        console.log(err)
        toast.error("Failed to load notifications")
      }
    }
    fetchNotifications()
  }, [backendUrl, token])
  
  const removeNotification = async (id) => {
    try {
      await axios.delete(`${backendUrl}/api/notifications/${id}`, {
        headers: { token }
      });
      setNotifications(prev => prev.filter(note => note._id !== id));
    } catch (error) {
      toast.error("Failed to remove notification");
    }
  }


  return userData && (
    <div className='mx-w-lg flex flex-col gap-2 text-sm'>

      {
        isEdit
          ? <label htmlFor="image">
            <div className='inline-block relative cursor-pointer'>
              <img className='w-36 rounded opacity-75' src={image ? URL.createObjectURL(image) : userData.image} alt="" />
              <img className='w-10 absolute bottom-12 right-12' src={image ? '' : assets.upload_icon} alt="" />
            </div>
            <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden />
          </label>
          : <img className='w-36 rounded' src={userData.image} alt="" />
      }

      {
        isEdit
          ? <input className='bg-gray-50 text-3xl font-medium mx-w-60 mt-4' type="text" value={userData.name} onChange={e => setUserData(prev => ({ ...prev, name: e.target.value }))} />
          : <p className='font-medium text-3xl text-neutral-800 mt-4'>{userData.name}</p>
      }

      <hr className='bg-zinc-400 h-[1px] border-none ' />

      {/* Notifications Section */}
      <div className='bg-white p-4 rounded shadow mt-4'>
        <h2 className='text-lg font-semibold text-primary mb-2'>Notifications</h2>
        {
          notifications.length === 0
            ? <p className='text-gray-500'>No notifications yet.</p>
            : (
              <ul className='list-disc pl-5 text-sm text-gray-800'>
                {notifications.map((note) => (
                  <li key={note._id} className='mb-1 flex justify-between items-center'>
                    <span>{note.message}</span>
                    <button
                      onClick={() => removeNotification(note._id)}
                      className='ml-2 text-red-500 hover:text-red-700 font-bold text-lg'
                      aria-label="Dismiss notification"
                      type="button"
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>

            )
        }
      </div>

      {/* Contact Info */}
      <div>
        <p className='text-neutral-500 underline mt-3 ' >CONTACT INFORMATION</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700 ' >
          <p className='font-medium ' >Email id:</p>
          <p className='text-blue-500 ' >{userData.email}</p>
          <p className='font-medium ' >Phone:</p>
          {
            isEdit
              ? <input className='bg-gray-100 max-w-52 ' type="text" value={userData.phone} onChange={e => setUserData(prev => ({ ...prev, phone: e.target.value }))}></input>
              : <p className='text-blue-400 ' >{userData.phone}</p>
          }
          <p className='font-medium'>Address:</p>
          {
            isEdit
              ? <p>
                <input className='bg-gray-50 ' value={userData.address.line1} onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} type="text"></input>
                <br />
                <input className='bg-gray-50 ' value={userData.address.line2} onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} type="text"></input>
              </p>
              : <p className='text-gray-500 ' >
                {userData.address.line1}
                <br />
                {userData.address.line2}
              </p>
          }
        </div>
      </div>

      {/* Basic Info */}
      <div>
        <p className='text-neutral-500 underline mt-3 ' >BASIC INFORMATION</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700 ' >
          <p className='font-medium ' >Gender:</p>
          {
            isEdit
              ? <select className='max-w-20 bg-gray-100 ' value={userData.gender} onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              : <p className='text-gray-400 ' >{userData.gender}</p>
          }
          <p className='font-medium ' >Birthday:</p>
          {
            isEdit
              ? <input className='max-w-28 bg-gray-100 ' type="date" value={userData.dob} onChange={(e) => setUserData(prev => ({ ...prev, dob: e.target.value }))}></input>
              : <p className='text-gray-400 ' >{userData.dob}</p>
          }
        </div>
      </div>

      <div className='mt-10 ' >
        {
          isEdit
            ? <button className='border border-primay px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all' onClick={updateUserProfileData}>Save information</button>
            : <button className='border border-primay px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all' onClick={() => setIsEdit(true)}>Edit</button>
        }
      </div>

    </div>
  )
}

export default MyProfile
