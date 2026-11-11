const attachRedisAdapter = require("../config/redis-adapter");
const { setIO, emitToRoom } = require("../config/realtime");

describe("Socket.io Redis adapter", () => {
  const savedUrl = process.env.REDIS_URL;
  afterEach(() => {
    if (savedUrl === undefined) delete process.env.REDIS_URL;
    else process.env.REDIS_URL = savedUrl;
  });

  it("does nothing without REDIS_URL", async () => {
    delete process.env.REDIS_URL;
    const io = { adapter: jest.fn() };
    await expect(attachRedisAdapter(io)).resolves.toBe(false);
    expect(io.adapter).not.toHaveBeenCalled();
  });

  it("connects two clients and installs the adapter when REDIS_URL is set", async () => {
    process.env.REDIS_URL = "rediss://:token@cache.example:6379";
    const make = () => ({ on: jest.fn(), connect: jest.fn().mockResolvedValue(), duplicate: jest.fn() });
    const pub = make();
    const sub = make();
    pub.duplicate.mockReturnValue(sub);
    const createClient = jest.fn().mockReturnValue(pub);
    const adapterInstance = {};
    const createAdapter = jest.fn().mockReturnValue(adapterInstance);
    const io = { adapter: jest.fn() };

    await expect(attachRedisAdapter(io, { createClient, createAdapter })).resolves.toBe(true);

    expect(createClient).toHaveBeenCalledWith({ url: "rediss://:token@cache.example:6379" });
    expect(pub.connect).toHaveBeenCalled();
    expect(sub.connect).toHaveBeenCalled();
    expect(createAdapter).toHaveBeenCalledWith(pub, sub);
    expect(io.adapter).toHaveBeenCalledWith(adapterInstance);
  });
});

describe("realtime emit helper", () => {
  it("is a no-op until Socket.io is registered, then emits to the room", () => {
    setIO(null);
    expect(emitToRoom("alice", "issue:created", {})).toBe(false);

    const emit = jest.fn();
    const to = jest.fn().mockReturnValue({ emit });
    setIO({ to });
    expect(emitToRoom("alice", "issue:created", { number: 3 })).toBe(true);
    expect(to).toHaveBeenCalledWith("alice");
    expect(emit).toHaveBeenCalledWith("issue:created", { number: 3 });
    expect(emitToRoom(undefined, "x", {})).toBe(false);
    setIO(null);
  });
});
