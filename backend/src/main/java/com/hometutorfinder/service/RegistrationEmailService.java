package com.hometutorfinder.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class RegistrationEmailService {
    private static final Logger log = LoggerFactory.getLogger(RegistrationEmailService.class);
    private final JavaMailSender mailSender;
    private final String from;
    private final boolean enabled;

    public RegistrationEmailService(ObjectProvider<JavaMailSender> mailSender,
                                    @Value("${app.mail.from:}") String from,
                                    @Value("${app.mail.enabled:false}") boolean enabled) {
        this.mailSender = mailSender.getIfAvailable();
        this.from = from;
        this.enabled = enabled;
    }

    public record RegisteredUser(String email, String name, String role) {}

    public record SlotBooked(
            String studentEmail, String studentName,
            String tutorEmail, String tutorName,
            String subject, String date, String time, String message) {}

    public record PaymentCompleted(
            String studentEmail, String studentName,
            String tutorEmail, String tutorName,
            String subject, String date, String time,
            String amount, String paymentId) {}

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void sendWelcomeEmail(RegisteredUser user) {
        if (!enabled || mailSender == null) return;
        send(user.email(), "Welcome to Home Tutor Finder!", "Hello " + user.name() + ",\n\n" +
                "Your " + user.role().toLowerCase() + " account has been registered successfully.\n" +
                "You can now sign in and start using Home Tutor Finder.\n\n" +
                "Thank you,\nHome Tutor Finder Team");
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void sendSlotBookedEmails(SlotBooked booking) {
        if (!enabled || mailSender == null) return;
        String details = "Subject: " + booking.subject() + "\n" +
                "Date: " + booking.date() + "\n" +
                "Time: " + booking.time() + "\n\n";
        send(booking.studentEmail(), "Tutoring request submitted", "Hello " + booking.studentName() + ",\n\n" +
                "Your tutoring request has been sent to " + booking.tutorName() + ".\n\n" +
                details + "The tutor will review your request soon.\n\nHome Tutor Finder Team");
        send(booking.tutorEmail(), "New tutoring request received", "Hello " + booking.tutorName() + ",\n\n" +
                booking.studentName() + " has requested a tutoring slot.\n\n" +
                details + "Message: " + booking.message() + "\n\nPlease sign in to accept or reject the request.\n\nHome Tutor Finder Team");
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void sendPaymentCompletedEmails(PaymentCompleted payment) {
        if (!enabled || mailSender == null) return;
        String details = "Subject: " + payment.subject() + "\n" +
                "Date: " + payment.date() + "\n" +
                "Time: " + payment.time() + "\n" +
                "Amount: INR " + payment.amount() + "\n" +
                "Payment ID: " + payment.paymentId() + "\n\n";
        send(payment.studentEmail(), "Payment confirmed - tutoring session booked", "Hello " + payment.studentName() + ",\n\n" +
                "Your payment was confirmed and your tutoring session is booked with " + payment.tutorName() + ".\n\n" +
                details + "Home Tutor Finder Team");
        send(payment.tutorEmail(), "Payment received - tutoring session confirmed", "Hello " + payment.tutorName() + ",\n\n" +
                "Payment from " + payment.studentName() + " was confirmed for your tutoring session.\n\n" +
                details + "Home Tutor Finder Team");
    }

    private void send(String recipient, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(recipient);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
        } catch (Exception ex) {
            // Email failure must not roll back an already committed transaction.
            log.error("Could not send email to {}", recipient, ex);
        }
    }
}
