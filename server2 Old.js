const Koa = require('koa'); // импорт библиотеки (фреймворк сервера)
// const path = require('path');
// const fs = require('fs');
const uuid = require('uuid');
const koaBody = require('koa-body'); // нужен для обработки тела запроса
const { DataBase } = require('./DataBase');

const data = new DataBase();

const app = new Koa(); // создание нашего сервера

app.use(koaBody({
  // чтобы обработать тело запроса (обязательно объявить до Middleware где работаем с body)
  urlencoded: true, // иначе тело будет undefined (тело будет строкой)
  multipart: true, // если тело запроса закодировано через FormData
}));

app.use((ctx, next) => {
  if (ctx.request.method !== 'OPTIONS') { // Для остальных методов
    next(); // сделать next и больше ничего
    return;
  }

  console.log('OPTIONS preflight');
  // Если идет preflight запрос:
  // Установка заголовков для разрешения CORS запросов
  ctx.response.set('Access-Control-Allow-Origin', '*'); // отправляет клиенту заголовки
  // Назначаем все разрешенные методы для запросов
  ctx.response.set('Access-Control-Allow-Methods', 'DELETE, PUT, PATCH, GET, POST');
  ctx.response.status = 204; // корректное поведение для таких запросов
});

app.use(async (ctx) => {
  const { method } = ctx.request.query;
  // console.log('текущий URL: ', ctx.url);
  console.log('текущий query URL: ', ctx.request.query);
  ctx.response.set('Access-Control-Allow-Origin', '*');
  const { id, status } = ctx.request.query;
  let { task, obj, editObj } = null;

  switch (method) {
    case 'allTickets':
      ctx.response.body = data.tickets;
      return;
    case 'ticketById':
      console.log('ticketById');
      task = data.getFullTicket(id);
      ctx.response.body = task;
      return;
    case 'createTicket':
      obj = ctx.request.body;
      console.log('Создаем задачу', obj);
      obj.id = uuid.v4(); // генерация "почти" уникального ID
      data.addNewTicket(obj);
      ctx.response.body = data.getTicket(obj.id);
      return;
    case 'changeStatus':
      console.log('changeStatus', typeof status, status);
      data.changeStatus(id, status);
      ctx.response.body = 'Ok';
      return;
    case 'editTask':
      console.log('editTask');
      editObj = ctx.request.body;
      data.editTask(id, editObj);
      ctx.response.body = data.tickets;
      return;
    case 'deleteTicket':
      console.log('deleteTicket');
      data.deleteTicket(id);
      console.log('Данные после удаления', data.tickets);
      ctx.response.body = data.tickets;
      return;
    default:
      ctx.response.status = 404;
  }
});

const port = 9000;

app.listen(port, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(`Server is listening to ${port}`);
});
