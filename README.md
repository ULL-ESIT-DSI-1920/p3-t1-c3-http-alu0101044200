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

La imagen de ambos errores se puden ver en los siguientes enlace: ![Error Modulo]() ![Error funcion]()