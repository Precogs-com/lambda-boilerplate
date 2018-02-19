// Your function handler
module.exports.handler = (event, context, callback) => {
  const message = {
    message: 'Hello World',
    event,
  };
  // callback will send message object back
  callback(null, message);
};
