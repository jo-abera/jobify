/**
 * Passport Google OAuth20 strategy.
 *
 * Links existing email accounts or creates Google-only users with a placeholder
 * password. Strategy registers only when GOOGLE_CLIENT_ID/SECRET are set.
 */

const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const prisma = require('./db')

const GOOGLE_PLACEHOLDER_PASSWORD = 'GOOGLE_OAUTH_NO_PASSWORD'

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value
          if (!email) {
            return done(new Error('Google account has no email'), null)
          }

          let user = await prisma.user.findUnique({ where: { email } })

          if (user) {
            if (!user.googleId) {
              user = await prisma.user.update({
                where: { id: user.id },
                data: { googleId: profile.id, isVerified: true }
              })
            }
            return done(null, user)
          }

          const newUser = await prisma.user.create({
            data: {
              name: profile.displayName || email.split('@')[0],
              email,
              password: GOOGLE_PLACEHOLDER_PASSWORD,
              googleId: profile.id,
              isVerified: true
            }
          })

          return done(null, newUser)
        } catch (err) {
          return done(err, null)
        }
      }
    )
  )
} else {
  console.warn('[auth] Google OAuth disabled — set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env')
}

module.exports = passport
