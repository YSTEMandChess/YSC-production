require('dotenv').config()
var app = require('express')();
var http = require('http').createServer(app).listen(process.env.PORT); //Create an nodejs server and listen on a specific port
var io = require('socket.io').listen(http); //Create a new socket.io variable and instantiate it with the nodejs server

var ongoingGames = [];

/*Function to handle all connections made to the
 * web socket and connect that with their appropriate
 * function calls that were requested from the socket */
io.sockets.on('connection', (socket) => {

  /*Function to create a new game whenever
   * the page is being loaded in or refreshed */
  socket.on('newGame', (msg) => {
    newGame = true;
    var parsedmsg = JSON.parse(msg);
    ongoingGames.forEach(element => {
      if (element.student.username == parsedmsg.student || element.mentor.username == parsedmsg.mentor) {
        newGame = false;
        // Set the new client id for student or mentor.
        let color;
        if (parsedmsg.role == 'student') {
          element.student.id = socket.id;
          color = element.student.color;
        } else if (parsedmsg.role == 'mentor') {
          element.mentor.id = socket.id;
          color = element.mentor.color;
        }
        io.to(socket.id).emit("boardState", JSON.stringify({ boardState: element.boardState, color: color })); //new game requested but game might be in progress; sending new game state
      }
    });

    if (newGame) {
      let colors = [];
      if (Math.random() > 0.5) {
        colors = ["black", "white"];
      } else {
        colors = ["white", "black"];
      }

      if (parsedmsg.role == 'student') {
        ongoingGames.push({ student: { username: parsedmsg.student, id: socket.id, color: colors[0] }, mentor: { username: parsedmsg.mentor, id: "", color: colors[1] }, boardState: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR" });
        io.emit("boardState", JSON.stringify({ boardState: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR", color: colors[0] }));
      } else if (parsedmsg.role == 'mentor') {
        ongoingGames.push({ student: { username: parsedmsg.student, id: "", color: colors[0] }, mentor: { username: parsedmsg.mentor, id: socket.id, color: colors[1] }, boardState: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR" });
        io.emit("boardState", JSON.stringify({ boardState: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR", color: colors[1] }));
      }
    }
  });

  /*Function to change the boardstate of the current mentor and user
   * to "endGame" and delete the game */
  socket.on('endGame', (msg) => {
    var parsedmsg = JSON.parse(msg);
    let index = 0;
    ongoingGames.forEach(element => {
      if(element.student.username == parsedmsg.username || element.mentor.username == parsedmsg.username) {
        ongoingGames.splice(index, 1);
        console.log("Game Deleted");
      }
      index++;
    });
  });

  /*Function to update the board state of the student
   * and mentor */
  socket.on('newState', (msg) => {
    //msg contains boardstate, find boardstate
    var parsedmsg = JSON.parse(msg);
    console.log(`The board state is: ${parsedmsg.boardState}`);
    ongoingGames.forEach(element => {
      if (element.student.username == parsedmsg.username) {
        element.boardState = parsedmsg.boardState;	 //pull json out of ongoing boardstate
        io.to(element.mentor.id).emit("boardState", JSON.stringify({ boardState: element.boardState, color: element.mentor.color }));
      }
      else if (element.mentor.username == parsedmsg.username) {
        element.boardState = parsedmsg.boardState;	//update student board with new boardstate
        io.to(element.student.id).emit("boardState", JSON.stringify({ boardState: element.boardState, color: element.student.color }))
      }
    });
  });

  /*Function is meant to allow whoever pressed the "New Game" button to
   * request a new game. */
  socket.on('createNewGame', (msg) => {
    let colors;
    if (Math.random() > 0.5) {
      colors = ["black", "white"];
    } else {
      colors = ["white", "black"];
    }

    var parsedmsg = JSON.parse(msg);
    ongoingGames.forEach(element => {
      if (element.student.username == parsedmsg.username) {

        element.boardState = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
        element.student.color = colors[0];
        element.mentor.color = colors[1];
        console.log(`student emit to mentor ${element.boardState}`)

        io.to(element.student.id).emit("boardState", JSON.stringify({ boardState: element.boardState, color: element.student.color }));
        io.to(element.mentor.id).emit("boardState", JSON.stringify({ boardState: element.boardState, color: element.mentor.color }));

      } else if (element.mentor.username == parsedmsg.username) {

        element.student.color = colors[0];
        element.mentor.color = colors[1];
        element.boardState = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

        io.to(element.mentor.id).emit("boardState", JSON.stringify({ boardState: element.boardState, color: element.mentor.color }));
        io.to(element.student.id).emit("boardState", JSON.stringify({ boardState: element.boardState, color: element.student.color }))
      }
    });
    // update the board state and send to the other person.
    // {boardState: sdlfkjsk, username: sfjdslk}
  });

  /*Function is meant to flip the chessboard colors.
   * i.e white to black and black to white */
  socket.on('flipBoard', (msg) => {
    var parsedmsg = JSON.parse(msg);
    ongoingGames.forEach(element => {
      if (element.student.username == parsedmsg.username || element.mentor.username == parsedmsg.username) {
        element.student.color = (element.student.color == "black") ? "white" : "black";
        element.mentor.color = (element.mentor.color == "black") ? "white" : "black";
        io.to(element.student.id).emit("boardState", JSON.stringify({ boardState: element.boardState, color: element.student.color }))
        io.to(element.mentor.id).emit("boardState", JSON.stringify({ boardState: element.boardState, color: element.mentor.color }))
      }
    });
  });

  /*Function is meant to change the boardstate to a "Game Over"
   * state where one player has won */
  socket.on('gameOver', (msg) => {
    var parsedmsg = JSON.parse(msg);
    ongoingGames.forEach(element => {
      if (element.student.username == parsedmsg.username || element.mentor.username == parsedmsg.username) {
        io.to(element.student.id).emit("gameOver", JSON.stringify({ boardState: element.boardState, color: element.student.color }));
        io.to(element.mentor.id).emit("gameOver", JSON.stringify({ boardState: element.boardState, color: element.mentor.color }));
      }
    });
  });
});
