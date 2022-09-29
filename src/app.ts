import { fastify } from 'fastify';
import { createClient } from 'redis';

const client = createClient({
    url: "redis://redis:6379"
});

const server = fastify({
    logger: true
});


// Declare a route
server.get('/', async (request, reply) => {
    let obj = {};
    for await (const key of client.scanIterator()) {
        obj[key] = await client.get(key)
    }
    return { date: Date.now(), node: process.version, rdm: Math.random(), data: obj };
});

server.post('/add', async (request, reply) => {
    console.log("body", request.body);
    //@ts-ignore
    const couple: { key: string, val: string } = request.body?.couple;
    if (couple) {
        reply.send(`ADDED ! --> Key : ${couple.key} - Val : ${couple.val}`);
        client.set(couple.key, couple.val);
    }
});

client.on('error', (err) => console.log('Redis Client Error', err));


// Run the server!
const start = async () => {
    try {
        await server.listen({ host: '0.0.0.0', port: parseInt(process.env.PORT || "") || 8080 });
        await client.connect();

        await client.set('key', 'value');
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
}

start();
