import { Listener , OrderCreatedEvent ,Subjects} from "@hari-ticket/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";

export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
    queueGroupName=queueGroupName;
    subject:Subjects.OrderCreated=Subjects.OrderCreated;
    async onMessage(data:OrderCreatedEvent['data'], msg:Message){
        const order=await Order.build({
            id:data.id,
            version:data.version,
            status:data.status,
            price:data.ticket.price,
            userId:data.userId   
        });
        await order.save();

        msg.ack();
    }
}