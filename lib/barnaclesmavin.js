/**
 * Copyright reelyActive 2024
 * We believe in an open Internet of Things
 */


const WebSocket = require('ws');


const DEFAULT_PORT = 3001;
const DEFAULT_PRINT_ERRORS = false;


/**
 * BarnaclesMavin Class
 * Detects events and sends notifications.
 */
class BarnaclesMavin {

  /**
   * BarnaclesMavin constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    let self = this;
    options = options || {};

    this.printErrors = options.printErrors || DEFAULT_PRINT_ERRORS;

    // Use the provided WebSocket server instance
    if(options.wss) {
      this.wss = options.wss;
    }

    // Use the provided HTTP(S) server
    else if(options.server) {
      this.wss = new WebSocket.WebSocketServer({ server: options.server });
    }

    // Have WebSocketServer create a new server on the given port
    else {
      let port = options.port || DEFAULT_PORT;
      this.wss = new WebSocket.WebSocketServer({ port: port });
    }

    this.wss.on('connection', (ws) => {
      if(self.printErrors) {
        ws.on('error', console.error);
      }
    });
  }

  /**
   * Handle an outbound event.
   * @param {String} name The event name.
   * @param {Object} data The outbound event data.
   */
  handleEvent(name, data) {
    let self = this;

    switch(name) {
      case 'dynamb':
        return handleDynamb(self, data);
    }
  }

}


/**
 * Handle the given dynamb by relaying it if it applies to Mavin.
 * @param {BarnaclesMavin} instance The BarnaclesMavin instance.
 * @param {Object} dynamb The dynamb data.
 */
function handleDynamb(instance, dynamb) {
  if(isMavinEvent(instance, dynamb)) {
    let message = JSON.stringify({ type: "dynamb", data: dynamb });
    // TODO: add sequence number
    instance.wss.clients.forEach((client) => {
      if(client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}


/**
 * Determine if the given event applies to Mavin.
 * @param {BarnaclesMavin} instance The BarnaclesMavin instance.
 * @param {Object} dynamb The dynamb data.
 */
function isMavinEvent(instance, dynamb) {
  return Array.isArray(dynamb.isContactDetected) ||
         Array.isArray(dynamb.isMotionDetected);    // TODO: whitelist
}


module.exports = BarnaclesMavin;
