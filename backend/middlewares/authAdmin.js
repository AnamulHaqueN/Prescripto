import jwt from 'jsonwebtoken'

// admin authentication middlewire
const authAdmin = async (req, res, next) => {
    try {

        const atoken = req.headers.atoken || req.headers['atoken'];

        if(!atoken) {
            return res.json({success:false, message:'Not Authorized Login Again'})
        }
        const decoded = jwt.verify(atoken, process.env.JWT_SECRET);
            if (!decoded || decoded.role !== "admin") {
            return res.json({ success: false, message: 'Not Authorized Login Again' });
        }

        next()

    } catch(error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
    
}

export default authAdmin