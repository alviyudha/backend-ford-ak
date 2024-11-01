import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; 

export const verifyUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ msg: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1]; 
    if (!token) {
        return res.status(401).json({ msg: "Token missing" });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ msg: "Token is invalid" });
        }
        req.user = decoded; 
        next(); 
    });
};
