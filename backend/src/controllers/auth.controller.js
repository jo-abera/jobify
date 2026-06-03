/**
 * Authentication Controller
 *
 *
 */

// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const { OAuth2Client } = require("google-auth-library");
// const prisma = require("../config/db");

// const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// // function generateToken(user) {
// //   return jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
// // }

// /** Builds a JWT token for the given user with expiration */
// /** Builds JWT + safe user payload returned after any successful authentication(signin) */
// function issueToken(user) {
//   const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
//     expiresIn: "7d",
//   });
//   return {
//     token,
//     user: {
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       avatar: user.avatar,
//     },
//   };
// }

// exports.register = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     // Basic validation input
//     if (!name || !email || !password) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     // Password strength validation: at least 6 characters, including letters and numbers using regex
//     const strongPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

//     if (!strongPassword.test(password)) {
//       return res.status(400).json({
//         message:
//           "Password must contain at least 6 characters, including letters and numbers",
//       });
//     }



//     const existing = await prisma.user.findUnique({ where: { email } });
//     if (existing) {
//       // Prevent duplicate email when account was created via Google first.
//       if (!existing.password && existing.googleId) {
//         return res.status(400).json({
//           message:
//             "This email uses Google sign-in. Click Continue with Google.",
//         });
//       }
//       return res.status(400).json({ message: "Email already in use." });
//     }
//     const hashed = await bcrypt.hash(password, 10);
//     const user = await prisma.user.create({
//       data: { name, email, password: hashed },
//     });
//     res.json(issueToken(user));
//   } catch (error) {
//     res.status(500).json({ message: "Registration failed." });
//   }
// };
