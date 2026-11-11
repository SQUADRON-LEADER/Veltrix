// Holds the Socket.io server so controllers can emit events without importing index.js.
let io = null;

function setIO(instance) {
  io = instance;
}

// Returns false (and does nothing) when Socket.io has not been started, e.g. in unit tests.
function emitToRoom(room, event, payload) {
  if (!io || !room) return false;
  io.to(String(room)).emit(event, payload);
  return true;
}

module.exports = { setIO, emitToRoom };
