import { Publisher, OrderCreatedEvent, Subjects } from "@hari-ticket/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
    subject: Subjects.OrderCreated=Subjects.OrderCreated;
}