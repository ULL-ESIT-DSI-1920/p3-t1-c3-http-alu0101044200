var gulp = require("gulp");
var shell = require("gulp-shell");

gulp.task("pre-install", shell.task([
      "sudo npm i -g gulp static-server",
      "sudo npm install -g nodemon",
      "sudo npm install -g gulp-shell"
]));

gulp.task("serve", shell.task("nodemon server.js"));

gulp.task("lint", shell.task("jshint *.js **/*.js"));

gulp.task("get", shell.task("curl -v http://localhost:8000/file.txt"));
gulp.task("put", shell.task("curl -v -X PUT -d 'Bye world!' http://localhost:8000/file.txt"));
gulp.task("delete", shell.task("curl -v -X DELETE http://localhost:8000/DIRECTORY"));

gulp.task("doc", shell.task("documentation build server.js -f md -o doc"));