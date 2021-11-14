import { OrderCancelledEvent , Listener , Subjects} from "@hari-ticket/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";
import { OrderStatus } from "@hari-ticket/common";
export class OrderCancelledListener extends Listener<OrderCancelledEvent>{
    subject:Subjects.OrderCancelled=Subjects.OrderCancelled;
    queueGroupName=queueGroupName;
    async onMessage (data:OrderCancelledEvent['data'],msg:Message){
        const order=await Order.findOne({
            _id:data.id,
            version:data.version-1
        })
        if(!order){
            throw new Error("order not found");
        }
        order.set({status:OrderStatus.Cancelled})
        await order.save()
        msg.ack();
    }

}