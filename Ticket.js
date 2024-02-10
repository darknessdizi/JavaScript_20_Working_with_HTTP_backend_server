class Ticket {
  constructor(id, name, status = 'false') {
    this.id = id; // идентификатор (уникальный в пределах системы)
    this.name = name; // краткое описание
    this.status = status; // boolean - сделано или нет
    this.created = Date.now(); // дата создания (timestamp)
  }
}

module.exports = {
  Ticket,
};
