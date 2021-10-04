import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError , currentUser } from '@hari-ticket/common';

import {indexOrderRouter} from './routes/index'
import {showOrderRouter} from './routes/show';
import {newOrderRouter} from './routes/new';
import {deleteOrderRouter} from './routes/delete';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,  //makes no encryption in cookie
    secure:process.env.NODE_ENV!=='test'   
  })
);
app.use(currentUser)
app.use(newOrderRouter);
app.use(showOrderRouter);
app.use(indexOrderRouter);
app.use(deleteOrderRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);
export {app} ;