const tokenService = require('../services/token.service')

module.exports = function(req, res, next){
    if(req.method === 'OPTIONS') {
        next()
    }
    try {
        const accessToken = req.headers.authorization.split(' ')[1]

        if(!accessToken){
            return res.status(403).json({ message: 'User not authorized' });
        }

        const userData = tokenService.validateAccessToken(accessToken)
        if(!userData){
           return res.status(403).json({ message: 'Invalid token' });
        }

        req.user = userData;
        next()
    } catch (error) {
        return res.status(403).json({ message: 'User not authorized' });
    }
}