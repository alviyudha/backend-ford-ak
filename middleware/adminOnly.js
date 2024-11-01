export const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ msg: "Access denied, admin only" });
    }
    next(); 
};
