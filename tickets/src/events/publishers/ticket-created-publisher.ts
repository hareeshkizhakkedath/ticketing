import { Publisher, Subjects,TicketCreatedEvent } from "@hari-ticket/common";

export class TicketCreatedPublisher extends Publisher< TicketCreatedEvent>{
    subject:Subjects.TicketCreated=Subjects.TicketCreated;
}