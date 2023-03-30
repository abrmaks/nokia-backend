// const userService = require("../service/user-service");
const { validationResult } = require("express-validator");
// const ApiError = require("../exceptions/api-error");
const bcrypt = require('bcrypt')
const UserModel = require('../models/user.model')
const RolesModel = require('../models/roles.model')
const tokenService = require('../services/token.service')
const userDto = require('../dto/user.dto')

class AuthController {
  async registration(req, res, next) {
    try {
        const { email, password,  ...rest } = req.body
        const candidate = await UserModel.findOne({email})
        if(candidate){
            return res.status(400).json({message: "User exist"})
        }
        const hashPassword = await bcrypt.hashSync(password, 6)

        // await RolesModel.create({})
        // await RolesModel.create({role: 'admin'})
        const userRole = await RolesModel.find({role: 'user'})
        const user = await UserModel.create({email, password: hashPassword, role: userRole[0].role, ...rest})

        const userDt = userDto(user);
        const tokens = tokenService.generationToken({...userDt})
        await tokenService.saveToken(userDt.id, tokens.refreshToken)

        const userData = { user: userDt, ...tokens}

      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.json(userData);
    } catch (error) {
      next(error);
    }
  }
  async login(req, res) {
    try {
      const errors = validationResult(req)
      if(!errors.isEmpty()) {
        return res.status(400).json({ message: "Login Error", errors })
      }
      const { email, password } = req.body;
      const user = await UserModel.findOne({ email })
      if(!user){
          return res.status(401).json({ message: "Invalid email address or password." })
      }
      const isPassEquals = await bcrypt.compareSync(password, user.password)
      if(!isPassEquals){
          return res.status(401).json({ message: "Invalid email address or password." })
      }
      const tokens = tokenService.generationToken({email, role: user.role})

      await tokenService.saveToken(user._id, tokens.refreshToken)

      const userDt = userDto(user);

      res.cookie("refreshToken", tokens.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      return res.json({
          ...tokens, 
          user: userDt,
          message: "Login successful"
      })
    } catch (error) {
      res.status(400).json({ message: "Login Error" })
    }
  }
  async logout(req, res) {
    try {
      const { refreshToken } = req.cookies;
      const token = await tokenService.removeToken(refreshToken)
      res.clearCookie("refreshToken");
      return res.json(token);
    } catch (error) {
      res.status(400).json({ message: "Logout Error" })
    }
  }

  async refresh(req, res){
    try {
      const { refreshToken } = req.cookies;
      if(!refreshToken){
        return res.status(401).json({ message: 'User not authorized!' });
      }

      const userData = tokenService.validateRefreshToken(refreshToken)
      const tokenFromDb = await tokenService.findToken(refreshToken)

      if(!userData || !tokenFromDb){
          return res.status(401).json({ message: 'User not authorized' });
      }

      const user = await UserModel.findOne({email: userData.email})

      const tokens = tokenService.generationToken({email: user.email, role: user.role})

      await tokenService.saveToken(user.email, tokens.refreshToken)

      const userDt = userDto(user);

      res.cookie("refreshToken", tokens.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });


      return res.json({
          ...tokens, 
          user: userDt,
      })
    } catch (error) {
      res.status(401).json({ message: "Refresh token error" })
    }
  }


  // async acivate(req, res, next) {
  //   try {
  //     const activationLink = req.params.link;
  //     await userService.activate(activationLink);
  //     return res.redirect(process.env.CLIENT_URL);
  //   } catch (error) {
  //     next(error);
  //   }
  // }
  // async refresh(req, res, next) {
  //   try {
  //     const { refreshToken } = req.cookies;
  //     const userData = await userService.refresh(refreshToken);
  //     res.cookie("refreshToken", userData.refreshToken, {
  //       maxAge: 30 * 24 * 60 * 60 * 1000,
  //       httpOnly: true,
  //     });
  //     return res.json(userData);
  //   } catch (error) {
  //     next(error);
  //   }
  // }

}

module.exports = new AuthController();
