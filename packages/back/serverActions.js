import { broadcast, createGame, dealAllPocketCards, getNextPlayer, listFreeSeats, removePlayer, roundIsOver, startGame, updateStack } from "./gameActions.js";
import { findBestHand,compareHands } from "shared/handsComparator.js";
import { makeHand } from "shared/handMaker.js";

let game;
let seats = [...Array(5)]

let onConnect = (socket) => {
  console.log("connexion de ", socket.id);

  socket.on("listSeats", () => {
    let freeSeats = listFreeSeats(seats)
    console.log(freeSeats);
    socket.emit("listSeats", freeSeats)
  })
  socket.on("join", (newPlayer) => {
    // console.log(newPlayer);
    console.log("player", newPlayer.name, "ready");
    newPlayer.socket = socket
    newPlayer.bet = 0
    socket.player = newPlayer
    seats[newPlayer.seat - 1] = newPlayer
    // addNewPlayer(game,newPlayer)

    // console.log("game", game, game.players.length);
    const readyPlayers = seats.filter((s) => s != undefined)
    //console.log("rdy",readyPlayers);
    if (readyPlayers.length > 1) {
      //console.log("game",game);
      if (!game || !game.started) {

        console.log("deal...");
        game = createGame(readyPlayers)
        startGame(game)
        dealAllPocketCards(game)
        game.currentPlayer.socket.emit("active")
      }
    }
  })

  socket.on("bet", ({ seat, amount }) => {
    console.log(game.currentPlayer.name);
    if (seat != game.currentPlayer.seat) {
      console.log("not your turn...");
      return
    }
    console.log("player", seat, "bet", amount);

    updateStack(game.currentPlayer, amount)
    console.log(game.currentPlayer.stack);
    socket.emit("unactive")
    broadcast(game, "bet", { seat, amount, stack: game.currentPlayer.stack, bet: game.currentPlayer.bet })
    // game.currentPlayer.bet += amount
    if (roundIsOver(game)) {
      console.log("find winner");
      broadcast(game,"game-over")
      game.pot = 0
      for (let player of game.players) {

        player.hand = makeHand([...player.cards, ...game.flop])
        console.log("hand", player.hand);
        game.pot += player.bet
        player.bet = 0
      }
      let bestHand = findBestHand(game.players.map((p) => p.hand))
      console.log("best",bestHand);
      let winners = game.players.filter((p)=>compareHands(p.hand,bestHand)===0)
      console.log("winners", winners);
      for (let winner of winners) {
        winner.stack += game.pot/winners.length
      }
      broadcast(game, "winners", winners.map((w) => { return { hand:w.hand,seat: w.seat, prize: game.pot / winners.length, stack: w.stack } }))
      return
    }
    game.currentPlayer = getNextPlayer(game)
    console.log(game.currentPlayer.name);
    game.currentPlayer.socket.emit("active")

  })
  socket.on("show", (seat) => {
    console.log("show!",seat);
    broadcast(game, "show",{seat,cards:socket.player.cards}, seat)
  })
  socket.on("fold", (seat) => {
    console.log("player", seat, "fold");
    removePlayer(game, seat)
    broadcast(game, "fold", seat)
  })
} 

export { onConnect }