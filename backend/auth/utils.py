import smtplib
from email.message import EmailMessage
from utils.config import SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM_NAME, EMAIL_FROM


def send_otp_email(to_email: str, otp: str):
    msg = EmailMessage()
    msg["Subject"] = "Your PromptForge OTP"
    msg["From"] = f"{EMAIL_FROM_NAME} <{EMAIL_FROM}>"
    msg["To"] = to_email
    msg.set_content(f"Your verification code is: {otp}\nThis code expires in 5 minutes.")

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
