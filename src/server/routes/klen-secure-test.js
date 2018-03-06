
function klenSecure(){
	return (function(){
		var secretLocation = {};
		var secretId = 0;
		return class {
			constructor(modelAuthenticator, authObject, logViewBool, config){

				this.id = secretId++
				secretLocation[this.id] = {
					logViewBool : logViewBool || false, //default setting is that you canNOT modify the log 
					getAuthFailLog : this.getAuthFailLog,
                    config: config || 'express'
				};

				this.modelAuthenticator = modelAuthenticator;

				secretLocation[this.id].authFailLog = {};

				secretLocation[this.id].authObject = authObject || {  
					 isUser : async (id) => {                        // async await requires at least Node 7.6
						let user = await this.modelAuthenticator.findById(id)
						return !!user;
					}, 
					isMod : async (id) => {
						let user = await this.modelAuthenticator.findById(id)
						 return !!user.isMod;
					},
					isAdmin: async (id) =>{
						let user = await this.modelAuthenticator.findById(id)
						return !!user.isAdmin; 
					},
					isSiteController : async (id) => {
						let user = await this.modelAuthenticator.findById(id)
						return !!user.isSiteController;
					}
				}


			}

		authFailLogger(whichAuth){
         if(secretLocation[this.id].config === 'express'){
          return async (req, res, next) => {
          	try{
          	  if (req.user){
                if(!req.user.clearances){
                	let output = []
                	for (let k in secretLocation[this.id].authObject){
                	  let authTest = await secretLocation[this.id].authObject[k](req.user.id);
                	  if(authTest){
                	  	output.push(k);
                	  }
                	}
                  req.user.clearances = output
                  console.log('Clearances: ', req.user.clearances);
                }

                if(secretLocation[this.id].authObject.hasOwnProperty(whichAuth)){
                  if(req.user.clearances.includes(whichAuth)){
                  	next();
                  }else{
                    let failObj = {
                  	  user: req.user.id, 
                  	  date: new Date(), 
                  	  ipAddress: req.ip,
                    }
                     if (secretLocation[this.id].authFailLog[whichAuth]){
                  	   secretLocation[this.id].authFailLog[whichAuth].push(failObj);
                  	   console.log(whichAuth, ' fail log: ', secretLocation[this.id].authFailLog[whichAuth])
                     }else{
                  	   secretLocation[this.id].authFailLog[whichAuth]= [failObj];
                  	   console.log(whichAuth, ' fail log: ', secretLocation[this.id].authFailLog[whichAuth])
                     }
                   throw new Error('You do not have valid clearance to view '+ whichAuth)
                  }
                }else{
                  throw new Error('not a valid authorization check: '+ whichAuth)
                }
          	  }else{
          	  	throw new Error('user is not logged in')
          	  }
          	} catch(e){
          	 res.status(403).send(e.message);
          	 
          	}
          }
         }else{
           return async (ctx, next) => {
           	try{
              if(ctx.state.user){
              	if(!ctx.state.user.clearances){
              	  let output = []
              	  for (let k in secretLocation[this.id].authObject){
              	  	let authTest = await secretLocation[this.id].authObject[k](ctx.state.user.id);
              	  	if(authTest){
              	  	  output.push(k);
              	  	}
              	  }
              	  ctx.state.user.clearances = output;
              	  console.log('Clearances: ', ctx.state.user.clearances)
              	}
              	if (secretLocation[this.id].authObject.hasOwnProperty(whichAuth)){
                  if(ctx.state.user.clearances.includes(whichAuth)){
                  	await next();
                  }else{
                  	let ip = ctx.ips.length > 0 ? ctx.ips[ctx.ips.length - 1] : ctx.ip
                  	let failObj = {
                  	  user: ctx.state.user.id, 
                  	  date: new Date(), 
                  	  ipAddress: ip 
                  	}
                  	if(secretLocation[this.id].authFailLog[whichAuth]){
                  	   secretLocation[this.id].authFailLog[whichAuth].push(failObj);
                  	   console.log(whichAuth, ' fail log: ', secretLocation[this.id].authFailLog[whichAuth])
                  	}else{
                  	   secretLocation[this.id].authFailLog[whichAuth]= [failObj];
                  	   console.log(whichAuth, ' fail log: ', secretLocation[this.id].authFailLog[whichAuth])                  		
                  	}
                  	return
                  }
              	}else{
              		return
              	}
              }else{
              	return; 
              }
           	}catch(e){
           	  console.log(e);
           	  ctx.body = e
           	}
           }
         }
	    }
			
		getAuthFailLog(){
	     if(secretLocation[this.id].config === 'express'){
		  return (req, res, next) => {
		    try{
		      if(secretLocation[this.id].logViewBool){
			    req.user.authFailLog = secretLocation[this.id].authFailLog;
			     next();  
			  }else{
			    return
			  }
		    }catch(e){
		      res.status(403).send(e.message);
		    }

		  }
		 }else{
		  return async (ctx, next) => {
		  	try{
		      if(secretLocation[this.id].logViewBool){
		      	ctx.state.user.authFailLog = secretLocation[this.id].authFailLog;
		      	await next();
		      }else{
		      	return
		      }              
		  	}catch(e){
		  	  ctx.body = e
		  	}
		  }
		 }
		}

		clearAuthFailLog(){
	     if(secretLocation[this.id].config === 'express'){
		  return (req, res, next) => {
		  	try{
              if(secretLocation[this.id].logViewBool){
			    secretLocation[this.id].authFailLog = 
			    {lastCleared: {
 				    date: new Date(), 
 				    user: req.user.id
			      }
			    }
			     next();
			  }else{
			    throw new Error('you cannot clear this log');
			  }
		  	}catch(e){
		      res.status(403).send(e.message);
		  	}

		  }
		 }else{
		  return async (ctx, next) => {
		  	try{
              if(secretLocation[this.id].logViewBool){
			    secretLocation[this.id].authFailLog = 
			    {
			    	lastCleared: {
 				    date: new Date(), 
 				    user: ctx.state.user.id
			      }
			    }
			     await next();    
			    }else{
			    	throw new Error('you cannot clear this log');
			    }         
		  	}catch(e){
		      ctx.body = e
		  	}
		  }
		 }
		}
  
		}
	}
	)();
}
module.exports = klenSecure;