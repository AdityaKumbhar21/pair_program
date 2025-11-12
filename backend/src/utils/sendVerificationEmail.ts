import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendVerificationEmail(email:string, token:string){
    const verifyLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/api/auth/verify-email?code=${token}&email=${email}`;

    try {
    await resend.emails.send({
        from: 'Pair Program <onboarding@resend.dev>',
        to: email,
        subject: 'Verify your email – CodePair Pro',
        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #ddd;border-radius:8px;">
                <h2 style="color:#2563eb;">Welcome to Pair Program!</h2>
                <p>Click the button below to verify your email and start coding interviews.</p>
                <a href="${verifyLink}" 
                style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;margin:16px 0;">
                Verify Email
                </a>
                <p>Or copy: <code>${verifyLink}</code></p>
                <p style="color:#666;font-size:12px;">Link expires in 15 minutes.</p>
            </div>
            `,
    })
} catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");   
}
}