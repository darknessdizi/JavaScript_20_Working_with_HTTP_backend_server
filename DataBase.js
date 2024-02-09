const { Ticket } = require('./Ticket'); 
const { TicketFull } = require('./TicketFull');

const firstTask = {
  id: '1',
  name: 'Установить обновление КВ-ХХХ',
  description: 'Вышло критическое обновление для Windows, нужно поставить обновление в следующем приоритете:\n1. Сервера (не забыть сделать бэкап!)\n2. Рабочие станции',
  status: false,
}

class DataBase {
  constructor() {
    this.tickets = [];
    this.ticketsFull = new Map();

    this.addNewTicket(firstTask); // тестовая задача
    this.tickets[0].created = 1526644353863;
  }

  addNewTicket(obj) {
    // добавляем новую задачу в хранилище
    const ticket = new Ticket(obj.id, obj.name);
    this.tickets.push(ticket);

    this.ticketsFull.set(obj.id, obj.description);
  }

  getTicket(id) {
    // ищем задачу в хранилище по номеру ID
    const result = this.tickets.find((item) => item.id === id);
    return result;
  }

  getFullTicket(id) {
    // создаем сущность типа TicketFull по номеру id
    const obj = this.getTicket(id);
    const description = this.ticketsFull.get(id);
    const result = new TicketFull(id, obj.name, obj.status, description);
    result.created = obj.created;
    return result; 
  }

  changeStatus(id, status) {
    // изменяет статус задачи в хранилище
    const obj = this.getTicket(id);
    obj.status = status;
  }

  deleteTicket(id) {
    // удаляем задачу в хранилище
    const obj = this.getTicket(id);
    const index = this.tickets.indexOf(obj);
    this.tickets.splice(index, 1);
    this.ticketsFull.delete(id);
  }

  editTask(id, data) {
    const obj = this.getTicket(id);
    const index = this.tickets.indexOf(obj);
    console.log('Замена имени', typeof data, 'Страроое ****', this.tickets[index]);
    // this.tickets[index].status = obj.status;
    this.tickets[index].name = data.name;
    this.ticketsFull.delete(id);
    this.ticketsFull.set(id, data.description);
  }
}

module.exports = {
  DataBase
};
