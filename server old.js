// используем сервер от http
const http = require('http'); // сначало импортируем http
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');

// koa-static позволяет назначить папку, которую мы будем раздавать по http как статические файлы
const koaStatic = require('koa-static'); 

// 1 begin---------------------------------------------------------------
// создаем сервер
// const server = http.createServer((req, res) => { // принимает два параметра (request - запрос, response - ответ)
  // console.log('******** 1 *********', req.headers); // получить загаловки запроса (request)
  // console.log('******** 2 *********', req.url); // получить url запроса 
  // (получим два запроса: 1 - обращение в корень сайта
  //                       2 - браузер пытается загрузить иконку сайта, поэтому идет обращение к favicon.icon)

  // res.end(); // закончить обращение к нашему серверу
  // (ответ сервера закончен, если не будет вкладка браузера повиснет)
// });

// 1 end----------------------------------------------------------------

// 2 begin---------------------------------------------------------------
// const server = http.createServer((req, res) => {
//   const buffer = [];

//   // получение данных из тела запроса в сыром виде:
//   req.on('data', (chunk) => { // событие получение данных в запросе
//     // передается ввиде чанков
//     buffer.push(chunk);
//   });

//   req.on('end', () => { // событие окончания передачи данных
//     // Buffer.concat склеиваем данные и переводим в строку
//     const data = Buffer.concat(buffer).toString();
//     console.log(data)
//   });
//   res.end('server response'); // тело сервера будет содержать строку
// });

// 2 end----------------------------------------------------------------

// 3 begin---------------------------------------------------------------

const Koa = require('koa'); // импорт библиотеки (фреймворк сервера)
const app = new Koa(); // создание нашего сервера

let subscriptions = [];

// __dirname текущая папка в которой запущен процесс
const public = path.join(__dirname, '/public');

app.use(koaStatic(public)); // добавляем Middleware для koaStatic

const koaBody = require('koa-body'); // нужен для обработки тела запроса
app.use(koaBody({ // чтобы обработать тело запроса (обязательно объявить до Middleware где работаем с body)
  urlencoded: true, // иначе тело будет undefined (тело будет строкой)
  multipart: true, // если тело запроса закодировано через FormData
}));

app.use((ctx, next) => {
  if (ctx.request.method !== 'OPTIONS') { // Для остальных методов
    next(); // сделать next и больше ничего
    return;
  }

  // Если идет preflight запрос:
  // Установка заголовков для разрешения CORS запросов
  ctx.response.set('Access-Control-Allow-Origin', '*'); // отправляет клиенту заголовки
  // Назначаем все разрешенные методы для запросов
  ctx.response.set('Access-Control-Allow-Methods', 'DELETE, PUT, PATCH, GET, POST');
  ctx.response.status = 204; // корректное поведение для таких запросов
});

app.use((ctx, next) => {
  // Для загрузки файлов
  console.log('проверка', ((ctx.request.method !== 'POST') || (ctx.request.url !== '/upload')));
  console.log('проверка', ctx.request.method !== 'POST');
  console.log('проверка', ctx.request.url !== '/upload');
  if ((ctx.request.method !== 'POST') || (ctx.request.url !== '/upload')) {
    console.log('******* i am')
    next();
    return;
  }

  ctx.response.set('Access-Control-Allow-Origin', '*');
  console.log('Файлы:', ctx.request.files);
  let fileName;

  try {
    // __dirname текущая папка в которой запущен процесс
    const public = path.join(__dirname, '/public');
    const { file } = ctx.request.files;
    const subfolder = uuid.v4(); // генерирует случайное id
    const uploadFolder = public + '/' + subfolder;

    fs.mkdirSync(uploadFolder);
    // копируем файл из одного места в другое
    fs.copyFileSync(file.path, uploadFolder + '/' + file.name);

    fileName = '/' + subfolder + '/' + file.name;
  } catch (error) {
    ctx.response.status = 500;
    return;
  }

  ctx.response.body = fileName;
});

app.use(async (ctx, next) => {
  if (ctx.request.method !== 'POST') {
    next();
    return;
  }
  // Middleware запускаются по очереди (ctx - контекст, next - передача управления в следующую функцию)
  // console.log(ctx.request); // ctx.request  ctx.headers
  console.log('текущий URL: ', ctx.url);
  console.log('текущий query URL: ', ctx.request.query); // можно получить url как объект используя параметр query
  console.log('тело запроса: ', ctx.request.body); // получить тело запроса (необходимо установить пакет koa-body)

  // Установка заголовков для разрешения CORS запросов
  ctx.response.set('Access-Control-Allow-Origin', '*'); // отправляет клиенту заголовки

  const { name, phone } = ctx.request.body;

  if (subscriptions.some(sub => sub.phone === phone)) {
    // Если телефон уже есть в списке, статус будет 400
    ctx.response.status = 400;
    ctx.response.body = 'subscription exists';
    return;
  }

  subscriptions.push({ name, phone });

  ctx.response.body = 'ОК'; 
  // ctx.response.body тело ответа надо обязательно указать , иначе будет ошибка 404
  // наличие тела ответа поставит статус 200 ок

  next(); // обязательно указать для следующего Middleware
});

app.use(async (ctx, next) => {
  if (ctx.request.method !== 'DELETE') {
    next();
    return;
  }

  // Установка заголовков для разрешения CORS запросов
  ctx.response.set('Access-Control-Allow-Origin', '*'); // отправляет клиенту заголовки
  
  console.log(ctx.request.query); // объект тела запроса
  console.log('Тело при DELETE (пустое)', ctx.request.body); // объект тела запроса будет пустым

  // Метод DELETE не парсит тело запроса, 
  // поэтому тело должно быть получено из URL
  const { phone } = ctx.request.query;

  if (subscriptions.every(sub => sub.phone !== phone)) {
    // если телефона нет в базе данных, будет статус 400
    ctx.response.status = 400;
    ctx.response.body = 'subscription doesn\'t exists';
    return;
  }

  subscriptions = subscriptions.filter(sub => sub.phone !== phone);
  ctx.response.body = 'OK';
  next();
});

app.use(async (ctx) => {
  // Последний Middleware next не нужен (контекст)
  console.log('Последний Middleware');
});

const server = http.createServer(app.callback()); // передача в http наших обработчиков

// 3 end----------------------------------------------------------------

// наш порт ******************************************************

const port = 9000; // определяем порт на котором будет работать наш сервер

// заставляем сервер слушать входящие сообщения
server.listen(port, (err) => { // два аргумента (1-й это порт, 2-й это callback по результатам запуска сервера)
  if(err) { // в callback может быть передана ошибка (выводим её в консоль для примера, если она появится)
    console.log(err);
    return;
  }
  console.log('Server is listening to ' + port);
});