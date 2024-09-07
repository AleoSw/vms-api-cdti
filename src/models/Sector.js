class Sector {
  constructor(id = null, name) {
    this._id = id;
    this._name = name;
  }

  // Getter y Setter para id
  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value;
  }

  // Getter y Setter para name
  get name() {
    return this._name;
  }

  set name(value) {
    this._name = value;
  }
}

module.exports = Sector;
