import { Subjects,Publisher, OrderCancelledEvent } from "@hari-ticket/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
    subject:Subjects.OrderCancelled=Subjects.OrderCancelled;
}