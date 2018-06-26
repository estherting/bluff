module.exports = {
  addPlayer: addPlayer,
}

function addPlayer(req, res, players){
  players.push(req.body);
  console.log(players);
}
