const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendEmail = async (options) => {
  const mailOptions = {
    from: process.env.SMTP_USER || 'noreply@buspass.com',
    to: options.to,
    subject: options.subject,
    html: options.html || options.text
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
};

const sendApplicationStatusEmail = async (user, application, status) => {
  const statusMessages = {
    approved: {
      subject: '🎉 Your Bus Pass Application Approved!',
      html: `
        <h1>Congratulations ${user.name}!</h1>
        <p>Your bus pass application has been <strong>APPROVED</strong>.</p>
        <p><strong>Application ID:</strong> ${application.applicationId}</p>
        <p><strong>Pass Number:</strong> ${application.passNumber}</p>
        <p><strong>Valid From:</strong> ${new Date(application.startDate).toLocaleDateString()}</p>
        <p><strong>Valid Till:</strong> ${new Date(application.endDate).toLocaleDateString()}</p>
        <p>You can now download and print your bus pass from your dashboard.</p>
        <p>Thank you for using our service!</p>
      `
    },
    rejected: {
      subject: '❌ Bus Pass Application Status Update',
      html: `
        <h1>Hello ${user.name},</h1>
        <p>Your bus pass application has been <strong>REJECTED</strong>.</p>
        <p><strong>Application ID:</strong> ${application.applicationId}</p>
        <p><strong>Reason:</strong> ${application.remarks || 'Please contact support for more information'}</p>
        <p>If you believe this is an error, please contact our support team.</p>
      `
    },
    pending: {
      subject: '📋 Bus Pass Application Received',
      html: `
        <h1>Hello ${user.name},</h1>
        <p>We have received your bus pass application.</p>
        <p><strong>Application ID:</strong> ${application.applicationId}</p>
        <p><strong>Status:</strong> Pending Review</p>
        <p>We will notify you once the review is complete.</p>
      `
    }
  };

  const message = statusMessages[status];
  if (message) {
    await sendEmail({
      to: user.email,
      subject: message.subject,
      html: message.html
    });
  }
};

const sendRenewalReminder = async (user, application) => {
  await sendEmail({
    to: user.email,
    subject: '🔔 Bus Pass Renewal Reminder',
    html: `
      <h1>Hello ${user.name},</h1>
      <p>Your bus pass is expiring soon!</p>
      <p><strong>Pass Number:</strong> ${application.passNumber}</p>
      <p><strong>Expires On:</strong> ${new Date(application.endDate).toLocaleDateString()}</p>
      <p>Please renew your pass to continue using our services without interruption.</p>
      <p><a href="${process.env.FRONTEND_URL}/renew/${application._id}">Click here to renew</a></p>
    `
  });
};

module.exports = { sendEmail, sendApplicationStatusEmail, sendRenewalReminder };
