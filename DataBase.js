const { Ticket } = require('./Ticket'); 
const { TicketFull } = require('./TicketFull');

class DataBase {
  constructor() {
    this.tickets = [];
    this.ticketsFull = new Map();
  }

  addNewTicket(obj) {
    // добавляем новую задачу в хранилище
    const ticket = new Ticket(obj.id, obj.name, obj.status);
    this.tickets.push(ticket);

    this.ticketsFull.set(obj.id, obj.description);
  }

  getTicket(id) {
    // ищем задачу в хранилище по номеру ID
    const result = this.tickets.find((item) => item.id === id);
    return result;
  }
}

module.exports = {
  DataBase
};