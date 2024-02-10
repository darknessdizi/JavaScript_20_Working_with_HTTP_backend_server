const Koa = require('koa'); // импорт библиотеки (фреймворк сервера)
const uuid = require('uuid'); // генерация ID
const koaBody = require('koa-body'); // нужен для обработки тела запроса
const cors = require('@koa/cors'); // настройки для CORS
const { DataBase } = require('./DataBase');

const data = new DataBase();

const app = new Koa(); // создание нашего сервера

app.use(cors()); // настройки CORS по умолчанию
// app.use(
//   cors({
//     origin: '*',
//     credentials: true,
//     'Access-Control-Allow-Origin': true,
//     allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//   })
// );

app.use(koaBody({ // чтобы обработать тело запроса (обязательно объявить до Middleware где работаем с body)
  urlencoded: true, // иначе тело будет undefined (тело будет строкой)
  // multipart: true, // если тело запроса закодировано через FormData
}));

// app.use((ctx, next) => { // если не используем библиотеку @koa/cors 
//   // Обработка запроса типа preflight
//   if (ctx.request.method !== 'OPTIONS') { // Для остальных методов
//     next(); // сделать next и больше ничего
//     return;
//   }
//   // Установка заголовков для разрешения CORS запросов
//   // ctx.response.set('Access-Control-Allow-Origin', '*'); // отправляет клиенту заголовки
//   // Назначаем все разрешенные методы для запросов
//   // ctx.response.set('Access-Control-Allow-Methods', 'DELETE, PUT, PATCH, GET, POST');
//   ctx.response.status = 204; // корректное поведение для таких запросов
// });

app.use((ctx, next) => {
  // Поведение по умолчанию (ничего не найдено)
  // ctx.response.set('Access-Control-Allow-Origin', '*');
  ctx.response.status = 404;
  next();
});

app.use((ctx, next) => {
  // Обработка GET запроса с методом allTickets
  if ((ctx.request.method !== 'GET') || (ctx.request.query.method !== 'allTickets')) {
    next();
    return;
  }
  // Установка заголовков для разрешения CORS запросов
  // ctx.response.set('Access-Control-Allow-Origin', '*'); // отправляет клиенту заголовки
  ctx.response.body = data.tickets; // Ответ клиенту
  ctx.response.status = 200;
  next(); // обязательно указать для следующего Middleware
});

app.use((ctx, next) => {
  // Обработка POST запроса с методом createTicket
  if ((ctx.request.method !== 'POST') || (ctx.request.query.method !== 'createTicket')) {
    next();
    return;
  }
  // Установка заголовков для разрешения CORS запросов
  // ctx.response.set('Access-Control-Allow-Origin', '*');
  const obj = ctx.request.body;
  obj.id = uuid.v4(); // генерация "почти" уникального ID
  data.addNewTicket(obj);
  ctx.response.body = data.getTicket(obj.id);
  ctx.response.status = 201;
  next();
});

app.use((ctx, next) => {
  // Обработка DELETE запроса с методом deleteTicket
  if ((ctx.request.method !== 'DELETE') || (ctx.request.query.method !== 'deleteTicket')) {
    next();
    return;
  }
  // Установка заголовков для разрешения CORS запросов
  // ctx.response.set('Access-Control-Allow-Origin', '*');
  const { id } = ctx.request.query;
  data.deleteTicket(id);
  ctx.response.body = data.tickets;
  ctx.response.status = 200;
  next();
});

app.use((ctx, next) => {
  // Обработка PUT запроса с методом editTask
  if ((ctx.request.method !== 'PUT') || (ctx.request.query.method !== 'editTask')) {
    next();
    return;
  }
  // Установка заголовков для разрешения CORS запросов
  // ctx.response.set('Access-Control-Allow-Origin', '*');
  const editObj = ctx.request.body;
  const { id } = ctx.request.query;
  data.editTask(id, editObj);
  ctx.response.body = data.tickets;
  ctx.response.status = 202;
  next();
});

app.use((ctx, next) => {
  // Обработка GET запроса с методом ticketById
  if ((ctx.request.method !== 'GET') || (ctx.request.query.method !== 'ticketById')) {
    next();
    return;
  }
  // Установка заголовков для разрешения CORS запросов
  // ctx.response.set('Access-Control-Allow-Origin', '*');
  const { id } = ctx.request.query;
  const task = data.getFullTicket(id);
  ctx.response.body = task;
  ctx.response.status = 200;
  next();
});

app.use((ctx, next) => {
  // Обработка PATCH запроса с методом changeStatus
  if ((ctx.request.method !== 'PATCH') || (ctx.request.query.method !== 'changeStatus')) {
    next();
    return;
  }
  // Установка заголовков для разрешения CORS запросов
  // ctx.response.set('Access-Control-Allow-Origin', '*');
  const { id, status } = ctx.request.query;
  data.changeStatus(id, status);
  ctx.response.body = 'Ok';
  ctx.response.status = 202;
  next();
});

const port = 9000;

app.listen(port, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log('Server is listening to ' + port);
});
