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
  console.log('текущий URL: ', ctx.url);
  console.log('текущий query URL: ', ctx.request.query);
  ctx.response.set('Access-Control-Allow-Origin', '*');

  switch (method) {
    case 'allTickets':
      ctx.response.body = data.tickets;
      console.log('data', data);
      return;
    case 'ticketById':
      const { id } = ctx.request.query;
      // ctx.response.body = data;
      return;
    case 'createTicket':
      console.log('body', JSON.parse(ctx.request.body));
      const obj = JSON.parse(ctx.request.body);
      obj.id = uuid.v4();
      data.addNewTicket(obj);
      ctx.response.body = data.getTicket(obj.id);
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
