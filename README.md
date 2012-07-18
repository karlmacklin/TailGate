TailGate
========

node.js file watcher for tail-following log files on server.
Using socket.io, jQuery, Twitter Bootstrap.

Usage:
- Run "node tailgate.js"
- Default port is 8081
- Connect to the server, ex: http://dev.yourserver.com:8081
- Enter full path to the file you wish to tail

Bonus stuff:
- You can turn off the autoscrolling
- Cookies will save a history of the files you tail
- Cookie can be cleared with "Clear file history cookie" button
- Works in multiple browser tabs, updates dropdown history on every new file connect

You can easily change the buffersize in tailgate.js if you wish.
Only tested on Debian Linux, relies heavily on Node.js's fs.watch function which may or may not work depending on your system.


Software released under MIT license, see the long text in license.txt