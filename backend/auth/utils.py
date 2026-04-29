import smtplib
import os
from email.message import EmailMessage
from utils.config import SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM_NAME, EMAIL_FROM

def send_otp_email(to_email: str, otp: str):
    # Construct the email message
    msg = EmailMessage()
    msg["Subject"] = "Your PromptForge OTP"
    msg["From"] = f"{EMAIL_FROM_NAME} <{EMAIL_FROM}>"
    msg["To"] = to_email
    msg.set_content(f"Your verification code is: {otp}\nThis code expires in 5 minutes.")

    # 1. Check for missing credentials first
    if not SMTP_USER or not SMTP_PASS:
        print(f"[DEV EMAIL] OTP for {to_email}: {otp}")
        return True

    try:
        # 2. Use SMTP_SSL and Port 465 for better deployment compatibility
        # If your SMTP_PORT is 465, use SMTP_SSL. If 587, use SMTP + starttls.
        if str(SMTP_PORT) == "465":
            with smtplib.SMTP_SSL(SMTP_HOST, int(SMTP_PORT), timeout=10) as server:
                server.login(SMTP_USER, SMTP_PASS)
                server.send_message(msg)
        else:
            with smtplib.SMTP(SMTP_HOST, int(SMTP_PORT), timeout=10) as server:
                server.starttls()  # Upgrade connection to secure
                server.login(SMTP_USER, SMTP_PASS)
                server.send_message(msg)
        
        return True
    except Exception as e:
        # Check your deployment logs (Render/Railway/Vercel) for this message
        print(f"CRITICAL: Failed to send email: {e}")
        return False