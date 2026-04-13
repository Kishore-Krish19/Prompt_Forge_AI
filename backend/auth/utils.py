import smtplib
import os
from email.message import EmailMessage

# Load SMTP config from environment (no silent defaults for user/pass)
SMTP_HOST = os.environ.get("SMTP_HOST")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
SMTP_USER = os.environ.get("SMTP_USER")
SMTP_PASS = os.environ.get("SMTP_PASS")
FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "PromptForge")
FROM_EMAIL = os.environ.get("EMAIL_FROM", SMTP_USER)


def send_otp_email(to_email: str, otp: str):
    msg = EmailMessage()
    msg["Subject"] = "Your PromptForge OTP"
    msg["From"] = f"{FROM_NAME} <{FROM_EMAIL}>"
    msg["To"] = to_email
    msg.set_content(f"Your verification code is: {otp}\nThis code expires in 5 minutes.")

    # Temporary debug logging to validate env loading
    print("SMTP_USER:", SMTP_USER)
    print("SMTP_PASS exists:", bool(SMTP_PASS))

    # Only fallback to dev logging when credentials are missing
    if not SMTP_USER or not SMTP_PASS:
        print(f"[DEV EMAIL] OTP for {to_email}: {otp}")
        return True

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)
        return True
    except Exception as e:
        print("Failed to send email:", e)
        return False
