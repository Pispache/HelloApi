# HelloApi Frontend

Frontend separado para el sistema de gestión de órdenes HelloApi.

## 🚀 Tecnologías
- HTML5, CSS3, JavaScript (Vanilla)
- Bootstrap 5.3
- Font Awesome 6.0

## 📡 Comunicación con Backend
- API REST: `http://localhost:5001/api`
- Métodos HTTP: GET, POST, PUT, DELETE
- Formato: JSON

## 🏃‍♂️ Ejecutar Frontend

### Opción 1: Servidor HTTP simple
```bash
npx http-server -p 3000 -c-1
```

### Opción 2: Live Server (desarrollo)
```bash
npx live-server --port=3000
```

### Opción 3: Docker
```bash
docker build -t helloapi-frontend .
docker run -p 3000:80 helloapi-frontend
```

## 🌐 URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001/api
- Swagger: http://localhost:5001/swagger

## 📁 Estructura
```
├── index.html          # Página principal
├── items.html          # Gestión de items
├── items.js            # Lógica de items
├── messages.html       # Gestión de mensajes
├── messages.js         # Lógica de mensajes
├── orders.html         # Lista de órdenes
├── orders.js           # Lógica de órdenes
├── orders-form.html    # Crear nueva orden
├── orders-form.js      # Lógica de formulario
├── persons.html        # Gestión de personas
├── persons.js          # Lógica de personas
├── Dockerfile          # Contenedor Docker
└── nginx.conf          # Configuración Nginx
```

## 🔧 Configuración API
Todos los archivos JS están configurados para comunicarse con:
`http://localhost:5001/api`
