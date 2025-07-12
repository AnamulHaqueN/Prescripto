import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'
import notificationRouter from './routes/notificationRouter.js';

// app config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

// middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors())

// api endpoints
app.use('/api/admin', adminRouter) // localhost:4000/api/admin/add-doctor
app.use('/api/doctor', doctorRouter)
app.use('/api/user', userRouter)

app.use('/api/notifications', notificationRouter);

app.get('/', (req, res)=>{
    res.send('API WORKING GREAT')
})

app.listen(port, ()=>{
    console.log("server Started", port)
})