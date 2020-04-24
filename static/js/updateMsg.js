// 파이어스토어 설정
var firebaseConfig = {
  apiKey: "AIzaSyBv6jI7FwAahqL4p9P_Uy_Ezs-oLl6n8G0",
  authDomain: "chatting-8e5bc.firebaseapp.com",
  databaseURL: "https://chatting-8e5bc.firebaseio.com",
  projectId: "chatting-8e5bc",
  storageBucket: "chatting-8e5bc.appspot.com",
  messagingSenderId: "398055599531",
  appId: "1:398055599531:web:32d646e4afd6dc2b1f76ee",
  measurementId: "G-GVFY3725FD",
};
firebase.initializeApp(firebaseConfig);

function createUUID() {
  // 12자리 16진수로 이루어진 UUID 생성하는 함수.
  function createS4() {
    var s4 = Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
    return s4;
  }
  return `${createS4()}-${createS4()}-${createS4()}`;
}

//파이어스토어 레퍼런스 초기화
var db = firebase.firestore();
var chats_ref = db.collection("chats").doc("chat");
var msgs_ref = chats_ref.collection("msgs");

// 클라이언트 고유 식별 ID 생성
var uuid = createUUID();

function handleSendMessages() {
  // 메세지 보내기
  $("#msg--sendbtn").on("click", function () {
    $.ajax({
      type: "POST",
      url: "/chat",
      data: {
        nickname: $("#nick--make").val(),
        msg: $("#sendMsg").val(),
        unique_id: uuid,
      },
      success: function (response) {
        if (response["result"] === "success") {
          $("#nick--make").val("");
          $("#sendMsg").val("");
        }
      },
    });
  });
}

function updateMessages() {
  //메시지 업데이트
  msgs_ref.doc("msg").onSnapshot(function (doc) {
    if (doc.data() !== undefined) {
      $("#msgs").append(
        $("<li/>", {
          text: `${
            uuid === doc.data()["uuid"]
              ? `${doc.data()["name"]}(나)`
              : doc.data()["name"]
          }: ${doc.data()["msg"]}`,
        })
      );
      console.log("Current data: ", doc.data());
    }
  });
}

function init() {
  sessionStorage.setItem("user-id", uuid);
  handleSendMessages();
  updateMessages();
}

init();
