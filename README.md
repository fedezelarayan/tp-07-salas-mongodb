# Trabajo práctico 07 - Persistencia inicial de reservas de salas

## 1. Punto de partida y nombre de la copia

Partí de una copia funcional del TP 06 (`tp-06-salas-modular`), sin `node_modules`, `.git` ni credenciales. La copia se llama `tp-07-salas-mongodb`. La entrega anterior quedó intacta.

Se agregó un laboratorio de persistencia (configuración, conexión, modelo y programas de terminal) sin cambiar el comportamiento de la aplicación Express.

## 2. Versiones utilizadas

| Herramienta | Versión |
|---|---|
| Node.js | v24.14.0 |
| Mongoose | `^9.11.2` (rango declarado en `package.json`) |
| Express | `^5.2.1` |
| Base de datos | MongoDB Atlas, clúster `Cluster0`, nivel **Free (M0)** |

Base utilizada: `reservas_salas_u7`. Colección: `reservas`.

## 3. Instalación y preparación desde una descarga nueva

### 3.1 Instalar dependencias

```bash
npm install
```

### 3.2 Preparar Atlas

1. **Clúster:** crear (o reutilizar) un clúster gratuito **Free (M0)** en https://cloud.mongodb.com.
2. **Usuario de base de datos** (*Database Access*): crear un usuario con autenticación por contraseña y permiso de lectura y escritura. Conviene una contraseña sin caracteres reservados; si los tiene, deben ir codificados en la URI.
3. **IP permitida** (*Network Access*): agregar la IP actual (*Add Current IP Address*) y esperar a que el estado pase de *Pending* a *Active*.
4. **URI de conexión:** en *Database → Connect → Drivers → Node.js*, copiar la cadena `mongodb+srv://...`, reemplazar la contraseña y agregar el nombre de la base `reservas_salas_u7` entre `/` y `?`, conservando las opciones que ofrece Atlas.

No hace falta crear la base ni la colección a mano: MongoDB las crea cuando se guarda el primer documento.

### 3.3 Variables de entorno

```bash
copy .env.example .env
```

Luego editar `.env` y reemplazar `USUARIO`, `CLAVE` y `HOST` por los datos reales. `.env` está en `.gitignore`; `.env.example` se versiona con marcadores:

```dotenv
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://USUARIO:CLAVE@HOST/reservas_salas_u7?retryWrites=true&w=majority
```

## 4. Comandos y diagnóstico DNS

### Comandos (desde la raíz)

| Acción | Comando |
|---|---|
| Comprobar conexión | `node --env-file=.env scripts/comprobar-conexion.js` |
| Crear una reserva | `node --env-file=.env scripts/crear-reserva.js` |
| Listar reservas | `node --env-file=.env scripts/listar-reservas.js` |
| Formatear | `npm run format` |
| Verificar calidad | `npm run check` |
| Arrancar el sitio web | `npm start` |

### Resolutores DNS

En `src/config/base-datos.js` se configura `dns.setServers(["8.8.8.8", "1.1.1.1"])` antes de conectar. Está en un solo lugar: no se repite en los scripts ni en el modelo. Afecta solo la resolución DNS de Node (consultas SRV/TXT de Atlas), no el sistema operativo, la autenticación ni la lista de IPs.

### Diagnóstico real

- **No ocurrió ningún fallo DNS.**
- **Primer intento de conexión:** falló con `MongooseServerSelectionError`, sin código ni error DNS. El script lo clasificó como "servidor o red".
- **Causa:** en *Network Access* de Atlas, mi IP figuraba en estado *Pending*, por lo que todavía no tenía permiso.
- **Solución:** esperar a que el estado pasara a *Active*. Al repetir, la conexión fue exitosa.

## 5. Mapa de archivos, esquema, modelo y colección

| Archivo | Responsabilidad |
|---|---|
| `src/config/entorno.js` | `cargarConfiguracion` (PORT y NODE_ENV, usada por el sitio) y `leerUriMongo` (usada solo por los scripts) |
| `src/config/base-datos.js` | Configura DNS y expone `conectar` y `desconectar` |
| `src/modelos/reserva.js` | Esquema y modelo `Reserva` |
| `scripts/comprobar-conexion.js` | Prueba la conexión y diagnostica fallos sin crear documentos |
| `scripts/crear-reserva.js` | Crea una reserva válida por ejecución |
| `scripts/listar-reservas.js` | Lista todas las reservas y la cantidad |
| `src/index.js`, `src/app.js`, `src/rutas/`, `src/controladores/`, `src/servicios/`, `src/middleware/`, `views/`, `public/` | Sitio del TP 06, sin cambios funcionales |

`src/configuracion.js` fue reemplazado por `src/config/entorno.js` y se actualizó el `require` de `src/index.js`. El sitio no exige `MONGODB_URI` para arrancar.

- El **esquema** (`reservaSchema`) describe los campos y las reglas que debe cumplir un documento.
- El **modelo** (`Reserva`) es la herramienta de Mongoose, construida a partir del esquema, para crear, validar y consultar documentos.
- La **colección** (`reservas`) es donde MongoDB guarda los documentos. Está asociada de forma explícita con `{ collection: "reservas" }`.

## 6. Campos y reglas

| Campo | Tipo | Regla |
|---|---|---|
| `estudiante` | String | Obligatorio, `trim` |
| `email` | String | Obligatorio, `trim`, `match: /@/` |
| `sala` | String | Obligatoria, `enum`: Sala Norte, Sala Sur, Sala Multimedia |
| `fecha` | String | Obligatoria, `trim` (no vacía tras `trim`) |
| `turno` | String | Obligatorio, `enum`: Mañana, Tarde, Noche |
| `personas` | Number | Obligatorio, `min: 1`, `max: 6`, `validate` con `Number.isInteger` |

**Límites que todavía no se controlan:** validación completa de email, fechas imposibles o pasadas, solapamientos de salas y turnos, cupos compartidos y reservas repetidas. Tampoco hay índice único.

**Sobre el `_id`:** se usa el `ObjectId` que genera Mongoose, convertido a texto solo al mostrarlo (`toString()`). No se generan IDs consecutivos.

**Por qué un `_id` asignado a un objeto no demuestra una escritura:** Mongoose genera el `_id` en memoria apenas se ejecuta `new Reserva(...)`, antes de comunicarse con la base. La escritura solo está confirmada cuando `await reserva.save()` termina sin error, por eso el mensaje de éxito se imprime después de guardar.

**Ejecuciones repetidas:** ejecutar dos veces `crear-reserva.js` genera dos documentos distintos con los mismos campos, porque cada uno recibe un `_id` propio y no hay restricción de unicidad. Es una conducta esperada en este TP y no se oculta borrando registros.

## 7. Pruebas y evidencia de persistencia

### Evidencia de persistencia entre procesos

Misma base `reservas_salas_u7`, cada paso en un proceso de Node.js distinto:

1. **Listado inicial:**
   ```
   Reservas recuperadas: 0
   ```
2. **Creación:**
   ```
   Reserva guardada correctamente.
     _id: 6ae614f908b562f2d60348d2
     Ana Ficticia - Sala Norte - 2026-11-10 - Tarde - 3 personas
   ```
3. **Listado en un proceso nuevo** (mismo `_id`, la cantidad creció en uno):
   ```
   Reservas recuperadas: 1
     6ae614f908b562f2d60348d2 | Ana Ficticia | Sala Norte | 2026-11-10 | Tarde | 3 personas
   ```
4. **Tercer listado, sin otras escrituras:** la cantidad permaneció en 1.
   ```
   Reservas recuperadas: 1
   ```

**Documento en Data Explorer de Atlas** (base `reservas_salas_u7`, colección `reservas`):

```js
{
  _id: ObjectId('6ae614f908b562f2d60348d2'),
  estudiante: 'Ana Ficticia',
  email: 'ana.ficticia@example.com',
  sala: 'Sala Norte',
  fecha: '2026-11-10',
  turno: 'Tarde',
  personas: NumberInt('3'),
  __v: NumberInt('0')
}
```

![Data Explorer de Atlas](docs/data-explorer.png)

### Matriz de pruebas

Cantidad = reservas recuperadas por `listar-reservas.js`.

| Caso | Resultado esperado | Resultado observado | Cantidad antes → después |
|---|---|---|---|
| Conexión válida | Confirmación y proceso terminado | `Conexión exitosa a la base "reservas_salas_u7".` | — |
| Fallo DNS | Registrar código y operación | No ocurrió | — |
| Primer fallo de conexión | — | `MongooseServerSelectionError`: IP en *Pending*; resuelto al pasar a *Active* | — |
| Variable vacía | Fallo de configuración, sin éxito | PENDIENTE | — |
| Contraseña incorrecta (en `.env`) | Fallo de autenticación, sin crear documentos | PENDIENTE | PENDIENTE |
| Colección vacía | Listado con cantidad 0 | `Reservas recuperadas: 0` (base nueva) | 0 → 0 |
| Reserva válida | Se guarda y devuelve `_id` | `_id: 6ae614f908b562f2d60348d2` | 0 → 1 |
| Consulta desde proceso nuevo | Recupera ese `_id` | Recuperado | 1 → 1 |
| Segunda consulta | No agrega registros | Cantidad igual | 1 → 1 |
| Estudiante vacío | Rechazo, cantidad sin cambios | PENDIENTE | PENDIENTE |
| Email sin `@` | Rechazo, cantidad sin cambios | PENDIENTE | PENDIENTE |
| Sala no permitida | Rechazo, cantidad sin cambios | PENDIENTE | PENDIENTE |
| Turno no permitido | Rechazo, cantidad sin cambios | PENDIENTE | PENDIENTE |
| Fecha vacía | Rechazo, cantidad sin cambios | PENDIENTE | PENDIENTE |
| Personas 0 | Rechazo, cantidad sin cambios | PENDIENTE | PENDIENTE |
| Personas 7 | Rechazo, cantidad sin cambios | PENDIENTE | PENDIENTE |
| Personas 2.5 | Rechazo, cantidad sin cambios | PENDIENTE | PENDIENTE |
| Personas con texto no numérico | Rechazo de conversión, sin escritura | PENDIENTE | PENDIENTE |

Para las pruebas inválidas se modifica temporalmente un campo del objeto de `crear-reserva.js` y se restaura al terminar. No se borran datos.

### Continuidad del sitio (`npm start`)

| Caso | Resultado |
|---|---|
| `GET /` | 200 |
| `GET /estado` | 200, `{"servicio":"activo","reservas":4,"solicitudId":"BIB-0008"}` |
| `GET /reservas` | 200 |
| `GET /css/estilos.css` | 200 |
| `GET /url-inexistente` | 404 |
| POST inválido | 400, no crea |
| POST válido | 302 |
| `GET /estado` después del POST válido | 200, `{"servicio":"activo","reservas":5,"solicitudId":"BIB-0014"}` |

El POST válido crea la reserva solo en memoria (4 → 5). `/estado` cuenta las reservas del servicio en memoria, no las de MongoDB, y las reservas del laboratorio no aparecen en las vistas.

### Calidad

```bash
npm run format
npm run check
```

Resultado: Prettier sin diferencias y ESLint sin errores sobre `src` y `scripts`. No se modificaron las reglas de calidad.

## 8. Por qué el sitio continúa en memoria

En este TP la persistencia se probó de forma separada, con programas de terminal. El servicio HTTP sigue guardando las reservas en un arreglo en memoria, y los controladores trabajan de forma síncrona. Migrarlos implicaría que servicio y controladores usen promesas (`async/await`), y eso queda fuera del alcance de este TP.

Por eso las reservas creadas desde el formulario web se pierden al reiniciar el servidor, y las creadas con `crear-reserva.js` no se ven en el sitio.

En la unidad 8 se abordará conectar el servicio y los controladores del sitio a MongoDB mediante Mongoose, para que el formulario y los listados usen la base.

## 9. Seguridad

No se publican `.env`, credenciales ni datos personales. `.env` está excluido por `.gitignore` y solo se versiona `.env.example`, que usa marcadores. Todos los datos de las reservas son ficticios. Los scripts no imprimen la URI ni mensajes completos del driver.