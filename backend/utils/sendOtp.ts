import nodemailer from "nodemailer";

const sendOtp = async (email: string, otp: string) => {

    // Create a test account or replace with real credentials.
    console.log("Sending email to:", process.env.EMAIL_USER as string);
    const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER as string,
        pass: process.env.EMAIL_PASS as string,
    },
    });


    (async () => {
    const info = await transporter.sendMail({
        from: `"Todo App" <${process.env.EMAIL_USER}>`, 
        to: email,
        subject: "Your OTP Code",
        text: otp, 
        html: `<b>Your OTP Code is: ${otp}</b>`,
    });

    console.log("Message sent:", email, info.messageId);
    })()
};

export default sendOtp;