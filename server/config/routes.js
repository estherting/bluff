const Handler = require('../controllers/controller.js')

module.exports = function(app, players){
  app.post('/api/players', (req, res)=> Handler.addPlayer(req, res, players));
}
