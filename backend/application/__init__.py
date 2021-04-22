from flask import Flask
from flask_pymongo import PyMongo
from flask_cors import CORS
from flask_socketio import SocketIO

from config import Config

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')
socketio.engineio_logger=True
socketio.logger=True
db = PyMongo(app)


from . import routes
socketio.run(app, port='8080')

