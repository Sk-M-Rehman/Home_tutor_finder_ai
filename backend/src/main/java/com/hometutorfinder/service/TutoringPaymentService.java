package com.hometutorfinder.service;

import com.hometutorfinder.dto.Dtos.PaymentOrderResponse;
import com.hometutorfinder.dto.Dtos.PaymentResponse;
import com.hometutorfinder.dto.Dtos.PaymentVerificationRequest;
import com.hometutorfinder.entity.PaymentStatus;
import com.hometutorfinder.entity.RequestStatus;
import com.hometutorfinder.entity.TutoringPayment;
import com.hometutorfinder.entity.TutoringRequest;
import com.hometutorfinder.exception.ApiException;
import com.hometutorfinder.repository.TutoringPaymentRepository;
import com.hometutorfinder.repository.TutoringRequestRepository;
import com.hometutorfinder.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class TutoringPaymentService {
    private final TutoringRequestRepository requests;
    private final TutoringPaymentRepository payments;
    private final RazorpayGateway razorpay;
    private final ApplicationEventPublisher events;

    @Transactional
    public PaymentOrderResponse createOrder(CurrentUser me, Long requestId) {
        TutoringRequest request = requests.findByIdForUpdate(requestId)
                .orElseThrow(() -> ApiException.notFound("Request not found"));
        assertStudentOwner(me, request);
        if (request.getStatus() != RequestStatus.ACCEPTED) {
            throw ApiException.conflict("Payment is available only after the tutor accepts the request.");
        }

        TutoringPayment payment = payments.findByRequest_Id(requestId).orElse(null);
        if (payment != null) {
            if (payment.getStatus() == PaymentStatus.PAID) {
                throw ApiException.conflict("This request has already been paid.");
            }
            return refreshPendingOrder(payment, request);
        }

        payment = new TutoringPayment();
        payment.setRequest(request);
        payment.setAmountPaise(request.getPaymentAmount().movePointRight(2).longValueExact());
        payment.setCurrency("INR");
        payment.setStatus(PaymentStatus.PENDING);
        return refreshPendingOrder(payment, request);
    }

    private PaymentOrderResponse refreshPendingOrder(TutoringPayment payment, TutoringRequest request) {
        long amountPaise = request.getPaymentAmount().movePointRight(2).longValueExact();
        RazorpayGateway.Order order = razorpay.createOrder(amountPaise, request.getId());
        if (order.amount() != amountPaise || !"INR".equals(order.currency())) {
            throw ApiException.badGateway("Razorpay returned an order with an unexpected amount or currency.");
        }
        payment.setRazorpayOrderId(order.id());
        payment.setAmountPaise(amountPaise);
        payment.setCurrency("INR");
        payment.setStatus(PaymentStatus.PENDING);
        payment = payments.save(payment);
        request.setPayment(payment);
        return orderResponse(payment, request);
    }

    @Transactional
    public PaymentResponse verify(CurrentUser me, Long requestId, PaymentVerificationRequest verification) {
        TutoringRequest request = requests.findByIdForUpdate(requestId)
                .orElseThrow(() -> ApiException.notFound("Request not found"));
        assertStudentOwner(me, request);
        TutoringPayment payment = payments.findByRequest_Id(requestId)
                .orElseThrow(() -> ApiException.conflict("No payment order exists for this request."));

        if (!payment.getRazorpayOrderId().equals(verification.razorpayOrderId())) {
            throw ApiException.badRequest("The payment order does not match this request.");
        }
        if (!razorpay.isValidSignature(
                verification.razorpayOrderId(),
                verification.razorpayPaymentId(),
                verification.razorpaySignature())) {
            throw ApiException.badRequest("Razorpay payment signature is invalid.");
        }
        if (payment.getStatus() == PaymentStatus.PAID) {
            if (!verification.razorpayPaymentId().equals(payment.getRazorpayPaymentId())) {
                throw ApiException.conflict("A different payment has already been recorded for this request.");
            }
            return paymentResponse(payment);
        }

        RazorpayGateway.PaymentDetails details = razorpay.fetchPayment(verification.razorpayPaymentId());
        if (!verification.razorpayPaymentId().equals(details.id())
                || !verification.razorpayOrderId().equals(details.orderId())
                || details.amount() != payment.getAmountPaise()
                || !"INR".equals(details.currency())
                || !"captured".equals(details.status())) {
            throw ApiException.conflict("Razorpay has not confirmed a captured payment for this request.");
        }

        payment.setRazorpayPaymentId(details.id());
        payment.setStatus(PaymentStatus.PAID);
        TutoringPayment saved = payments.save(payment);
        events.publishEvent(new RegistrationEmailService.PaymentCompleted(
                request.getStudent().getUser().getEmail(), request.getStudent().getUser().getFullName(),
                request.getTutor().getUser().getEmail(), request.getTutor().getUser().getFullName(),
                request.getSubject().getName(), request.getRequestedDate().toString(),
                request.getRequestedTime().toString(),
                BigDecimal.valueOf(saved.getAmountPaise(), 2).toPlainString(), saved.getRazorpayPaymentId()));
        return paymentResponse(saved);
    }

    private void assertStudentOwner(CurrentUser me, TutoringRequest request) {
        if (!request.getStudent().getUser().getId().equals(me.id())) {
            throw ApiException.forbidden("This is not your tutoring request.");
        }
    }

    private PaymentOrderResponse orderResponse(TutoringPayment payment, TutoringRequest request) {
        return new PaymentOrderResponse(
                razorpay.getKeyId(),
                payment.getRazorpayOrderId(),
                payment.getAmountPaise(),
                payment.getCurrency(),
                "Home Tutor Finder",
                "One-hour tutoring session with " + request.getTutor().getUser().getFullName());
    }

    private PaymentResponse paymentResponse(TutoringPayment payment) {
        BigDecimal amount = BigDecimal.valueOf(payment.getAmountPaise(), 2).setScale(2, RoundingMode.UNNECESSARY);
        return new PaymentResponse(
                payment.getRequest().getId(),
                payment.getRazorpayOrderId(),
                payment.getRazorpayPaymentId(),
                amount,
                payment.getCurrency(),
                payment.getStatus());
    }
}
