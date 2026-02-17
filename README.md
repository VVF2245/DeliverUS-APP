# DeliverUS-Solution

## DeliverUS

Puede encontrar la documentación de DeliverUS en: <https://github.com/IISSI2-IS>

## Introducción

Este repositorio incluye el backend completo (carpeta `DeliverUS-Backend`), el frontend de `customer` (carpeta `DeliverUS-Frontend-Customer`) el frontend de `owner` (carpeta `DeliverUS-Frontend-Owner`).

## Preparación del entorno

### a) Windows

* Abra un terminal y ejecute el comando `npm run install:all:win`.

### b) Linux/MacOS

* Abra un terminal y ejecute el comando `npm run install:all:bash`.

## Ejecución

### 1. Backend

* Para **rehacer las migraciones y seeders**, abra un terminal y ejecute el comando

    ```Bash
    npm run migrate:backend
    ```

* Para **ejecutarlo**, abra un terminal y ejecute el comando

    ```Bash
    npm run start:backend
    ```

### 2. Frontend

* Para **ejecutar la aplicación frontend de `customer`**, abra un nuevo terminal y ejecute el comando

    ```Bash
    npm run start:frontend:customer
    ```

* Para **ejecutar la aplicación frontend de `owner`**, abra un nuevo terminal y ejecute el comando

    ```Bash
    npm run start:frontend:owner
    ```

## Depuración

* Para **depurar el backend**, asegúrese de que **NO** existe una instancia en ejecución, pulse en el botón `Run and Debug` de la barra lateral, seleccione `Debug Backend` en la lista desplegable, y pulse el botón de *Play*.

* Para **depurar el frontend**, asegúrese de que **EXISTE** una instancia en ejecución del frontend que desee depurar, pulse en el botón `Run and Debug` de la barra lateral, seleccione `Debug Frontend` en la lista desplegable, y pulse el botón de *Play*.

## Test

* Para comprobar el correcto funcionamiento de backend puede ejecutar el conjunto de tests incluido a tal efecto. Para ello ejecute el siguiente comando:

    ```Bash
    npm run test:backend
    ```

Una vez complete correctamente los requisitos del backend, los tests deberían completarse satisfactoriamente.

**Advertencia: Los tests no pueden ser modificados.**
