import smtplib
from email.message import EmailMessage
from utils.config import SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM_NAME, EMAIL_FROM

def send_otp_email(to_email: str, otp: str):
    # Construct the email message
    msg = EmailMessage()
    msg["Subject"] = "Your PromptForge OTP"
    # Ensure EMAIL_FROM in your config matches your verified Brevo sender
    msg["From"] = f"{EMAIL_FROM_NAME} <{EMAIL_FROM}>"
    msg["To"] = to_email
    msg.set_content(f"Your verification code is: {otp}\nThis code expires in 5 minutes.")

    # 1. Fallback for local development if credentials aren't set
    if not SMTP_USER or not SMTP_PASS:
        print(f"[DEV EMAIL] OTP for {to_email}: {otp}")
        return True

    try:
        # 2. Port 587 requires SMTP + .starttls()
        # We increase the timeout to 15s to account for cloud network latency
        server = smtplib.SMTP(SMTP_HOST, int(SMTP_PORT), timeout=15)
        
        # Identify ourselves to the server
        server.ehlo() 
        # Secure the connection
        server.starttls() 
        # Re-identify over the secure connection
        server.ehlo() 
        
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)
        server.quit()
        
        return True
    except Exception as e:
        # This will now print the specific Brevo error in your Render logs
        print(f"CRITICAL: Failed to send email via Brevo: {e}")
        return False