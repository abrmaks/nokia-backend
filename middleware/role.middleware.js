const tokenService = require('../services/token.service')

module.exports = function(roles){
    return function(req, res, next) {
        if(req.method === 'OPTIONS') {
        next()
    }
    try {
        const accessToken = req.headers.authorization.split(' ')[1]

        if(!accessToken){
            return res.status(401).json({ message: 'User not authorized!' });
        }

        const {role: userRole} = tokenService.validateAccessToken(accessToken)
        // if(role !== userRole) {
        //     return res.status(403).json({ message: `You don't have permissions` });
        // }
        let hasRole = false
        // userRoles.forEach((role) => {
        //     if(roles.includes(role)) {
        //         hasRole = true
        //     }
        // })
        roles.forEach((role) => {
            if(role === userRole) {
                hasRole = true
            }
        })

        if (!hasRole) {
            return res.status(401).json({ message: `You don't have permissions` });
        }

        next()
    } catch (error) {
        return res.status(401).json({ message: 'User not authorized' });
    }

    }
}