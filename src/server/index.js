const Koa = require('koa');
const indexRoutes = require('./routes/index');
const movieRoutes = require('./routes/movies');

const app = new Koa();
const PORT = 1337; 

app.use(indexRoutes.routes());
app.use(movieRoutes.routes());

// app.use(async (ctx) => {
//   ctx.body = {
//   	status: 'success', 
//   	message: 'hello, world!',
//   };
// });

const server = app.listen(PORT, () => {
	console.log(`Koa server listening on port: ${PORT}`)
});

module.exports = server;