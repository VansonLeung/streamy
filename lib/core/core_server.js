var sessions = {};

// -------------------------------------------------------------------------- //
// ------------------------------- Accessors -------------------------------- //
// -------------------------------------------------------------------------- //

/**
 * Retrieve server connected sockets or a subset
 * @param {String|Array} sid Optional, socket id or ids to retrieve
 * @return  {Object} If sid is provided, it will returns an object with a send method and _sockets array of sockets, else, it will returns all sockets
 */
Streamy.sockets = function(sid) {

  if(sid) {
    sid = _.isArray(sid) ? sid : [sid];
    var sockets = [];

    _.each(sid, function(session_id) {
      var sock = sessions[session_id];

      if(sock)
        sockets.push(sock);
    });

    return {
      _sockets: sockets,
      send: function(data) {
        _.each(sockets, function(socket) {
          socket.send(data);
        });
      }
    }
  }

  return sessions;
};

// -------------------------------------------------------------------------- //
// ------------------------------- Overrides -------------------------------- //
// -------------------------------------------------------------------------- //

Streamy.init = function() {
  var self = this;

  // When a new connection has been received
  Meteor.default_server.stream_server.register(function onNewConnected(socket) {
    var handlers_registered = false;

    // On closed, call disconnect handlers
    socket.on('close', function onSocketClosed() {
      if(handlers_registered) {
        var sid = Streamy.id(socket);

        delete sessions[sid];

        _.each(self.disconnectHandlers(), function forEachDisconnectHandler(cb) {
          cb.call(self, socket);
        });
      }
    });

    // This little trick is used to register protocol handlers on the
    // socket._meteorSession object, so we need it to be set
    socket.on('data', function onSocketData(raw_data) {

      // Only if the socket as a meteor session
      if(!handlers_registered && socket._meteorSession) {

        // Store the meteorSesion id in an inner property since _meteorSession will be deleted upon socket closed
        socket.__sid = socket._meteorSession.id;

        var sid = Streamy.id(socket);

        handlers_registered = true;

        sessions[sid] = socket;

        // Call connection handlers
        _.each(self.connectHandlers(), function forEachConnectHandler(cb) {
          cb.call(self, socket);
        });

        // Add each handler to the list of protocol handlers
        _.each(self.handlers(), function forEachHandler(cb, name) {
          if(!socket._meteorSession.protocol_handlers[name]) {
            socket._meteorSession.protocol_handlers[name] = function onMessage(raw_msg) {
              delete raw_msg.msg; // Remove msg field
              cb.call(self, raw_msg, this.socket);
            };
          }
        });
      }
    });
  });
};

Streamy._write = function(data, to) {
  if(to)
    to.send(data);
};
