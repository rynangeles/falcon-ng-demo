#!/usr/bin/env python

import os
import json
import falcon
import mimetypes
from wsgiref import simple_server
from pymongo import MongoClient
from bson.objectid import ObjectId
from bson.json_util import dumps

client = MongoClient('127.0.0.1', 27017)

class Todo:
    def __init__(self, db):
        self.db = db
        self.collection = self.db.collection['todo']

    def on_get(self, req, res):
        id = req.get_param('id') or ""
        res.status = falcon.HTTP_200
        result = self.collection.find()
        if id :
            result = self.collection.find_one({'_id':ObjectId(id)})
        res.body = dumps(result)

    def on_post(self, req, res):
        body = req.stream.read()
        deserialize = json.loads(body.decode('utf-8'))
        todo = self.collection.insert(deserialize)
        res.status = falcon.HTTP_201
        res.location = '/api/todos?id=%s' % (todo)
        res.body = dumps(self.collection.find_one({'_id':todo}))

    def on_put(self, req, res):
        id = req.get_param('id') or ""
        body = req.stream.read()
        deserialize = json.loads(body.decode('utf-8'))
        del deserialize['_id']
        todo = self.collection.update({'_id':ObjectId(id)}, {"$set": deserialize})
        res.status = falcon.HTTP_201
        res.location = '/api/todos?id=%s' % (todo)

    def on_delete(self, req, res):
        id = req.get_param('id') or ""
        todo = self.collection.remove({'_id':ObjectId(id)})
        res.status = falcon.HTTP_200

app = falcon.API()
app.add_route("/api/todos", Todo(client['angular-demo']))


# This part is for convenience in development only
if __name__ == "__main__":
    def static(req, res, static_dir=os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', 'app')), index_file='views/index.html'):
        path = static_dir + req.path
        if req.path == '/':
            path += index_file
        if os.path.isfile(path):
            if mimetypes.guess_type(path)[0] is None:
                res.status = falcon.HTTP_404
            else:
                res.content_type = mimetypes.guess_type(path)[0]
                res.status = falcon.HTTP_200
                res.stream = open(path)
        else:
            res.status = falcon.HTTP_404

    app.add_sink(static)

    host = "127.0.0.1"
    port = 8000
    httpd = simple_server.make_server(host, port, app)
    print "Serving on %s:%s" % (host, port)
    httpd.serve_forever()