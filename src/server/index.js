const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const klenSecure = require('./routes/klen-secure-test.js')();
//Passporty Things

const session = require('koa-session');
const passport = require('koa-passport');

const indexRoutes = require('./routes/index');
const movieRoutes = require('./routes/movies');
const authroutes = require('./routes/auth');

const app = new Koa();
const PORT = 1337; 

const mockAuths = { 
  // oddUser : async (ctx) => !!ctx.state.user.id%2,  
  beFalse : async () => false,
  beTrue : async () => true,
}
const klen = new klenSecure(null, mockAuths, true, 'koa')
// app.use((ctx, next) => {
// 	console.log('hi');
// 	next();
// })
//sessions! 
app.keys = ['super-secret-key'];
app.use(session(app)) //what's happening here?


app.use(bodyParser());

//authentication 
require('./auth');
app.use(passport.initialize());
app.use(passport.session());


app.use(authroutes.routes());

const defineMiddleware = klen.authFailLogger('beTrue'); 
app.use(defineMiddleware)
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