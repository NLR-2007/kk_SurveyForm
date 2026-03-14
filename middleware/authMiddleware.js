const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    let token = req.headers['authorization'];
    if (!token) {
        return res.status(403).json({ error: 'No token provided' });
    }

    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized!' });
        }
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

const verifyAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Require Admin Role!' });
    }
    next();
};

module.exports = {
    verifyToken,
    verifyAdmin
};
