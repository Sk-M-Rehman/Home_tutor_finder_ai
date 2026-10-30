# Registration email notifications

After a successful student or tutor registration, the backend sends a welcome email **after the database transaction commits**. Email errors are logged and do not cancel registration.

## Setup

1. In `backend/.env` set `MAIL_ENABLED=true`, `MAIL_USERNAME` and `MAIL_FROM` to your Gmail address, and `MAIL_PASSWORD` to a **Google App Password** (not your regular Gmail password). App Passwords require eligible Google accounts with 2-Step Verification enabled.
2. Keep `MAIL_HOST=smtp.gmail.com` and `MAIL_PORT=587`.
3. From `backend/`, run `mvn spring-boot:run`. Start the frontend separately as usual.
4. Register a **new** student or tutor account and check that email inbox, including spam. Check backend logs if delivery fails.

Emails are disabled by default until you configure SMTP and set `MAIL_ENABLED=true`. Do not commit your `.env` file. This is a welcome notification, **not email address verification**.
