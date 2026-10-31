# -tp-07-salas-mongodb


Las primeras pruebas de conexión a la base de datos fueron exitosas:

PS E:\Diplomatura\-tp-07-salas-mongodb> node --env-file=.env scripts/comprobar-conexion.js
Conexión exitosa a la base "reservas_salas_u7".

Al ejecutar listar reservas:

PS E:\Diplomatura\-tp-07-salas-mongodb> node --env-file=.env scripts/listar-reservas.js
Reservas recuperadas: 0

Crear reservas:

PS E:\Diplomatura\-tp-07-salas-mongodb> node --env-file=.env scripts/crear-reserva.js
Reserva guardada correctamente.
  _id: 6ae614f908b562f2d60348d2
  Ana Ficticia - Sala Norte - 2026-11-10 - Tarde - 3 personas

Listar reservas nuevamente:

PS E:\Diplomatura\-tp-07-salas-mongodb> node --env-file=.env scripts/listar-reservas.js
Reservas recuperadas: 1
  6ae614f908b562f2d60348d2 | Ana Ficticia | Sala Norte | 2026-11-10 | Tarde | 3 personas

En data explorer de mongo db atlas se creó:

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


comprobaciones con codigos de estado:

curl.exe -s -o NUL -w "GET /  -> %{http_code}\n" http://localhost:3000/
GET /  -> 200

curl.exe -s http://localhost:3000/estado
{"servicio":"activo","reservas":4,"solicitudId":"BIB-0008"}

curl.exe -s -o NUL -w "GET /reservas -> %{http_code}\n" http://localhost:3000/reservas
GET /reservas -> 200

curl.exe -s -o NUL -w "GET /css/estilos.css -> %{http_code}\n" http://localhost:3000/css/estilos.css
GET /css/estilos.css -> 200

curl.exe -s -o NUL -w "GET /url-inexistente -> %{http_code}\n" http://localhost:3000/url-inexistente
GET /url-inexistente -> 404

curl.exe -s -o NUL -w "POST inválido -> %{http_code}\n" -X POST http://localhost:3000/reservas -d "estudiante=&email=&sala=&fecha=&turno=&personas="
POST inválido -> 400

curl.exe -s -o NUL -w "POST válido -> %{http_code}\n" -X POST http://localhost:3000/reservas -d "estudiante=Ana&email=ana@mail.com&sala=Sala Norte&fecha=2026-10-01&turno=Tarde&personas=3"
POST válido -> 302

curl.exe -s http://localhost:3000/estado
{"servicio":"activo","reservas":5,"solicitudId":"BIB-0014"}