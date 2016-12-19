// -------------------------------------------------------------------------- //
// --------------------- Overriden by client/server ------------------------- //
// -------------------------------------------------------------------------- //

/**
 * Gets the wrapper for the emit returned by Streamy.sessions(sid)
 * @param {String|Array} sid Session id(s)
 * @return  {Function}  Function which will be called by emit on the session
 */
Streamy._sessionsEmit = function(sid) { };

// -------------------------------------------------------------------------- //
// -------------------------- Common interface ------------------------------ //
// -------------------------------------------------------------------------- //

/**
 * Returns an object for the targetted session id(s) which contains an emit method
 * @param {String|Array} sid Session id(s)
 * @return  {Object}  Object with an emit function
 */
Streamy.sessions = function(sid) {
  return {
    emit: Streamy._sessionsEmit(sid)
  };
};
