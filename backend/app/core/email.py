import os
from email.message import EmailMessage

import aiosmtplib


async def send_reset_email(to_email: str, reset_token: str):
    reset_link = f"{os.getenv('FRONTEND_RESET_URL')}?token={reset_token}"

    message = EmailMessage()
    message["From"] = f"{os.getenv('MAIL_FROM_NAME')} <{os.getenv('MAIL_FROM')}>"
    message["To"] = to_email
    message["Subject"] = "【YourApp】パスワードリセットリンクのお知らせ"

    message.set_content(f"""
以下のリンクからパスワードをリセットしてください：
{reset_link}

このリンクは一定時間後に無効になります。
""")

    await aiosmtplib.send(
        message,
        hostname=os.getenv("MAIL_SERVER"),
        port=int(os.getenv("MAIL_PORT")),
        start_tls=True,
        username=os.getenv("MAIL_USERNAME"),
        password=os.getenv("MAIL_PASSWORD"),
    )
