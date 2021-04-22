from flask import jsonify, request, make_response
from flask_socketio import send, emit
from bson.json_util import dumps
from uuid import uuid4
import datetime
import jwt
from functools import wraps

from application.models import *
from application import app, socketio
from config import Config


def token_required(func):
    @wraps(func)
    def decorated(*args, **kwargs):
        token = ""

        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split()[1]

        if not token:
            return not_found("Token is missing")

        try:
            data = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
            current_user = get_user(uid=data["public_id"])[0]
        except Exception as e:
            return jsonify({"message":f"Token is invalid. {e}"}), 401

        return func(current_user, *args, **kwargs)

    return decorated


@app.errorhandler(404)
def not_found(error=""):
    message = {
        'status': 404,
        'message': f'Not found {request.url}. {error}'
    }

    response = jsonify(message)
    response.status_code = 404

    return response


@app.route('/document/', methods=['GET'])
def documents():
    docs = get_all_documents()
    response = dumps(docs)

    return response


@app.route('/document/archive/', methods=['GET'])
def archive_documents():
    docs = get_archive_documents()
    response = dumps(docs)

    return response


@app.route('/document/<uid>/', methods=["GET"])
def document(uid):
    doc = get_document_by_uid(uid)
    response = dumps(doc)

    return response


@app.route('/document/', methods=['POST'])
@token_required
def add_document(current_user):
    print("document insert")
    _json = request.json

    author = current_user["username"]
    edited_by = author
    is_sign = False

    try:
        uid = uuid4().hex
        title = _json['title']

        try:
            body = _json['body']
        except Exception:
            body = ''

        status = _json['status']
    except Exception:
        return not_found("Fields title and status can't be empty")

    commentaries = []

    if request.method == 'POST':

        insert_document(uid, author, title, body, status, commentaries, edited_by, is_sign)
        response = jsonify("Document added successfully")
        response.status_code = 200
        print("document inserted")

        return response

    else:
        return not_found()


@app.route('/document/<uid>/', methods=['DELETE'])
@token_required
def delete_document(current_user, uid):
    delete_document_by_id(uid)
    response = jsonify("Document deleted successfully")
    response.status_code = 200

    return response


@app.route('/document/<uid>/', methods=['PUT'])
def update_document(uid):
    _json = request.json

    _uid = uid
    author, title, body, status, commentaries, status, edited_by, is_sign = '', '', '', '', [], '', '', ''

    try:
        author = _json['author']
    except Exception:
        pass
    try:
        title = _json['title']
    except Exception:
        pass
    try:
        body = _json['body']
    except Exception:
        pass
    try:
        status = _json['status']
    except Exception:
        pass
    try:
        edited_by = _json['edited_by']
    except Exception:
        pass
    try:
        is_sign = _json['is_sign']
    except Exception:
        pass

    if request.method == 'PUT':
        update_document_by_id(uid, author, title, body, status, edited_by, is_sign)
        response = jsonify("Document updated successfully")
        response.status_code = 200

        return response


@app.route('/company/', methods=['GET'])
def companies():
    comps = get_all_companies()
    response = dumps(comps)

    return response


@app.route('/company/<uid>/', methods=["GET"])
def company(uid):
    comp = get_company_by_uid(uid)
    response = dumps(comp)

    return response


@app.route('/company/', methods=['POST'])
@token_required
def create_company(current_user):
    _json = request.json

    uid = uuid4().hex

    ceo = set_ceo(current_user["username"])

    lawyer1 = ""
    lawyer2 = ""
    lawyer3 = ""
    economist1 = ""
    economist2 = ""
    economist3 = ""

    try:
        name = _json['name']
    except Exception:
        return not_found('Company should have a name')
    try:
        lawyer1 = _json['lawyer1']
    except Exception:
        pass
    try:
        lawyer2 = _json['lawyer2']
    except Exception:
        pass
    try:
        lawyer3 = _json['lawyer3']
    except Exception:
        pass
    try:
        economist1 = _json['economist1']
    except Exception:
        pass
    try:
        economist2 = _json['economist2']
    except Exception:
        pass
    try:
        economist3 = _json['economist3']
    except Exception:
        pass

    if request.method == "POST":

        comp = create_company_in_db(uid, name, lawyer1, lawyer2, lawyer3, economist1, economist2, economist3, ceo)

        if not comp:
            return not_found("Company with this name has already existed")
        else:
            response = jsonify("Company created successfully")
            response.status_code = 200

            return response
    else:
        return not_found()


@app.route('/company/<uid>/', methods=['DELETE'])
@token_required
def delete_company(current_user, uid):
    delete_company_by_uid(uid)
    response = jsonify("Company deleted successfully")
    response.status_code = 200

    return response


@app.route('/company/<uid>/', methods=['PUT'])
def update_company(uid):
    _json = request.json

    _uid = uid

    name = ""
    ceo = ""
    lawyer1 = ""
    lawyer2 = ""
    lawyer3 = ""
    economist1 = ""
    economist2 = ""
    economist3 = ""

    try:
        name = _json['name']
    except Exception:
        pass
    try:
        ceo = _json['ceo']
    except Exception:
        pass
    try:
        lawyer1 = _json['lawyer1']
    except Exception:
        pass
    try:
        lawyer2 = _json['lawyer2']
    except Exception:
        pass
    try:
        lawyer3 = _json['lawyer3']
    except Exception:
        pass
    try:
        economist1 = _json['economist1']
    except Exception:
        pass
    try:
        economist2 = _json['economist2']
    except Exception:
        pass
    try:
        economist3 = _json['economist3']
    except Exception:
        pass

    if request.method == 'PUT':
        comp = update_company_by_uid(uid, name, lawyer1, lawyer2, lawyer3, economist1, economist2, economist3, ceo)

        if not comp:
            return not_found("Company with this name has already existed.")

        response = jsonify("Company updated successfully")
        response.status_code = 200
        return response
    else:
        return not_found()


@app.route('/comments/<uid>/', methods=['GET', 'DELETE'])
def comments(uid):
    if request.method == 'GET':
        comment = get_one_comment(uid)

        return dumps(comment)
    elif request.method == 'DELETE':
        delete_comment(uid)
        response = jsonify("Comment deleted successfully")
        response.status_code = 200

        return response
    else:
        return not_found()


@app.route('/comments/', methods=['POST'])
@token_required
def create_comment(current_user):
    _json = request.json
    author = current_user['username']

    try:
        uid = _json['uid']
        comment_text = _json['comment']
        text_body = _json['body']
    except Exception:
        return not_found("Uid and body of comment can't be empty")

    if request.method == 'POST':
        insert_comment(author, uid, comment_text, text_body)
        response = jsonify("Comment created successfully")
        response.status_code = 201

        return response


@app.route('/comments/', methods=['GET'])
@token_required
def comment():
    comm = get_all_comments()
    response = dumps(comm)

    return response


@app.route('/user/register/', methods=['POST'])
def register():
    _json = request.json
    uid = uuid4().hex

    try:
        username = _json['username']
    except Exception:
        return not_found("You must write username")
    try:
        role = _json['role']
    except Exception:
        role = ""
    try:
        ceo = _json['ceo']
    except Exception:
        ceo = False
    try:
        company = _json['company']
    except Exception:
        company = ""

    user = create_user_in_db(uid, username, role, ceo, company)

    if user:
        response = jsonify("User created successfully")
        response.status_code = 200
        return response
    else:
        return not_found("Can't create a user")


@app.route('/user/login/', methods=['POST'])
def login():
    _json = request.json

    user = get_user(username=_json['username'])
    is_user = user[1]
    user = user[0]

    if not is_user:
        return make_response('Could not verify', 401,
                             {'WWW-Authenticate': 'Basic realm="Username required!"'})

    token = jwt.encode({'public_id':user['uid'],
                        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=60)},
                       Config.SECRET_KEY)

    return jsonify({'token':token})


@app.route('/users/', methods=['GET'])
@token_required
def user(current_user):
    u = dumps(current_user)

    return u


@socketio.on('document from user', namespace="/doc")
def handleDocumentBody(data):
    print(data)
    try:
        if 'body' in data:
            print('body!')
            set_body(data['uid'], data['edited_by'], body=data['body'])
            emit('from flask body', [data['body'], data['edited_by']], broadcast=True)
    except Exception as e:
        print(e)


@socketio.on('title from user', namespace="/doc")
def handleDocumentTitle(data):
    print(data)
    try:
        if 'title' in data:
            print('title!')
            set_body(data['uid'], data['edited_by'], title=data['title'])
            emit('from flask title', [data['title'], data['edited_by']], broadcast=True)
    except Exception as e:
        print(e)


@socketio.on('status from user', namespace="/doc")
def handleDocumentStatus(data):
    print(data)
    try:
        if 'status' in data:
            print('status!')
            set_body(data['uid'], data['edited_by'], status=data['status'])
            emit('from flask status', [data['status'], data['edited_by']], broadcast=True)
    except Exception as e:
        print(e)


@socketio.on('user join', namespace="/mail")
def handleUser(data):
    print(data.get('username'))
    emit('usermessage', data.get("username"), broadcast=True)


@socketio.on('user send', namespace="/mail")
def handleMessage(data):
    print(data.get('username'))
    emit('message', [data.get("username"), data.get("message")], broadcast=True)