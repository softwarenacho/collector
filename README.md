# Coleccionista webApp
#### Para álbum 'Copa del Mundo Panini 2018' ®

###### AngularJS con el objetivo de convertirse en una aplicación progresiva, probada y funcionada en Web, iOS y Android.

Usando una estructura similar a la estructura del álbum físico con clasificación por página, grupo y equipo, con interfaces orientadas a la usabilidad, usando la paleta de colores oficiales, y el mínimo de elementos visibles a la vez manteniendo la aplicación en una página

**v.5 (2018-05-20)** El primer avance consiste en marcar el diseño, la estructura, la primera arquitectura, y la mínima funcionalidad, logrando lo siguiente:
  - Se ejecuta un guardado local para preservar las cartas
  - ![Primer avance](imgs/180520.png)

**v.5.1 (2018-05-20)** Se presenta la funcionalidad de duplicados que fue casi completa en el commmit anterior pues su estructura ya estaba realizada en el diseño de las clases
  - Ajustes visuales al diseño anterior, se agregan ambas funcionalidades
  - Los duplicados ya estaban considerados en la versión anterior del controlador, funcionaron
  - ![Mis 7 biglias](imgs/180520-dups.png)

**v.5.2 (2018-05-21)** Agregada toolbar con las siguientes opciones: Ayuda, Compartir, Filtro, también se agregan las siguientes estadisticas: Marcadas, Faltantes, Repetidas
  - ![toolbar](imgs/180521-t.png)
  - Caja de filtros (Marcadas, Repetidas, Faltantes):
  - ![filters](imgs/180521-f.png)
  - Lógica de filtrado que oculta/desoculta las cartas/grupos dependiendo de su activación, aún no funciona con combinaciones complejas.
  - ![filters](imgs/180521-fw.png)
  - Las repetidas no pueden ser negativas

### To do:

- Publicar versión del primer commit
-  **v.5.2** ~~Mostrar información de totales ( cartas marcadas, restantes,  repetidas, totales )~~ No se agregó totales
- **v.5.1** ~~DUPLICADOS: Visualizar (hay un avance oculto con declaración de intencions en el primer commit) y funcionalidades ( agregar quitar ...)~
  - ![duplicados en primer avance](imgs/180520-d.png)
- Conexión a DB para preservar la información local y expandir las funcionalidades online
- Agregar tutorial con el funcionamiento básico de la app
- **v.5.2** ~~Barra inferior de herramientas con las siguientes funcionalidades~~
  - Compartir lista con amigo por código ( comparar: diferencias generales, repetidas que no tengo, viceversa )
  - **v.5.2** ~~Filtrados rápidos a la lista ( pais, pag, marcadas, desmarcadas . . . )~~ No se agregó filtro por país
  - Ayuda que muestra el modal de tutorial
- Modos de visualización ( minima sin paises, sólo numerados, lista con detalles)
- Usuarios para ampliar la opciones de compartir
- Implementar manifiesto y service workers
- Busqueda rápida con resultados visuales


### Bugs:

- Doble click en mobile
- **v.5.2** ~~Repetidas se pueden llevar a menos de 0~~
