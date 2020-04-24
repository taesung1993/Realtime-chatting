$(document).ready(function () {
  //소켓 클라이언트 localhost:5000주소로 연결
  var sock = io.connect("http://localhost:5000/test");
  sock.on("response", function (msg) {
    var connectMsg = msg["msg"];
    var userId = sessionStorage.getItem("user-id");
    $("#msgs").append(
      $("<li/>", {
        class: "msg msg--boroadcast",
      })
        .append($("<span/>", { class: "msg__name", text: "운영자: " }))
        .append($("<span/>", { class: "msg__content", text: connectMsg }))
    );
    sock.emit("connect_response", { user_id: userId });
  });

  sock.on("message", function (msg) {
    if (msg["msg"] === "echo_send") {
      setInterval(sock.emit("echo_receive", { data: "echo" }), 3000);
    }
  });
});
