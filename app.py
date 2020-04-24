from flask import Flask, render_template, request, jsonify, session, escape
import firebase_admin
import time
from firebase_admin import credentials
from firebase_admin import firestore
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.secret_key = "secret!"

socket_io = SocketIO(app)
print("✅ 소켓 생성완료!")

cred = credentials.Certificate('myfirestore.json')
firebase_admin.initialize_app(cred)

db = firestore.client()
chats_ref = db.collection(u'chats').document('chat')
msgs_ref = chats_ref.collection('msgs').document('msg')
print("✅ mychatting.json: 데이터베이스 클라이언트 생성 완료!")

# 채팅방에 접속해있는 유저 수를 소켓으로 보내려고 함.

user_num = 0
thread = None


def background_thread():
    while True:
        socket_io.sleep(5)
        socket_io.emit('message', {'msg': 'Echo'}, namespace='/test')


@app.route('/')
def home():
    return render_template('index.html')


@socket_io.on("connect", namespace="/test")
def connect():
    global thread
    if thread is None:
        thread = socket_io.start_background_task(target=background_thread)
    emit("response", {'msg': '채팅서버에 오신 것을 환영합니다.'})


@socket_io.on("connect_response", namespace="/test")
def connect_response_from_client(msg):
    global user_num
    user_num += 1
    print(f"✅ {msg['user_id']} 접속, 접속자 수: {user_num} 명")


@socket_io.on("echo_receive")
def echo_receive(msg):
    # 출력이 아예 되지도 않음
    print(f"✅ {msg['echo']}")


@socket_io.on("disconnect", namespace="/test")
def disconnect():
    global user_num
    user_num -= 1
    emit('disconnect', {'user_num': user_num}, broadcast=True)


@app.route("/chat", methods=["POST"])
def chatting():
    msgs_ref.set({
        u'name': request.form['nickname'],
        u'msg': request.form['msg'],
        u'uuid': request.form['unique_id']
    })
    return jsonify({'result': 'success'})


if __name__ == '__main__':
    print("✅ http://localhost:5000/: Starting the server!")
    socket_io.run(app, host='localhost', port=5000, debug=True)
