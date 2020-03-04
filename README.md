# Practica 4 HTTP

## Reverse module

Antes de comenzar con las explicaciones y resumen del primer proyecto, hablare un poco de lo errores que surguieron.

En primer luegar tras realizar el main.js y el reverse.js, su ejecución no resultó con éxito. Pues el error que salía era que no encontraba el modelo ./reverse.

Los ajustes que he tenido que realizar para que funcione son:

* Crear el __package.json__ y el __Package-lock.json__

~~~
npm init
~~~

* Crear la carpeta node_modules

~~~
npm install
~~~

* Descargar el module reverse

~~~
npm install reverse
~~~

* Cambiar ruta del require en el main.js de **const {reverse} = require("./reverse");** a:

~~~
const {reverse} = require("./node_modules/reverse");
~~~

* Finalmente, surgió otro error de tipo: **TypeError: reverse is not a function** que se solucionó con:

~~~
var ds = argument.toString().split('').reverse().join('')
console.log(ds);
~~~

O tambien se puede solucionar cambiando el require("./reverse) por:

~~~
require("reverse")
~~~

La imagen de ambos errores se puden ver en los siguientes enlace: ![Error Modulo]("https://github.com/ULL-ESIT-DSI-1920/p3-t1-c3-http-alu0101044200/blob/work/Images/ErrorModulo.png")

![Error funcion]("https://github.com/ULL-ESIT-DSI-1920/p3-t1-c3-http-alu0101044200/blob/work/Images/ErrorFuncion.png")

## HTTP Module

### Modules

    En esta seccion se utilizó el modelo reverse para crear una funcion que es luego llamado desde el main para revertir una frase pasada por terminal.

    La funcion reverse es de la siguiente forma:

    ``` javascript
    exports.reverse = function(string) {
        return Array.from(string).reverse().join("");
    };
    ```

    Mientras que el main se ve así:

    ```
    const {reverse} = require("reverse");

    // Index 2 holds the first actual command line argument
    let argument = process.argv[2];
    var ds = argument.toString().split('').reverse().join('')
    console.log(ds);
    ```

    La salida deeste programa se realiza de la siguiente forma:

![Imagen_Reverse](https://github.com/ULL-ESIT-DSI-1920/p3-t1-c3-http-alu0101044200/blob/work/Images/Reverse.png)


### Package Files

Instalar modelos nuevos con npm y serán añadidas al package.json.

Crear package.json y node_modules:


``` bash
npm init
```

Para instalar un paquete nuevo:


```
npm install __nombre_packete__
```

### Versions

En el package.json se especifica la version del programa. Dicha version se especifica con tres numeros separados por puntos (X,Y,Z).

Cada vez que se añade una nueva funcionalidad se cambia el numero Y. Mientras que si pierde la compatibilidad se debe cambiar la X.

### The File System Module

Este modulo se ha profundizado en la práctica anterior, se puede encontrar en ![File system github]("https://github.com/ULL-ESIT-DSI-1920/p2-t1-c3-filesystem-alu0101044200")

### The HTTP Module

El modelo HTTP sirve para crear servidores HTTP y poder realizar peticiones HTTP del cliente.

El ejemplo de servidor que vemos en el libro es:


```
const {createServer} = require("http");
let server = createServer((request, response) => {
  response.writeHead(200, {"Content-Type": "text/html"});
  response.write(`
    <h1>Hello!</h1>
    <p>You asked for <code>${request.url}</code></p>`);
  response.end();
});
server.listen(8000);
console.log("Listening! (port 8000)");

```

Mientras que el cliente HTTP para realizar las peticiones se realiza de la siguiente forma:


```
const {request} = require("http");
let requestStream = request({
  hostname: "eloquentjavascript.net",
  path: "/20_node.html",
  method: "GET",
  headers: {Accept: "text/html"}
}, response => {
  console.log("Server responded with status code",
              response.statusCode);
});
requestStream.end();

```

La salida del siguiente programa es:

![htto module](https://github.com/ULL-ESIT-DSI-1920/p3-t1-c3-http-alu0101044200/blob/work/Images/httpmodule.png)


### Streams

En este apartado se veran nuevos streams, para poder escribirlas, por ejemplo con el **create WriteStream** del module **fs**.

Por otro lado se tienen las transmiciones legibles que tienen eventos de "data" y "end"

Este código crea un servidor que lee las solicitudes y los vuelve a transmitir al cliente como texto en mayúsculas:

```
const {createServer} = require("http");
createServer((request, response) => {
  response.writeHead(200, {"Content-Type": "text/plain"});
  request.on("data", chunk =>
    response.write(chunk.toString().toUpperCase()));
  request.on("end", () => response.end());
}).listen(8000);

```

El siguiente fragmento de código, cuando se ejecuta con el servidor de mayúsculas activo, enviará una solicitud a ese servidor y escribirá la respuesta que obtenga:

```
const {request} = require("http");
request({
  hostname: "localhost",
  port: 8000,
  method: "POST"
}, response => {
  response.on("data", chunk =>
    process.stdout.write(chunk.toString()));
}).end("Hello server");

```

La salida del siguiente programa es:

![streams](https://github.com/ULL-ESIT-DSI-1920/p3-t1-c3-http-alu0101044200/blob/work/Images/streams.png)


### A File Server

En este apartado la intencion es crear un servidor HTTP que permite el acceso remoto a un sistema de archivos.

HTTP nos permite realizar peticiones como el GET, PUT y DELETE, que se usan para leer, escribir y eliminar archivos.

El código para poder realizar las siguientes peticiones es:

```
const {createServer} = require("http");

const methods = Object.create(null);

createServer((request, response) => {
  let handler = methods[request.method] || notAllowed;
  handler(request)
    .catch(error => {
      if (error.status != null) return error;
      return {body: String(error), status: 500};
    })
    .then(({body, status = 200, type = "text/plain"}) => {
       response.writeHead(status, {"Content-Type": type});
       if (body && body.pipe) body.pipe(response);
       else response.end(body);
    });
}).listen(8000);

async function notAllowed(request) {
  return {
    status: 405,
    body: `Method ${request.method} not allowed.`
  };
}


const {parse} = require("url");
const {resolve, sep} = require("path");

const baseDirectory = process.cwd();

function urlPath(url) {
  let {pathname} = parse(url);
  let path = resolve(decodeURIComponent(pathname).slice(1));
  if (path != baseDirectory &&
      !path.startsWith(baseDirectory + sep)) {
    throw {status: 403, body: "Forbidden"};
  }
  return path;
}


const {createReadStream} = require("fs");
const {stat, readdir} = require("fs").promises;
const mime = require("mime");

methods.GET = async function(request) {
  let path = urlPath(request.url);
  let stats;
  try {
    stats = await stat(path);
  } catch (error) {
    if (error.code != "ENOENT") throw error;
    else return {status: 404, body: "File not found"};
  }
  if (stats.isDirectory()) {
    return {body: (await readdir(path)).join("\n")};
  } else {
    return {body: createReadStream(path),
            type: mime.getType(path)};
  }
};

const {rmdir, unlink} = require("fs").promises;

methods.DELETE = async function(request) {
  let path = urlPath(request.url);
  let stats;
  try {
    stats = await stat(path);
  } catch (error) {
    if (error.code != "ENOENT") throw error;
    else return {status: 204};
  }
  if (stats.isDirectory()) await rmdir(path);
  else await unlink(path);
  return {status: 204};
};


const {createWriteStream} = require("fs");

function pipeStream(from, to) {
  return new Promise((resolve, reject) => {
    from.on("error", reject);
    to.on("error", reject);
    to.on("finish", resolve);
    from.pipe(to);
  });
}

methods.PUT = async function(request) {
  let path = urlPath(request.url);
  await pipeStream(request, createWriteStream(path));
  return {status: 204};
};
```

La salida e utilización del siguiente programa se hace como:

![AfileServer](https://github.com/ULL-ESIT-DSI-1920/p3-t1-c3-http-alu0101044200/blob/work/Images/afile.png)


## Ejercicios

### Creating Directories

* Though the DELETE method is wired up to delete directories (using fs.rmdir), the file server currently does not provide any way to create a directory. Add support for a method MKCOL, which should create a directory by calling fs.mkdir.
  
```
methods.MKCOL = function(path, respond, request) { 
  fs.stat(path, function(error,stats){
    
    if(!stats)
      fs.mkdir(path, respondErrorOrNothing(respond));
    if(error && error.code == "ENOENT")
      respond(204);
    else if (error)
      respond(500, error.toString());
    else if(stats.isDirectory())
      respond(204);
    else 
      respond(400);
    
  })

};
```



## GULP FILE

Primeros pasos:

```
npm install gulp
npm install gulp-shell
```

Crear fichero gulpfile.js, su contenido es:

```
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
```

Para correr el servidor:
* gulp serve

Para ver errores con jshint:
* npm install -g jshint
* gulp lint

Realizar el GET, PUT y DELETE:
* gulp get
* gulp put
* gult delete

Y por ultimo, para crear los ficheros de documentacion con documentation.js
* npm install -g documentation
* gulp doc



