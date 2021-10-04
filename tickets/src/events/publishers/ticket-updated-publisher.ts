import { Publisher,Subjects,TicketUpdatedEvent } from "@hari-ticket/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
    subject:Subjects.TicketUpdated=Subjects.TicketUpdated
}