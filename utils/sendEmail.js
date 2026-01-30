import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendWithGmail = async (to, subject, html) => {
  const mailOptions = {
    from: `Bay Sa Waar <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transport.sendMail(mailOptions);
    console.log('✅ Email envoyé via Gmail:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Erreur Gmail:', error);
    return null;
  }
};

const sendWithResend = async (to, subject, html) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY manquant');
      return null;
    }

    const { data, error } = await resend.emails.send({
      from: 'Bay Sa Waar <onboarding@resend.dev>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('❌ Erreur Resend:', error);
      return null;
    }

    console.log('✅ Email envoyé via Resend:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Exception sendEmail (Resend):', error);
    return null;
  }
};

const sendEmail = async (to, subject, html) => {
  const provider = process.env.EMAIL_PROVIDER || 'gmail';

  if (provider === 'resend') {
    return await sendWithResend(to, subject, html);
  } else {
    return await sendWithGmail(to, subject, html);
  }
};

export default sendEmail;
