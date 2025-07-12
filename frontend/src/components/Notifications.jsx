import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { AppContext } from '../context/AppContext'

const Notifications = () => {
  const { token, backendUrl } = useContext(AppContext)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/user/notifications`, {
          headers: { token }
        })
        if (data.success) {
          setNotifications(data.notifications)
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      }
    }
    fetchNotifications()
  }, [backendUrl, token])

  if (!notifications.length) return <p>No notifications.</p>

  return (
    <div>
      <h3 className="font-semibold mb-2">Notifications</h3>
      <ul className="list-disc list-inside text-sm">
        {notifications.map(n => (
          <li key={n._id} className="mb-1">
            {n.message} <br />
            <small className="text-gray-400">{new Date(n.date).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Notifications
