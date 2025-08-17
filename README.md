# Guía paso a paso – HelloApi (.NET 8 + SQL Server en Docker)

Esta guía documenta cómo preparar el entorno, configurar la base de datos, ejecutar la API, crear migraciones, probar endpoints y conectarse desde TablePlus. Puedes copiar este contenido a un archivo de Word si lo necesitas.

---

## 1) Requisitos
- .NET 8 SDK (ARM64 para Mac M1/M2/M3)
- Docker Desktop
- (Opcional) TablePlus o Azure Data Studio para ver la BD

---

## 2) Levantar SQL Server en Docker
1. Crear contenedor (ejemplo con contraseña `YourStrongPassword123`):
   ```bash
   docker run -d -e ACCEPT_EULA=Y -e MSSQL_SA_PASSWORD=YourStrongPassword123 \
     -p 1433:1433 --name sqlserver mcr.microsoft.com/mssql/server:2022-latest
   ```
2. Verificar que corre:
   ```bash
   docker ps
   ```

---

## 3) Configurar la cadena de conexión
Editar `appsettings.json` en la raíz del proyecto para apuntar al SQL Server del contenedor:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=MessageDb;User Id=sa;Password=YourStrongPassword123;TrustServerCertificate=True;"
  },
  "AllowedOrigins": [
    "http://localhost:3000",
    "https://myfrontend.com"
  ]
}
```

El proyecto lee esta cadena en `Program.cs` al registrar `DbContext`:
```csharp
// Program.cs
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
```

---

## 4) Migraciones de Entity Framework Core
1. Instalar herramientas EF (si hace falta):
   ```bash
   dotnet tool install --global dotnet-ef
   ```
2. Crear una migración (si aún no existe o quieres una nueva):
   ```bash
   dotnet ef migrations add InitialCreate
   # o
   dotnet ef migrations add NombreDeTuMigracion
   ```
3. Aplicar migraciones a la base de datos:
   ```bash
   dotnet ef database update
   ```

Estructura resultante (ejemplo) en la base `MessageDb`:
- Tabla `Messages` con columnas: `Id`, `MessageText`, `CreatedAt`, `UpdatedAt`.
- Tabla `__EFMigrationsHistory`.

---

## 5) Ejecutar la API
Desde la carpeta del proyecto:
```bash
dotnet run
```
Observa en consola los puertos (típicamente `http://localhost:5000` y `https://localhost:5001`).

Swagger UI:
- http://localhost:5000/swagger
- https://localhost:5001/swagger

---

## 6) Endpoints principales
Controlador: `Controllers/MessageController.cs`
- `GET    /api/Message` – Lista todos los mensajes
- `GET    /api/Message/{id}` – Obtiene un mensaje por id
- `POST   /api/Message` – Crea un mensaje
- `PUT    /api/Message/{id}` – Actualiza un mensaje
- `DELETE /api/Message/{id}` – Elimina un mensaje

DTO para crear: `Models/DTOs/MessageCreateDto.cs`
```csharp
public class MessageCreateDto
{
    public string Message { get; set; } = string.Empty;
}
```

---

## 7) Probar guardado de datos

### Opción A: Swagger (recomendado)
1. Abrir Swagger UI.
2. Elegir `POST /api/Message` → `Try it out`.
3. Enviar body:
   ```json
   {
     "message": "Hola, este es un mensaje de prueba"
   }
   ```
4. Recibirás `201 Created` con el JSON del recurso creado.

### Opción B: Curl
- HTTP:
  ```bash
  curl -X POST "http://localhost:5000/api/Message" \
    -H "Content-Type: application/json" \
    -d '{"message":"Hola, este es un mensaje de prueba"}'
  ```
- HTTPS (si hay advertencia de certificado, agrega `-k`):
  ```bash
  curl -k -X POST "https://localhost:5001/api/Message" \
    -H "Content-Type: application/json" \
    -d '{"message":"Hola, este es un mensaje de prueba"}'
  ```

### Consultar datos
```bash
curl "http://localhost:5000/api/Message"
# o
curl -k "https://localhost:5001/api/Message"
```
