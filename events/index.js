const Room = require("../models/room.models");
let choice1 = "",
	choice2 = "";
module.exports = function (socket) {
	//Create Game Listener

	socket.on("createGame", async function (data) {
		const room = new Room({
			playerOne: data.playerOne,
		});
		let savedRoom = await room.save();
		savedRoom = await savedRoom.populate("playerOne");
		socket.join(savedRoom._id);
		socket.emit("newGame", {
			room: savedRoom,
		});
	});
	//Join Game Listener
	socket.on("joinGame", async function (data) {
		const room = await Room.findById(data.roomId);
		if (room) {
			if (room.playerOne && room.playerTwo) {
				socket.emit("err", { message: "Sorry, The room is full!" });
			} else {
				socket.join(room._id);
				room.playerTwo = data.playerTwo;
				await room.save();
				const savedRoom = await room.populate("playerOne playerTwo");
				socket.broadcast.emit("player1Joined", {
					room: savedRoom,
				});
				socket.emit("player2Joined", {
					room: savedRoom,
				});
			}
		} else {
			socket.emit("err", { message: "Invalid Room Key" });
		}
	});

	socket.on("choice1", function (data) {
		choice1 = data.choice;
		console.log(choice1, choice2);
		if (choice2 != "") {
			result(data.room);
		}
	});

	socket.on("choice2", function (data) {
		choice2 = data.choice;
		console.log(choice1, choice2);
		if (choice1 != "") {
			result(data.room);
		}
	});

	const result = async (roomID) => {
		let room = await Room.findById(roomID);
		var winner = getWinner(choice1, choice2);
		if (winner !== "draw") {
			winner === "1" ? room.playerOneScore++ : room.playerTwoScore++;
			await room.save();
		}

		socket.emit("result", {
			winner: winner,
			room: room,
		});
		socket.broadcast.emit("result", {
			winner: winner,
			room: room,
		});
		choice1 = "";
		choice2 = "";
	};
};
function getWinner(p, c) {
	if (p === c) {
		return "draw";
	} else if (p === "Rock") {
		if (c === "Paper") {
			return "2";
		} else {
			return "1";
		}
	} else if (p === "Paper") {
		if (c === "Scissor") {
			return "2";
		} else {
			return "1";
		}
	} else if (p === "Scissor") {
		if (c === "Rock") {
			return "2";
		} else {
			return "1";
		}
	}
}
