import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import routes from 'koa-route';
import GameServer from './game-server';
import tokenUtil from './token';
const gameServer = new GameServer();
const app = new Koa();
app.use(bodyParser());

app.use(routes.post('/api/login', ctx => {
    const name: string = ctx.request.body.name || '';
    if (!/^[a-zA-Z\u4E00-\u9FA5][a-zA-Z0-9\u4E00-\u9FA5_-]{3,8}$/.test(name)) {
        ctx.status = 406;
        ctx.body = 'Invalid player name supplied.';
        return;
    }
    if (gameServer.isPlayerExists(name)) {
        ctx.status = 409;
        ctx.body = `${name} already exists.`;
        return;
    }
    ctx.body = { token: tokenUtil.create(name) };
}));

const PORT = process.env.PORT || 5000;
const httpServer = app.listen(PORT, () => {
    gameServer.initialize(httpServer);
    console.log(`Server started on port ${PORT}.`);
});
