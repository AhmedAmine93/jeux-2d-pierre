const socket = io();
let playerOne = false;
let roomID;
let choice1 = "",
	choice2 = "";
$(function () {
	$(".gamePlay").hide();
	$("#score").hide();
	$("#newgame").click(function () {
		playerOne = true;
		socket.emit("createGame", { playerOne: $("#userId").text() });
	});
	socket.on("newGame", (data) => {
		$("#msg")
			.text("Waiting for player 2, room ID is " + data.room._id)
			.show();
		roomID = data.room._id;
		$(".new").hide();
		$(".how-to").hide();
		$("#score").show();
		$("#player1Name").text(data.room.playerOne.name);
		$("#player2Name").text('Player 2');
	});
	$("#joingame").click(function () {
		roomID = $("input[name=room]").val();
		socket.emit("joinGame", {
			playerTwo: $("#userId").text(),
			roomId: roomID,
		});
	});
	//Player 2 Joined
	socket.on("player2Joined", (data) => {
		// if (data.room.playerTwo) {
		// 	$("#player2Name").text(data.room.playerTwo.name);
		// }
		transitionToGame(data);
	});

	//Player 1 Joined
	socket.on("player1Joined", (data) => {
		// if (data.room.playerOne) {
		// 	$("#player1Name").text(data.room.playerOne.name);
		// }
		transitionToGame(data);
	});

	const transitionToGame = (data) => {
		$(".new").hide();
		$(".gamePlay").show();
		$("#msg").hide();
		$("#score").show();
		$(".how-to").hide();
		$("#player1Name").text(data.room.playerOne.name);
		$("#player2Name").text(data.room.playerTwo.name);
	};

	//Select Choice
	$(".choice").click(function (e) {
		const choice = e.target.id;
		$(".choices > .choice").addClass("disable");
		$("#" + choice).addClass("chosen");
		const choiceEvent = playerOne ? "choice1" : "choice2";
		socket.emit(choiceEvent, {
			choice: choice,
			room: roomID,
		});
	});
	socket.on("result", (data) => {
		if (data.winner == "draw") {
			$("#message").text("It's a draw!");
		} else {
			data.winner === "1"
				? $("#message").text(`${$("#player1Name").text()} win`)
				: $("#message").text(`${$("#player2Name").text()} win`);
		}
		$("#p1score").text(data.room.playerOneScore);
		$("#p2score").text(data.room.playerTwoScore);
		$(".choices > .choice").removeClass("disable");
		$(".choices > .choice").removeClass("chosen");
	});
});
