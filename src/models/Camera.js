class Camera {
  constructor(id = null, name = "", ip = "", userCam = "", passwordCam = "") {
    this._id = id;
    this._name = name;
    this._ip = ip;
    this._userCam = userCam;
    this._passwordCam = passwordCam;
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

  // Getter y Setter para ip
  get ip() {
    return this._ip;
  }

  set ip(value) {
    this._ip = value;
  }

  // Getter y Setter para userCam
  get userCam() {
    return this._userCam;
  }

  set userCam(value) {
    this._userCam = value;
  }

  // Getter y Setter para passwordCam
  get passwordCam() {
    return this._passwordCam;
  }

  set passwordCam(value) {
    this._passwordCam = value;
  }
}

module.exports = Camera;
