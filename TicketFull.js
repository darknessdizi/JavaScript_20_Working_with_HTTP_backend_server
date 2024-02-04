const { Ticket } = require('./Ticket');

class TicketFull extends Ticket {
  constructor(id, name, status, description) {
    super(id, name, status);
    this.description = description;
  }
}

module.exports = {
  TicketFull,
};
