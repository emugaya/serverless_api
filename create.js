`use strict`

module.exports.createProjectHandler = function (event, context, callback ){
  const message = {
    message: 'Hello World',
    event,
  };
  console.log(event.body);
  console.log(context)
  callback(null, message);
};
