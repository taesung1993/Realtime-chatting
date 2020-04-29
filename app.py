from flask import Flask, render_template, request, jsonify, session, escape
import firebase_admin
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.secret_key = "secret!"

# 1초마다 응답을 보내고, 3초 안에 응답이 오질 않으면 연결이 끊긴 것으로 간주!
socket_io = SocketIO(app, ping_timeout=3, ping_interval=1)
print("✅ 소켓 생성완료!")

# 유저 데이터베이스 key: user_id, connect: [True(connect) or False(disconnect), 닉네임]
user_db = dict()
# 핑 통신 외에도, 0.5초마다 echo메세지를 보내기 위한 스레드 변수
thread_send_echo = None
# 3초마다 user_db key 값을 검사하여 connect안에 있는 True, False 검사
thread_check_dict = None
# 닉네임을 전역변수로 받으려고 함!
nickname = ""


# Home | RealTimeChat 로드
@app.route('/')
def home():
    return render_template('index.html')


# Chat | RealTimeChat 로드
@app.route('/chat')
def chat():
    global nickname
    nickname = request.args.get("nick")
    return render_template("chat.html")


# 3초마다 Echo 메세지 보냄
def background_thread():
    global user_db
    while True:  # 무한루프
        socket_io.sleep(0.5)
        socket_io.emit('echo_send', {'msg': 'Echo',
                                     'userNum': len(user_db)}, namespace='/test')


def check_connect_status():
    global user_db
    will_del_id = None
    will_del_nick = None
    while True:  # 무한루프
        # 딕셔너리 키, 값 검색
        socket_io.sleep(3)
        try:
            for user_id, connect in user_db.items():
                # 연결 상태가 False이면
                if connect[0] is False:
                    # 삭제될 아이디 저장
                    will_del_id = user_id
                    will_del_nick = connect[1]
                else:
                    # 모든 아이디에 False 할당
                    user_db[user_id][0] = False
            if will_del_id is not None:
                # False를 가진 아이디를 삭제
                del user_db[will_del_id]
                print(f"{will_del_id}이 접속을 종료하였습니다.")
                # 메세지 Broadcast
                socket_io.emit("broadcast", {'status': 'disconnect', 'nickname': will_del_nick,
                                             'msg': '님이 퇴장하셨습니다.'}, broadcast=True, namespace="/test")
        except:
            pass


@socket_io.on("connect", namespace="/test")
def connect():
    global nickname
    # 연결시에 echo 메시지 보내는 스레드 동작
    emit("response", {'msg': '채팅서버에 오신 것을 환영합니다.', 'nickname': nickname})


@socket_io.on("connect_response", namespace="/test")
def connect_response_from_client(msg):
    global user_db, thread_send_echo

    #  서버: 딕셔너리에 ID를 찾고, 찾은 아이디에 True값 부여
    user_db[msg['user_id']] = [True, msg['nickname']]

    if thread_send_echo is None:
        thread_send_echo = socket_io.start_background_task(
            target=background_thread)

    print(f"✅ {msg['user_id']} 접속")
    emit("broadcast", {'status': 'connect', 'nickname': user_db[msg['user_id']][1],
                       'msg': '님이 입장하셨습니다.'}, broadcast=True)


@socket_io.on("echo_receive", namespace="/test")
def echo_receive(msg):
    global user_db,  thread_check_dict
    user_db[msg['user_id']][0] = msg['data']

    # Echo에 대한 응답받으면 background task 실행
    if thread_check_dict is None:
        # 딕셔너리 키 값이 False 유무 체크 확인
        thread_check_dict = socket_io.start_background_task(
            target=check_connect_status)


@socket_io.on("send_message", namespace="/test")
def send_msg(data):
    emit('receive', {'receive': data}, broadcast=True)


@socket_io.on("disconnect", namespace="/test")
def disconnect():
    emit('disconnect', broadcast=True)


if __name__ == '__main__':
    print("✅ http://localhost:5000/: Starting the server!")
    socket_io.run(app, host='localhost', port=5000, debug=True)
