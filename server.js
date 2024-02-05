const Koa = require('koa'); // импорт библиотеки (фреймворк сервера)
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');
const koaBody = require('koa-body'); // нужен для обработки тела запроса
const { DataBase } = require('./DataBase');

const data = new DataBase();

const app = new Koa(); // создание нашего сервера

app.use(koaBody({ // чтобы обработать тело запроса (обязательно объявить до Middleware где работаем с body)
  urlencoded: true, // иначе тело будет undefined (тело будет строкой)
  multipart: true, // если тело запроса закодировано через FormData
}));

app.use(async ctx => {
  const { method } = ctx.request.query;
  // console.log('текущий URL: ', ctx.url);
  console.log('текущий query URL: ', ctx.request.query);
  ctx.response.set('Access-Control-Allow-Origin', '*');
  const { id, status } = ctx.request.query;

  switch (method) {
    case 'allTickets':
      ctx.response.body = data.tickets;
      return;
    case 'ticketById':
      console.log('ticketById');
      const task = data.getFullTicket(id);
      ctx.response.body = task;
      return;
    case 'createTicket':
      const obj = ctx.request.body;
      obj.id = uuid.v4(); // генерация "почти" уникального ID
      data.addNewTicket(obj);
      ctx.response.body = data.getTicket(obj.id);
      return;
    case 'changeStatus':
      console.log('changeStatus');
      data.changeStatus(id, status);
      ctx.response.body = 'Ok';
      return;
    case 'deleteTicket':
      console.log('deleteTicket');
      data.deleteTicket(id);
      ctx.response.body = 'Ok';
      return;
    default:
      ctx.response.status = 404;
      return;
  }
});

const port = 9000;

app.listen(port, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log('Server is listening to ' + port);
});
