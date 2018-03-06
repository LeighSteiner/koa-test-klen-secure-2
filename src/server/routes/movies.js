const Router = require('koa-router');
const queries = require('../db/queries/movies');
// const klenSecure = require('./klen-secure-test.js')();


// const mockAuths = { 
//   oddUser : async () => !!ctx.state.user.id%2,  
//   beFalse : async () => false,
//   beTrue : async () => true,
// }
// const klen = new klenSecure(null, mockAuths, true, 'koa')

let count = 0;
const router = new Router();
const BASE_URL = `/api/v1/movies`;
// router.use((ctx) => {
//   console.log(ctx.state.user)
// })
// router.use(klen.authFailLogger('beTrue'))
router.get(BASE_URL , async (ctx) => {
  try{
      	const movies = await queries.getAllMovies();
  	ctx.body = {
  	  status: 'success', 
  	  data: movies
  	}

  }catch(err) {
  	console.log(err)
  }
})

router.get(`${BASE_URL}/:id`, async (ctx) => {
	try {
      const movie = await queries.getSingleMovie(ctx.params.id);
      if (movie.length) {
      	ctx.body = {
      	  status: 'success', 
      	  data: movie,
      	};
      } else {
      	ctx.status = 404;
      	ctx.body ={
      	  status:'error', 
      	  message: 'That movie does not exist.'
      	};
      }

	}catch (err) {
	  console.log(err)
	}
})

router.post(`${BASE_URL}`, async (ctx) => {
  try {
    const movie = await queries.addMovie(ctx.request.body);
    if (movie.length) {
      ctx.status = 201;
      ctx.body = {
      	status: 'success', 
      	data: movie,
      };
    }else {
      ctx.status = 400
      ctx.body = {
      	status: 'error', 
      	message: 'Something went wrong, comrade.',
      };
    }
  } catch (err) {
  	ctx.status = 400;
  	ctx.body = {
  	  status: 'error', 
  	  message: err.message || 'Sorry, friendo, an error has occurred.'
  	};
  }
})

router.put(`${BASE_URL}/:id`, async (ctx) => {
  try {
    const movie = await queries.updateMovie(ctx.params.id, ctx.request.body);
    if (movie.length) {
      ctx.status = 200;
      ctx.body = {
        status: 'success',
        data: movie
      };
    } else {
      ctx.status = 404;
      ctx.body = {
        status: 'error',
        message: 'That movie does not exist.'
      };
    }
  } catch (err) {
    ctx.status = 400;
    ctx.body = {
      status: 'error',
      message: err.message || 'Sorry, an error has occurred.'
    };
  }
})

router.delete(`${BASE_URL}/:id`, async (ctx) => {

	try{
	  const movie = await queries.deleteMovie(ctx.params.id);
	  if(movie.length) {
	  	ctx.status = 200; 
	  	ctx.body = {
	  	  status: 'success', 
	  	  data: movie
	  	};
	  }else{
	  	ctx.status = 404;
	  	ctx.body = {
	  	  status: 'error', 
	  	  message: 'why delete a movie that does not exist, pal?'
	  	}
	  }

	}catch (err) {
	  ctx.status = 400; 
	  ctx.body = {
	  	status: 'error', 
	  	message: err.message || 'sorry some deletion error has occurred.'
	  };
	}
})







module.exports = router;