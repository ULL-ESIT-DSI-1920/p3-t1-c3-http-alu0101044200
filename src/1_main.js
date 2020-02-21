const {reverse} = require("./node_modules/reverse");

// Index 2 holds the first actual command line argument
let argument = process.argv[2];
var ds = argument.toString().split('').reverse().join('')
console.log(ds);