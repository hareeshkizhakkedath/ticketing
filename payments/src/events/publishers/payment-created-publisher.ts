import { Publisher , Subjects, PaymentCreatedEvent } from "@hari-ticket/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
    subject:Subjects.PaymentCreated=Subjects.PaymentCreated;
    
}