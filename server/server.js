import express, { json } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Cors from "cors";
import multer from "multer";
import sharp from "sharp";
import User from "./models/User.js";
import Test from "./models/Test.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

import { fileURLToPath } from "url";
import { dirname } from "path";

// App Config
const app = express();
dotenv.config();

const port = process.env.APP_PORT || 8001;
const connection_url = process.env.APP_MONGODB;

// Middlewares
app.use(express.json());
app.use(Cors());

// DB Config
const connect = mongoose
  .connect(connection_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(console.log("connected 🤝 "));

//nodemailer Config
const transporter = nodemailer.createTransport({
  host: process.env.APP_NODEMAILER_HOST,
  port: process.env.APP_NODEMAILER_PORT,
  requireTLS: true,
  secure: false, // upgrade later with STARTTLS
  auth: {
    user: process.env.APP_NODEMAILER_USER,
    pass: process.env.APP_NODEMAILER_PASSWORD,
  },
});

/////////////////////auth
//Register
app.post("/register", async (req, res) => {
  try {
    const userEmail = await User.findOne({ email: req.body.email });

    if (userEmail) {
      return res.status(400).json("Email already exists");
    }

    // if (req.body.confirmPassword !== req.body.password) {
    //  return res
    //  .status(400)
    //  .json("confirm password does not match with password");
    // }

    //generate new password
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //create new user
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    //save user and respond
    const user = await newUser.save();
    res
      .status(200, { status: "ok", user })
      .json({ status: "Account created successfully!", user });
  } catch (err) {
    console.log(err);
    res.status(500, { status: "error" }).json({ status: "error" });
  }
});

///user data

app.post("/userdata", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(422).json({ error: "please provide an email" });
  }
  User.findOne({ email: email }).then((savedUser) => {
    if (!savedUser) {
      return res.status(422).json({ error: "user did not exist" });
    }

    res.status(200).send(
      JSON.stringify({
        //200 OK
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
      })
    );
  });
});

// delete user by id
app.delete("/delete/user/:_id", async (req, res) => {
  console.log(req.params);
  let data = await User.deleteOne(req.params);
  res.send(data);
});

//LOGIN
app.post("/login", async (req, res) => {
  try {
    //find user

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json("Wrong email or password");
    }

    //validate password
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(400).json("Wrong email or password");
    }

    //jwt
    const token = await jwt.sign(
      {
        email: user.email,
        name: user.name,
        // expiresIn: "1h",
        iat: Math.floor(Date.now() / 1000 + 60 * 60) * 1000,
      },

      process.env.APP_SECRET
    );

    //send response
    res.status(200).json({ email: user.email, user: token, role: user.role });
  } catch (err) {
    res.status(500).json({ err: err, status: "Wrong emails or password" });
  }
});

//forget Password

app.post("/forget-password", async (req, res) => {
  const userData = await User.findOne({ email: req.body.email });
  if (!userData) {
    return res.status(422).json({ error: "User dont exist with this email" });
  }
  crypto.randomBytes(32, (err, buffer) => {
    const token = buffer.toString("hex");
    const mailOptions = {
      from: "amine15.saadaoui@gmail.com", // sender address
      to: userData.email, // list of receivers
      subject: "reset password ✔", // Subject line
      text: "Hello world?", // plain text body
      html: `
        <!DOCTYPE html>
        <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
        
        <head>
            <title></title>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
            <meta name="viewport" content="width=device-width,initial-scale=1">
            <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
            <!--[if !mso]><!-->
            <link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet" type="text/css">
            <link href="https://fonts.googleapis.com/css?family=Cabin" rel="stylesheet" type="text/css">
            <!--<![endif]-->
            <style>
                * {
                    box-sizing: border-box
                }
        
                body {
                    margin: 0;
                    padding: 0
                }
        
                a[x-apple-data-detectors] {
                    color: inherit !important;
                    text-decoration: inherit !important
                }
        
                #MessageViewBody a {
                    color: inherit;
                    text-decoration: none
                }
        
                p {
                    line-height: inherit
                }
        
                .desktop_hide,
                .desktop_hide table {
                    mso-hide: all;
                    display: none;
                    max-height: 0;
                    overflow: hidden
                }
        
                @media (max-width:620px) {
                    .desktop_hide table.icons-inner {
                        display: inline-block !important
                    }
        
                    .icons-inner {
                        text-align: center
                    }
        
                    .icons-inner td {
                        margin: 0 auto
                    }
        
                    .image_block img.big,
                    .row-content {
                        width: 100% !important
                    }
        
                    .mobile_hide {
                        display: none
                    }
        
                    .stack .column {
                        width: 100%;
                        display: block
                    }
        
                    .mobile_hide {
                        min-height: 0;
                        max-height: 0;
                        max-width: 0;
                        overflow: hidden;
                        font-size: 0
                    }
        
                    .desktop_hide,
                    .desktop_hide table {
                        display: table !important;
                        max-height: none !important
                    }
                }
            </style>
        </head>
        
        <body style="background-color:#d9dffa;margin:0;padding:0;-webkit-text-size-adjust:none;text-size-adjust:none">
            <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
                style="mso-table-lspace:0;mso-table-rspace:0;background-color:#d9dffa">
                <tbody>
                    <tr>
                        <td>
                            <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0"
                                role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;background-color:#cfd6f4">
                                <tbody>
                                    <tr>
                                        <td>
                                            <table class="row-content stack" align="center" border="0" cellpadding="0"
                                                cellspacing="0" role="presentation"
                                                style="mso-table-lspace:0;mso-table-rspace:0;color:#000;width:600px"
                                                width="600">
                                                <tbody>
                                                    <tr>
                                                        <td class="column column-1" width="100%"
                                                            style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;padding-top:20px;padding-bottom:0;border-top:0;border-right:0;border-bottom:0;border-left:0">
                                                            <table class="image_block block-1" width="100%" border="0"
                                                                cellpadding="0" cellspacing="0" role="presentation"
                                                                style="mso-table-lspace:0;mso-table-rspace:0">
                                                                <tr>
                                                                    <td class="pad"
                                                                        style="width:100%;padding-right:0;padding-left:0">
                                                                        <div class="alignment" align="center"
                                                                            style="line-height:10px"><img class="big"
                                                                                src="https://d1oco4z2z1fhwp.cloudfront.net/templates/default/3991/animated_header.gif"
                                                                                style="display:block;height:auto;border:0;width:600px;max-width:100%"
                                                                                width="600"
                                                                                alt="Card Header with Border and Shadow Animated"
                                                                                title="Card Header with Border and Shadow Animated">
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0"
                                role="presentation"
                                style="mso-table-lspace:0;mso-table-rspace:0;background-color:#d9dffa;background-image:url(https://d1oco4z2z1fhwp.cloudfront.net/templates/default/3991/body_background_2.png);background-repeat:repeat;background-position:top center">
                                <tbody>
                                    <tr>
                                        <td>
                                            <table class="row-content stack" align="center" border="0" cellpadding="0"
                                                cellspacing="0" role="presentation"
                                                style="mso-table-lspace:0;mso-table-rspace:0;color:#000;width:600px"
                                                width="600">
                                                <tbody>
                                                    <tr>
                                                        <td class="column column-1" width="100%"
                                                            style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;padding-left:50px;padding-right:50px;vertical-align:top;padding-top:15px;padding-bottom:15px;border-top:0;border-right:0;border-bottom:0;border-left:0">
                                                            <table class="text_block block-1" width="100%" border="0"
                                                                cellpadding="10" cellspacing="0" role="presentation"
                                                                style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word">
                                                                <tr>
                                                                    <td class="pad">
                                                                        <div style="font-family:sans-serif">
                                                                            <div class="txtTinyMce-wrapper"
                                                                                style="font-size:14px;mso-line-height-alt:16.8px;color:#506bec;line-height:1.2;font-family:Helvetica Neue,Helvetica,Arial,sans-serif">
                                                                                <p style="margin:0;font-size:14px"><strong><span
                                                                                            style="font-size:38px;">Forgot your
                                                                                            password?</span></strong></p>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                            <table class="text_block block-2" width="100%" border="0"
                                                                cellpadding="10" cellspacing="0" role="presentation"
                                                                style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word">
                                                                <tr>
                                                                    <td class="pad">
                                                                        <div style="font-family:sans-serif">
                                                                            <div class="txtTinyMce-wrapper"
                                                                                style="font-size:14px;mso-line-height-alt:16.8px;color:#40507a;line-height:1.2;font-family:Helvetica Neue,Helvetica,Arial,sans-serif">
                                                                                <p style="margin:0;font-size:14px"><span
                                                                                        style="font-size:16px;">Hey, we received
                                                                                        a request to reset your password.</span>
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                            <table class="text_block block-3" width="100%" border="0"
                                                                cellpadding="10" cellspacing="0" role="presentation"
                                                                style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word">
                                                                <tr>
                                                                    <td class="pad">
                                                                        <div style="font-family:sans-serif">
                                                                            <div class="txtTinyMce-wrapper"
                                                                                style="font-size:14px;mso-line-height-alt:16.8px;color:#40507a;line-height:1.2;font-family:Helvetica Neue,Helvetica,Arial,sans-serif">
                                                                                <p style="margin:0;font-size:14px"><span
                                                                                        style="font-size:16px;">Let’s get you a
                                                                                        new one!</span></p>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                            <table class="button_block block-4" width="100%" border="0"
                                                                cellpadding="0" cellspacing="0" role="presentation"
                                                                style="mso-table-lspace:0;mso-table-rspace:0">
                                                                <tr>
                                                                    <td class="pad"
                                                                        style="text-align:left;padding-top:20px;padding-right:10px;padding-bottom:20px;padding-left:10px">
                                                                        <div class="alignment" align="left">
                                                                            <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="#" style="height:48px;width:212px;v-text-anchor:middle;" arcsize="34%" stroke="false" fillcolor="#506bec"><w:anchorlock/><v:textbox inset="5px,0px,0px,0px"><center style="color:#ffffff; font-family:Arial, sans-serif; font-size:15px"><![endif]-->
                                                                            <a href="http://localhost:3000/reset?token=${token}"
                                                                                target="_blank"
                                                                                style="text-decoration:none;display:inline-block;color:#ffffff;background-color:#506bec;border-radius:16px;width:auto;border-top:0px solid TRANSPARENT;font-weight:undefined;border-right:0px solid TRANSPARENT;border-bottom:0px solid TRANSPARENT;border-left:0px solid TRANSPARENT;padding-top:8px;padding-bottom:8px;font-family:Helvetica Neue, Helvetica, Arial, sans-serif;text-align:center;mso-border-alt:none;word-break:keep-all;"><span
                                                                                    style="padding-left:25px;padding-right:20px;font-size:15px;display:inline-block;letter-spacing:normal;"><span
                                                                                        style="font-size: 16px; line-height: 2; word-break: break-word; mso-line-height-alt: 32px;"><span
                                                                                            style="font-size: 15px; line-height: 30px;"
                                                                                            data-mce-style="font-size: 15px; line-height: 30px;"><strong>RESET
                                                                                                MY
                                                                                                PASSWORD</strong></span></span></span></a>
                                                                            <!--[if mso]></center></v:textbox></v:roundrect><![endif]-->
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                            <table class="text_block block-5" width="100%" border="0"
                                                                cellpadding="10" cellspacing="0" role="presentation"
                                                                style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word">
                                                                <tr>
                                                                    <td class="pad">
                                                                        <div style="font-family:sans-serif">
                                                                            <div class="txtTinyMce-wrapper"
                                                                                style="font-size:14px;mso-line-height-alt:16.8px;color:#40507a;line-height:1.2;font-family:Helvetica Neue,Helvetica,Arial,sans-serif">
                                                                                <p style="margin:0;font-size:14px"><span
                                                                                        style="font-size:14px;">This link will
                                                                                        expire in the next 24 hours.
                                                                                    </span>
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                            <table class="text_block block-6" width="100%" border="0"
                                                                cellpadding="10" cellspacing="0" role="presentation"
                                                                style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word">
                                                                <tr>
                                                                    <td class="pad">
                                                                        <div style="font-family:sans-serif">
                                                                            <div class="txtTinyMce-wrapper"
                                                                                style="font-size:14px;mso-line-height-alt:16.8px;color:#40507a;line-height:1.2;font-family:Helvetica Neue,Helvetica,Arial,sans-serif">
                                                                                <p style="margin:0;font-size:14px">Didn’t
                                                                                    request a password reset? You can ignore
                                                                                    this message.</p>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0"
                                role="presentation" style="mso-table-lspace:0;mso-table-rspace:0">
                                <tbody>
                                    <tr>
                                        <td>
                                            <table class="row-content stack" align="center" border="0" cellpadding="0"
                                                cellspacing="0" role="presentation"
                                                style="mso-table-lspace:0;mso-table-rspace:0;color:#000;width:600px"
                                                width="600">
                                                <tbody>
                                                    <tr>
                                                        <td class="column column-1" width="100%"
                                                            style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;padding-top:0;padding-bottom:5px;border-top:0;border-right:0;border-bottom:0;border-left:0">
                                                            <table class="image_block block-1" width="100%" border="0"
                                                                cellpadding="0" cellspacing="0" role="presentation"
                                                                style="mso-table-lspace:0;mso-table-rspace:0">
                                                                <tr>
                                                                    <td class="pad"
                                                                        style="width:100%;padding-right:0;padding-left:0">
                                                                        <div class="alignment" align="center"
                                                                            style="line-height:10px"><img class="big"
                                                                                src="https://d1oco4z2z1fhwp.cloudfront.net/templates/default/3991/bottom_img.png"
                                                                                style="display:block;height:auto;border:0;width:600px;max-width:100%"
                                                                                width="600"
                                                                                alt="Card Bottom with Border and Shadow Image"
                                                                                title="Card Bottom with Border and Shadow Image">
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0"
                                role="presentation" style="mso-table-lspace:0;mso-table-rspace:0">
                                <tbody>
                                    <tr>
                                        <td>
                                            <table class="row-content stack" align="center" border="0" cellpadding="0"
                                                cellspacing="0" role="presentation"
                                                style="mso-table-lspace:0;mso-table-rspace:0;color:#000;width:600px"
                                                width="600">
                                                <tbody>
                                                    <tr>
                                                        <td class="column column-1" width="100%"
                                                            style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;padding-left:10px;padding-right:10px;vertical-align:top;padding-top:10px;padding-bottom:20px;border-top:0;border-right:0;border-bottom:0;border-left:0">
                                                            <table class="image_block block-1" width="100%" border="0"
                                                                cellpadding="10" cellspacing="0" role="presentation"
                                                                style="mso-table-lspace:0;mso-table-rspace:0">
                                                                <tr>
        
                                                                </tr>
                                                            </table>
        
        
                                                            <table class="text_block block-5" width="100%" border="0"
                                                                cellpadding="10" cellspacing="0" role="presentation"
                                                                style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word">
                                                                <tr>
                                                                    <td class="pad">
                                                                        <div style="font-family:sans-serif">
                                                                            <div class="txtTinyMce-wrapper"
                                                                                style="font-size:14px;mso-line-height-alt:16.8px;color:#97a2da;line-height:1.2;font-family:Helvetica Neue,Helvetica,Arial,sans-serif">
                                                                                <p
                                                                                    style="margin:0;text-align:center;font-size:12px">
                                                                                    <span style="font-size:12px;">Copyright©
                                                                                        2022</span>
                                                                                </p>
        
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
        
                        </td>
                    </tr>
                </tbody>
            </table><!-- End -->
        </body>
        
        </html>
        `, // html body
    };

    User.updateOne(
      { email: userData.email },
      { $set: { resetToken: token } }
    ).then((result) => {
      transporter.sendMail(mailOptions);
      res.json({ message: "Please check your email" });
    });
  });
});

//verifyTOken
app.get("/verify-token", async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await User.findOne({ resetToken: token });
    if (!tokenData)
      return res
        .status(200)
        .json({ success: false, msg: "This link has been expired" });
    if (tokenData)
      return res
        .status(200)
        .json({ success: true, msg: "This token still valid" });
  } catch (err) {
    console.log(err);
  }
});
//reset password
app.post("/reset-password", async (req, res) => {
  try {
    const token = req.query.token;
    if (req.body.confirmPassword !== req.body.password) {
      return res
        .status(400)
        .json("confirm password does not match with password");
    }

    const tokenData = await User.findOne({ resetToken: token });
    if (!tokenData)
      return res
        .status(400)
        .json({ success: false, response: "This link has been expired" });
    if (tokenData) {
      const salt = await bcrypt.genSalt(10);
      const newPassword = await bcrypt.hash(req.body.password, salt);
      const userData = await User.findOneAndUpdate(
        { _id: tokenData._id },
        { $set: { password: newPassword, resetToken: "" } },
        { new: true }
      );
      res
        .status(200)
        .json({ success: true, msg: "Your password has been reset", userData });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ success: false, response: "This link has been expired" });
  }
});

// update user by id
app.post("/edituser", async (req, res) => {
  try {
    const email = req.body.email;
    const newinfoData = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      genders: req.body.genders,
      adresse: req.body.adresse,
      birthdate: req.body.birthdate,
      image: req.body.image,
    };

    const updateData = await User.findOneAndUpdate(
      { email: email },
      {
        $set: {
          firstname: newinfoData.firstname,
          lastname: newinfoData.lastname,
          genders: newinfoData.genders,
          adresse: newinfoData.adresse,
          birthdate: newinfoData.birthdate,
          image: newinfoData.image,
        },
      },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "Your data has been updated",
      updateData,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// update user by id
app.post("/editinfo", async (req, res) => {
  try {
    const email = req.body.email;
    const newinfoData = {
      name: req.body.name,
      email: req.body.email,
    };

    const updateData = await User.findOneAndUpdate(
      { email: email },
      {
        $set: {
          name: newinfoData.name,
          email: newinfoData.email,
        },
      },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "Your data has been updated",
      updateData,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// update user by id
app.post("/editmedecin", async (req, res) => {
  try {
    const email = req.body.email;
    const newinfoData = {
      specialite: req.body.specialite,
      experience: req.body.experience,
      patient: req.body.patient,
      rating: req.body.rating,
    };

    const updateData = await User.findOneAndUpdate(
      { email: email },
      {
        $set: {
          specialite: newinfoData.specialite,
          experience: newinfoData.experience,
          patient: newinfoData.patient,
          rating: newinfoData.rating,
        },
      },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "Your data has been updated",
      updateData,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// edit role
app.post("/editrole", async (req, res) => {
  try {
    const email = req.body.email;
    const newinfoData = {
      role: req.body.role,
    };
    const updateData = await User.findOneAndUpdate(
      { email: email },
      {
        $set: {
          role: newinfoData.role,
        },
      },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "Your data has been updated",
      updateData,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

//recherche spécialiter
/*
app.get("/recherche", async (req, res) => {
  try {
    let medecin = await User.find({ role: "medecin" }).select([
      "specialite",
      "role",
    ]);
    return res.status(200).json({ ms: medecin });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});*/

// recherche spécialiter  par medecin

app.get("/recherche/specialite", async (req, res) => {
  try {
    let medecin = await User.find({ specialite: req.body.specialite }).select([
      "name",
      "specialite",
      "experience",
      "patient",
      "rating",
      "description",
    ]);
    return res.status(200).json({ ms: medecin });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/patientdata", async (req, res) => {
  try {
    let patient = await User.find({ role: "patient" }).select([
      "firstname",
      "lastname",
      "genders",
      "adresse",
      "birthdate",
      "name",
    ]);
    return res.status(200).json({ ms: patient });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/doctordata", async (req, res) => {
  try {
    let doctor = await User.find({ role: "doctor" }).select([
      "name",
      "specialite",
      "experience",
      "patient",
      "rating",
      "description",
    ]);
    return res.status(200).json({ ms: doctor });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

//count specialiter grouped by

app.get("/groupspecialiter", async (req, res) => {
  try {
    let specialite = await User.aggregate([
      {
        $group: {
          _id: "$specialite",
          count: { $sum: 1 }, // this means that the count will increment by 1
        },
      },
    ]);
    return res.status(200).json({ message: specialite });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// create test

app.post("/addtest", async (req, res) => {
  try {
    //create new user
    const newTest = new Test({
      test_status: req.body.test_status,
      test_name: req.body.test_name,
    });

    //save test and respond
    const test = await newTest.save();
    res
      .status(200, { status: "ok", test })
      .json({ status: "Test created successfully!", test });
  } catch (err) {
    console.log(err);
    res.status(500, { status: "error" }).json({ status: "error" });
  }
});

// delete test by id
app.delete("/delete/test/:_id", async (req, res) => {
  console.log(req.params);
  let data = await User.deleteOne(req.params);
  res.send(data);
});

//configure multer

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload a valid image file"));
    }
    cb(undefined, true);
  },
});

app.post("/image", upload.single("upload"), async (req, res) => {
  try {
    const _id = req.body._id;
    await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toFile(__dirname + `/images/${req.file.originalname}`);
    const x = await User.findByIdAndUpdate(
      { _id: _id },
      { $set: { image: `/images/${req.file.originalname}` } }
    );
    res.status(201).send("Image uploaded succesfully");
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

// Listener
app.listen(port, () => {
  console.log(`listening on localhost:${port} 🚪 `);
});
