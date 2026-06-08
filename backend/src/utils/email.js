/**
 * Transactional email helper (nodemailer).
 *
 * Used after registration (welcome) and forgot-password (reset link).
 * Configure Mailtrap in .env for dev; if EMAIL_HOST is missing, callers
 * should catch failures and not block the main auth flow.
 */

const nodemailer = require('nodemailer')

class Email {
  constructor(user, url) {
    this.to = user.email
    this.name = user.name.split(' ')[0]
    this.url = url
    this.from = process.env.EMAIL_FROM || 'jobify@example.com'
  }

  createTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 2525,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    })
  }

  /** Returns false when SMTP is not configured (local dev without Mailtrap). */
  static isConfigured() {
    return Boolean(process.env.EMAIL_HOST && process.env.EMAIL_USERNAME)
  }

  async send(subject, message) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #f5f5f5; padding: 32px; border-radius: 12px;">
          <h1 style="color: #2563eb; margin-bottom: 24px;">Jobify</h1>
          <p style="font-size: 16px; line-height: 1.6;">Hi ${this.name},</p>
          <p style="font-size: 16px; line-height: 1.6;">${message}</p>
          <a href="${this.url}"
             style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">
            Click Here
          </a>
          <p style="margin-top: 24px; font-size: 13px; color: #a3a3a3;">
            If you did not request this, please ignore this email.
          </p>
        </div>
      `
    }
    await this.createTransport().sendMail(mailOptions)
  }

  async sendWelcome() {
    await this.send(
      'Welcome to Jobify!',
      'Welcome to Jobify! We are excited to help you find your next job. Start browsing job listings and track your applications in one place.'
    )
  }

  async sendPasswordReset() {
    await this.send(
      'Your password reset link (valid for 10 minutes)',
      'You requested a password reset. Click the button below to set a new password. This link expires in 10 minutes.'
    )
  }
}

module.exports = Email
