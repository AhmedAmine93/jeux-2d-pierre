const events = require("../events");
module.exports = function (io) {
	io.on("connection", (socket) => {
		events(socket);
		console.log("User with socketId %s connected", socket.id);
	});
};
