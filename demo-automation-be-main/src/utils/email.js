const nodemailer = require("nodemailer")
const ejs = require("ejs")
const htmlToText = require("html-to-text")

module.exports = class Email {
  constructor(email, name, url) {
    this.to = email
    this.firstName = name?.split(" ")[0]
    this.url = url
    this.from = `<${process.env.EMAIL_FROM}>`
    
  }

  newTransport() {
    return nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_HOST_USER,
        pass: process.env.EMAIL_HOST_PASSWORD
      }
    })
  }
  async sendTextEmail(subject, text, data) {
    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text
    }
    if (data?.attachment) {
      // Attach the saved attachment to the email
      mailOptions.attachments = [data.attachment]
    }
    // 3) Create a transport and send email
    await this.newTransport()
      .sendMail(mailOptions)
      .catch(x => console.log(x))
  }
  // Send the actual email
  async send(template, subject, data) {
    // 1) Render HTML based on an EJS template
    const html = await ejs.renderFile(`${__dirname}/../views/email/${template}.ejs`, {
      firstName: this.firstName,
      url: this.url,
      subject,
      data
    })

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
    }
    if (data?.attachment) {
      // Attach the saved attachment to the email
      mailOptions.attachments = [data.attachment]
    }
    // 3) Create a transport and send email
    await this.newTransport()
      .sendMail(mailOptions)
      .catch(x => console.log(x))
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to the Natours Family!")
  }

  async sendPasswordReset() {
    await this.send("passwordReset", "Your password reset token (valid for only 10 minutes)")
  }
  async sendOtp(otp) {
    await this.send("passwordReset", "Your OTP for Password Reset", { otp });
  }
}
