import requests
import os
import sys
from utils.config import BREVO_API_KEY, EMAIL_FROM, EMAIL_FROM_NAME

def send_otp_email(to_email: str, otp: str):
    """
    Sends an OTP email using Brevo's HTTP API (Port 443).
    This bypasses Render's SMTP port blocks.
    """
    url = "https://api.brevo.com/v3/smtp/email"
    
    # Payload configuration for Brevo API v3
    payload = {
        "sender": {
            "name": EMAIL_FROM_NAME,
            "email": EMAIL_FROM
        },
        "to": [{"email": to_email}],
        "subject": "Your PromptForge OTP",
        "htmlContent": f"""
            <html>
                <body style="font-family: sans-serif; line-height: 1.6;">
                    <div style="max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                        <h2 style="color: #333;">Verification Code</h2>
                        <p>Hello,</p>
                        <p>Your verification code for <strong>PromptForge AI</strong> is:</p>
                        <h1 style="background: #f4f4f4; padding: 10px; text-align: center; letter-spacing: 5px;">{otp}</h1>
                        <p>This code will expire in <strong>5 minutes</strong>.</p>
                        <p style="font-size: 0.8em; color: #777;">If you did not request this code, please ignore this email.</p>
                    </div>
                </body>
            </html>
        """
    }
    
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": BREVO_API_KEY
    }

    try:
        # Standard HTTPS POST request to Port 443
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        
        # Check if the request was successful (201 Created or 200 OK)
        if response.status_code in [200, 201]:
            return True
        else:
            # Logs the exact reason for failure to the Render dashboard
            print(f"BREVO API ERROR: {response.status_code} - {response.text}", file=sys.stderr)
            return False
            
    except Exception as e:
        # Logs connection or unexpected runtime errors
        print(f"API CONNECTION FATAL ERROR: {str(e)}", file=sys.stderr)
        return False