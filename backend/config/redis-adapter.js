const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");

// Shares Socket.io rooms/events across backend replicas through Redis
// (Amazon ElastiCache in production). Does nothing unless REDIS_URL is set,
// so local development and existing deployments are unchanged.
//
// Use rediss://:<token>@<host>:6379 for ElastiCache with in-transit encryption.
// REDIS_TLS_SERVERNAME is only for connecting through an SSH tunnel, where the
// host in the URL (localhost) differs from the name on the server certificate.
async function attachRedisAdapter(io, deps = {}) {
  const url = process.env.REDIS_URL;
  if (!url) return false;

  const create = deps.createClient || createClient;
  const adapter = deps.createAdapter || createAdapter;

  const options = { url };
  if (process.env.REDIS_TLS_SERVERNAME) {
    options.socket = { servername: process.env.REDIS_TLS_SERVERNAME };
  }

  const pubClient = create(options);
  const subClient = pubClient.duplicate();
  for (const client of [pubClient, subClient]) {
    client.on("error", (err) => console.error("Redis:", err.message));
  }

  await Promise.all([pubClient.connect(), subClient.connect()]);
  io.adapter(adapter(pubClient, subClient));
  console.log("Socket.io Redis adapter enabled");
  return true;
}

module.exports = attachRedisAdapter;
