from application import db


def insert_document(uid, author, title, body, status, commentaries, edited_by, is_sign):
    db.db.Documents.insert({'uid': uid,
                            'author': author,
                            'title': title,
                            'body': body,
                            'status': status,
                            'commentraties': commentaries,
                            'edited_by': edited_by,
                            'is_sign': is_sign})


def get_all_documents():
    return db.db.Documents.find({"status": {"$ne":"archive"}})


def get_archive_documents():
    return db.db.Documents.find({"status":"archive"})


def get_document_by_uid(uid):
    return db.db.Documents.find_one({'uid': uid})


def delete_document_by_id(uid):
    return db.db.Documents.delete_one({'uid': uid})


def update_document_by_id(uid, author, title, body, status, edited_by, is_sign):
    document = db.db.Documents.find_one({'uid': uid})

    author = document['author'] if author == "" else author
    title = document['title'] if title == "" else title
    body = document['body'] if body == "" else body
    status = document['status'] if status == "" else status
    edited_by = document['edited_by'] if edited_by == "" else edited_by
    is_sign = document['is_sign'] if is_sign == "" else is_sign

    return db.db.Documents.update_one({"uid": uid}, {'$set':
                                                         {'author': author,
                                                          'title': title,
                                                          'body': body,
                                                          'status': status,
                                                          'edited_by': edited_by,
                                                          'is_sign': is_sign}
                                                     })


def create_company_in_db(uid, name, l1, l2, l3, e1, e2, e3, ceo):
    company = db.db.Companies.find({'name': name}).count()

    if company:
        return False
    else:
        db.db.Companies.insert({'uid': uid,
                                'name': name,
                                'lawyer1': l1,
                                'lawyer2': l2,
                                'lawyer3': l3,
                                'economist1': e1,
                                'economist2': e2,
                                'economist3': e3,
                                'ceo': ceo})
        return True


def get_all_companies():
    return db.db.Companies.find()


def get_company_by_uid(uid):
    return db.db.Companies.find_one({'uid': uid})


def delete_company_by_uid(uid):
    return db.db.Companies.delete_one({'uid': uid})


def update_company_by_uid(uid, name, l1, l2, l3, e1, e2, e3, ceo):
    company = db.db.Companies.find_one({'uid': uid})

    if name != "":
        _company = db.db.Companies.find({'name': name}).count()
        if _company:
            return False
    else:
        name = company['name']

    l1 = company['lawyer1'] if l1 == "" else l1
    l2 = company['lawyer2'] if l2 == "" else l2
    l3 = company['lawyer3'] if l3 == "" else l3
    e1 = company['economist1'] if e1 == "" else e1
    e2 = company['economist2'] if e2 == "" else e2
    e3 = company['economist3'] if e3 == "" else e3
    ceo = company['ceo'] if ceo == "" else ceo

    db.db.Companies.update_one({"uid": uid}, {'$set':
                                                  {'name': name,
                                                   'lawyer1': l1,
                                                   'lawyer2': l2,
                                                   'lawyer3': l3,
                                                   'economist1': e1,
                                                   'economist2': e2,
                                                   'economist3': e3,
                                                   'ceo': ceo}
                                              })

    return True


def create_user_in_db(uid, username, role, ceo, company):
    _user = db.db.Users.find({"username": username}).count()

    if _user:
        return False

    if role != "" and ceo:
        return False

    if company != "":
        _company = db.db.Companies.find_one({"name": company})

        if role == "economist":
            if _company["economist1"] == "":
                db.db.Companies.update_one({"name": company}, {"$set": {"economist1": username}})
            elif _company["economist2"] == "":
                db.db.Companies.update_one({"name": company}, {"$set": {"economist2": username}})
            elif _company["economist3"] == "":
                db.db.Companies.update_one({"name": company}, {"$set": {"economist3": username}})
            else:
                return False
        elif role == "lawyer":
            if _company["lawyer1"] == "":
                db.db.Companies.update_one({"name": company}, {"$set": {"lawyer1": username}})
            elif _company["lawyer2"] == "":
                db.db.Companies.update_one({"name": company}, {"$set": {"lawyer2": username}})
            elif _company["lawyer3"] == "":
                db.db.Companies.update_one({"name": company}, {"$set": {"lawyer3": username}})
            else:
                return False
        elif ceo:
            if _company["ceo"] == "":
                db.db.Companies.update_one({"name": company}, {"$set": {"ceo": username}})
        else:
            return False

    user = db.db.Users.insert({'uid': uid,
                               'username': username,
                               'role': role,
                               'ceo': ceo,
                               'company': company})

    return True


def get_user(username="", uid=""):
    _user = ""

    if username:
        _user = db.db.Users.find({'username': username}).count()
        if not _user:
            return ["", False]
        return [db.db.Users.find_one({"username": username}), True]
    elif uid:
        _user = db.db.Users.find({'uid': uid}).count()
        if not _user:
            return ["", False]
        return [db.db.Users.find_one({"uid":uid}), True]


def set_ceo(username):
    db.db.Users.update_one({"username":username}, {"$set":{"ceo":True}})

    return username


def set_body(uid, edited_by, body="", title="", status=""):
    if body != "":
        db.db.Documents.update_one({"uid":uid}, {"$set": {"body":body,
                                                         "edited_by": edited_by}})
    elif title != "":
        db.db.Documents.update_one({"uid": uid}, {"$set": {"title": title,
                                                           "edited_by": edited_by}})
    elif status != "":
        db.db.Documents.update_one({"uid": uid}, {"$set": {"status": status,
                                                           "edited_by": edited_by}})


def get_one_comment(uid):
    return db.db.Comments.find({"document_uid": uid})


def delete_comment(uid):
    db.db.Comments.delete_one({'document_uid': uid})


def insert_comment(author, document_uid, comment, text_body):
    db.db.Comments.insert_one({'author':author,
                               'document_uid':document_uid,
                               'comment': comment,
                               'body': text_body})


def get_all_comments():
    return db.db.Comments.find()