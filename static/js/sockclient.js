$(document).ready(function () {
  // namespace "/test" 연결
  var sock = io.connect("/test");
  // 세션스토리지에 저장되어 있는 user-id 값을 꺼내서 저장
  var userId = sessionStorage.getItem("user-id");
  // nickname을 담을 전역변수 선언
  var nickname = "";

  sock.on("response", function (msg) {
    // 메세지 객체 "nickname" 값을 저장
    nickname = msg["nickname"];
    // id:msgs 를 가진 태그에 자식 태그 추가
    // 브로드캐스트 캐스트 메세지
    $("#msgs").append(
      $("<div/>", {
        class: "msg msg--broadcast",
      }).append(
        $("<span/>", {
          class: "msg__content",
          text: "채팅서버에 오신 것을 환영합니다.",
        })
      )
    );
    // 플라스크 connect_response 이벤트로 데이터 전송
    sock.emit("connect_response", { user_id: userId, nickname: nickname });
  });

  // broadcast 이벤트를 알려줌
  sock.on("broadcast", function (msg) {
    if (msg["status"] === "connect") {
      // []님이 입장하셨습니다 메세지 출력!
      $("#msgs").append(
        $("<div/>", {
          class: "msg msg--broadcast",
        }).append(
          $("<span/>", {
            class: "msg__content",
            text: `[${msg["nickname"]}] ${msg["msg"]}`,
          })
        )
      );
    } else if (msg["status"] === "disconnect") {
      // []님이 퇴장하셨습니다 메세지 출력!
      $("#msgs").append(
        $("<div/>", {
          class: "msg msg--broadcast",
        }).append(
          $("<span/>", {
            class: "msg__content",
            text: `[${msg["nickname"]}] ${msg["msg"]}`,
          })
        )
      );
    }
  });

  sock.on("echo_send", function (msg) {
    // 에코 메세지를 받으면 True 응답
    if (msg["msg"] === "Echo") {
      userNum = msg["userNum"];
      $("#jsUserNum").text(userNum);
      sock.emit("echo_receive", { user_id: userId, data: true });
    }
  });

  sock.on("receive", function (msg) {
    // 메세지를 출력할 때
    recId = msg["receive"]["user_id"];
    if (recId === userId) {
      // 메세지 객체 안에 있는 uuid와 클라이언트 uuid 변수의
      // 값이 같다면, 내가 보낸 메세지로 인정!
      $("#msgs").append(
        $("<div/>", {
          class: "msg send",
        })
          .append(
            $("<span/>", {
              class: "msg__name",
              text: `${msg["receive"]["nickname"]}: `,
            })
          )
          .append(
            $("<span/>", { class: "msg__content", text: msg["receive"]["msg"] })
          )
      );
    } else {
      // 메세지 객체 안에 있는 uuid와 클라이언트 uuid 변수의
      // 값이 다르면, 내가 받은 메세지로 인정!
      $("#msgs").append(
        $("<div/>", {
          class: "msg receive",
        })
          .append(
            $("<span/>", {
              class: "msg__name",
              text: `${msg["receive"]["nickname"]}: `,
            })
          )
          .append(
            $("<span/>", { class: "msg__content", text: msg["receive"]["msg"] })
          )
      );
    }
    $("#msgs").scrollTop($("#msgs").height());
  });

  $("#jssendbtn").click(function () {
    // 메세지 입력 후 보내기 단추 클릭하면 메세지 전송
    msgContent = $("#jssendMsg").val();

    if (msgContent === "") {
      alert("메세지를 입력하세요!");
      $("#jssendMsg").focus();
    } else {
      sock.emit("send_message", {
        user_id: userId,
        nickname: nickname,
        msg: msgContent,
      });
      $("#jssendMsg").val("");
    }
  });

  $("input").keydown(function (key) {
    // 메세지 입력 후 엔터[엔터 키: 13] 누르면 메세지 전송
    if (key.keyCode === 13) {
      msgContent = $("#jssendMsg").val();

      if (msgContent === "") {
        alert("메세지를 입력하세요!");
        $("#jssendMsg").focus();
      } else {
        sock.emit("send_message", {
          user_id: userId,
          nickname: nickname,
          msg: msgContent,
        });
        $("#jssendMsg").val("");
      }
    }
  });
});
