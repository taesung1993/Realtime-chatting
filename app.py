from flask import Flask, render_template, request, jsonify
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

app = Flask(__name__)

cred = credentials.Certificate('mychatting-14f41.json')
firebase_admin.initialize_app(cred)

db = firestore.client()
print("✅ mychatting.json: 데이터베이스 클라이언트 생성 완료!")


@app.route('/', methods=['GET', 'POST'])
def home():
    return render_template('index.html')


@app.route("/chat", methods=["POST"])
def chatting():
    chats_ref = db.collection(u'chats').document('chat')
    chat_id = chats_ref.id
    msgs_ref = chats_ref.collection('msgs').document('msg')
    print(request.form['msg--send'])
    msgs_ref.set({
        u'name': '나',
        u'msg': request.form['msg--send']
    })
    s_msg = msgs_ref.get().to_dict()
    return jsonify({'result': 'success'})


if __name__ == '__main__':
    print("✅ http://localhost:5000/: Starting the server!")
    app.run('localhost', port=5000, debug=True)
