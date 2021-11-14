import { Listener,OrderCancelledEvent,Subjects } from "@hari-ticket/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class orderCancelledListener extends Listener<OrderCancelledEvent>{
    subject:Subjects.OrderCancelled=Subjects.OrderCancelled;
    queueGroupName=queueGroupName;
    async onMessage(data:OrderCancelledEvent['data'],msg:Message){
        const ticket=await Ticket.findById(data.ticket.id);

        if(!ticket){
            throw new Error("ticket not found");
        }

        ticket.set({orderId:undefined})

        ticket.save();

        await new TicketUpdatedPublisher(this.client).publish({
            id:ticket.id,
            orderId:ticket.orderId,
            userId:ticket.userId,
            price:ticket.price,
            title:ticket.title,
            version:ticket.version
        })

        msg.ack();
    }
}