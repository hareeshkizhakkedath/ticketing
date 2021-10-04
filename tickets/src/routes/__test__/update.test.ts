import request from 'supertest'
import {app} from '../../app';
import mongoose from 'mongoose';
import {natsWrapper} from '../../nats-wrapper'

it('returns 404 if the provided id is not found',async()=>{
    const id=new mongoose.Types.ObjectId().toHexString();
    await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie',global.signin())
    .send({
        title:'bdbdjb',
        price:30
    })
    .expect(404)
})

it('returns 401 if the user is not authenticated',async()=>{
    const id=new mongoose.Types.ObjectId().toHexString();
    await request(app)
    .put(`/api/tickets/${id}`)
    .send({
        title:'bdbdjb',
        price:30
    })
    .expect(401)
})

it('returns 401 if the user not own ticket',async()=>{
    const response=await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
        title:"asdff",
        price:10
    })

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
        title:"bdub",
        price:19
    }).expect(401)

})

it('returns 400 if the provided title or price is invalid',async()=>{
    const cookie= global.signin();
    const response=await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
        title:"asdff",
        price:10
    })
    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title:'',
        price:19
    }).expect(400)

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title:'',
        price:-19
    }).expect(400)

})


it('returns 400 if the provided title or price is invalid',async()=>{
    const cookie= global.signin();
    const response=await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
        title:"aaaaa",
        price:10
    })

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title:'bbbbb',
        price:19
    }).expect(200)

    const ticketResponse=await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send();

    expect(ticketResponse.body.title).toEqual('bbbbb')

})

it('publish the event', async ()=>{
    const cookie= global.signin();
    const response=await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
        title:"aaaaa",
        price:10
    })

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title:'bbbbb',
        price:19
    }).expect(200)
    expect(natsWrapper.client.publish).toHaveBeenCalled();
})