const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const {
  EMAIL_ADDRESS,
  EMAIL_PASSWORD,
  SECRET_KEY,
} = require("../utils/config");

const userController = {
  signin: async (req, res) => {
    // getting email and password from the user
    const { email, password } = req.body;

    //checking whether user exists or not
    const user = await userModel.findOne({ email });

    // return error if the user does not exist
    if (!user) {
      return res.status(401).json({ message: "user does not exists" });
    }

    // return error if the user doen not verified their account
    if (!user.verified) {
      return res
        .status(401)
        .json({ message: "User does not verified the account" });
    }

    // check if the password is correct
    const isAuthenticated = await bcrypt.compare(password, user.password);

    // return error if the password is not correct
    if (!isAuthenticated) {
      return res.status(401).json({ message: "password does not match" });
    }

    const payloadData = {
      name: user.name,
      id: user._id,
    };

    // generate a token for the user and return it
    const token = jwt.sign(payloadData, SECRET_KEY, { expiresIn: "1h" });

    res.status(200).send({ token: token, name: user.name, email: user.email });
  },

  signup: async (req, res) => {
    try {
      // getting signup details from the user
      const { name, email, password } = req.body;

      // check whether user already exists
      const existingUser = await userModel.findOne({ email });

      // return response if the user already exits
      if (existingUser) {
        return res.status(409).json({ message: "User already exits" });
      }

      const randomString =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

      const accVerificationLink = `https://merry-pixie-65f0af.netlify.app/users/acc-verification/${randomString}`;

      // check if the password is correct
      const hasedPassword = await bcrypt.hash(password, 10);

      const newUser = new userModel({
        name,
        email,
        password: hasedPassword,
        resetToken: randomString,
      });

      await newUser.save();

      //   email authentication
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: EMAIL_ADDRESS,
          pass: EMAIL_PASSWORD,
        },
      });

      //   sendind email to rest the password
      const sendMail = async () => {
        const info = await transporter.sendMail({
          from: `"Hemamalini Kamaraj" <${EMAIL_ADDRESS}>`,
          to: email,
          subject: "Account Verification",
          text: `Kindly use this link to verify your account - ${accVerificationLink}`,
        });
      };

      sendMail();

      res.status(201).json({
        message:
          "User created successfully.Kindly activate your account. Please verify your email!",
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },

  accountActivation: async (req, res) => {
    try {
      const resetToken = req.params.id;

      const matchedUser = await userModel.findOne({ resetToken });

      if (matchedUser === null) {
        return res
          .status(400)
          .json({ message: "Account activation link expired" });
      }

      matchedUser.verified = true;
      matchedUser.resetToken = "";

      await userModel.findByIdAndUpdate(matchedUser.id, matchedUser);
      res.status(201).json({
        message: "account verified sucessfully.. kindly visit the login page",
      });
    } catch (error) {
      return res.status(400).json({ Err: "Account activation link expired" });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      // getting email from the user
      const { email } = req.body;

      //   return error if the email is not valid
      if (!email) {
        return res.status(401).json({ message: "Please enter a valid email" });
      }

      //   check if the user already exits
      const user = await userModel.findOne({ email });

      //   return error if the user does not exist
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      // cgenerating random string to create the token
      const randomString =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

      const link = `https://merry-pixie-65f0af.netlify.app/users/reset-password/${randomString}`;

      user.resetToken = randomString;
      const updateUser = await userModel.findByIdAndUpdate(user.id, user);

      //   email authentication
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: EMAIL_ADDRESS,
          pass: EMAIL_PASSWORD,
        },
      });

      //   sendind email to rest the password
      const sendMail = async () => {
        const info = await transporter.sendMail({
          from: `"Hemamalini Kamaraj" <${EMAIL_ADDRESS}>`,
          to: user.email,
          subject: "Reset Password",
          text: `Kindly use this link to reset the password - ${link}`,
        });
      };

      sendMail()
        .then(() => {
          return res
            .status(201)
            .json({ message: `Mail has been sent to ${user.email}` });
        })
        .catch((err) => res.status(500).json(err));
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  resetPassword: async (req, res) => {
    try {
      // getting token from the reset url
      const resetToken = req.params.id;

      //   getting the new password from the user
      const { password } = req.body;

      //   checking if the user already exists or not using the token
      const user = await userModel.findOne({ resetToken });

      //   return error if the user does not exist
      if (!user) {
        return res.status(400).json({ Err: "user not found" });
      }

      //   hasing the password
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;

      //   resetting the token
      user.resetToken = "";

      await userModel.findByIdAndUpdate(user.id, user);

      res.status(201).json({
        message: "Password has been changed sucessfully",
      });
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  getUserDashboard: async (req, res) => {
    try {
      const userId = req.userId;
      console.log(userId);
      const user = await userModel.findById(userId, "name email");
      res.json(user);
    } catch (error) {
      console.error("Error getting user profile", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
module.exports = userController;
