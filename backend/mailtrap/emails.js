const mailtrapClient = require('./mailtrap.config');
const { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } = require('../mailtrap/emailTemplate');

// Function to send a general email
const sendEmail = async (options) => {
  // Get the transporter from the mailtrap client
  const transporter = mailtrapClient();

  const message = {
    from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  await transporter.sendMail(message);  // Use the transporter to send the email
};

// Function to send a welcome email
const sendWelcomeEmail = async (email, name) => {
  // Get the transporter from the mailtrap client
  const transporter = mailtrapClient();

  const message = {
    from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject: "Welcome Email",
    text: `Dear ${name}, your auth account was verified successfully!`,
  };

  await transporter.sendMail(message);  // Use the transporter to send the email
};

const sendpasswordResetEmail = async (email, resetUrl) => {

  // Get the transporter from the mailtrap client
  const transporter = mailtrapClient();

  const message = {
    from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject: "Reset Your Password",
    html:PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetUrl),
    category:"Password Reset"
  };

  await transporter.sendMail(message);

};

const sendResetSuccessemail = async(email)=>{

  try {
    const transporter = mailtrapClient();
    const message = {
      from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: "Reset Password Success",
      html:PASSWORD_RESET_SUCCESS_TEMPLATE,
      category:"Password Reset"
    }
    await transporter.sendMail(message);
  } catch (error) {
    console.log(`sendResetSuccessemail Error: ${error}`);
  }
};



// Export both functions correctly
module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendpasswordResetEmail,
  sendResetSuccessemail,
};
