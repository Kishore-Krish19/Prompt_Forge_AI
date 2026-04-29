import smtplib
import sys
from email.message import EmailMessage
from utils.config import SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM_NAME, EMAIL_FROM

def send_otp_email(to_email: str, otp: str):
    msg = EmailMessage()
    msg["Subject"] = "Your PromptForge OTP"
    msg["From"] = f"{EMAIL_FROM_NAME} <{EMAIL_FROM}>"
    msg["To"] = to_email
    msg.set_content(f"Your verification code is: {otp}\nThis code expires in 5 minutes.")

    # Local development fallback
    if not SMTP_USER or not SMTP_PASS:
        print(f"[DEV ONLY] OTP for {to_email}: {otp}", file=sys.stderr)
        return True

    try:
        # 1. Initialize connection with a longer timeout for cloud stability
        server = smtplib.SMTP(SMTP_HOST, int(SMTP_PORT), timeout=25)
        
        # 2. Crucial handshake for Render/Brevo
        server.ehlo()          # Identify to server
        server.starttls()      # Force encryption
        server.ehlo()          # Re-identify over secure line
        
        # 3. Authenticate and send
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)
        server.quit()
        
        return True
    except Exception as e:
        # This will print the EXACT error in your Render Logs
        print(f"SMTP DEPLOYMENT FAILURE: {str(e)}", file=sys.stderr)
        return False