const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = (req, res, next) => {
    try {
        const {token}= req.body
        //console.log(token)
        if (!token) {
            return res.status(400).json({message:"Token is required"});
        }
        var decoded = jwt.verify(token, process.env.TOKEN_KEY);
        req.user = {
            first_name: decoded.first_name,
            last_name: decoded.last_name,
            email: decoded.email
        };
        next();    
    } catch (error) {
        console.log(error)
        return res.status(400).json({message:"Invalid Token"})
    }
};

module.exports = verifyToken;