# 🥖 Panadería — App de pedidos a domicilio

Web app para administrar una panadería casera con entrega a domicilio:

- **Tienda pública**: catálogo de productos con foto, descripción y precio; carrito y checkout con datos de entrega (sin necesidad de cuenta).
- **Panel de administración** (con sesión de Firebase): pedidos con estados (nuevo → preparando → en camino → entregado), catálogo de productos con fotos, configuración del negocio (logo, datos, horarios, página web, costo de envío) y alta de usuarios.
- Diseño responsivo, optimizado para móvil y escritorio.

**Tecnología:** React + Vite + Tailwind CSS + Firebase (Authentication y Firestore). Las fotos se comprimen en el navegador y se guardan en Firestore, por lo que **no se necesita Firebase Storage ni plan de pago** — todo funciona con el plan gratuito (Spark).

## Configuración inicial (una sola vez)

### 1. Crear el proyecto de Firebase

1. Entra a [console.firebase.google.com](https://console.firebase.google.com) y crea un proyecto (ej. `mi-panaderia`).
2. **Authentication** → Comenzar → habilita **Correo electrónico/contraseña**.
3. En **Authentication → Users → Agregar usuario**, crea tu cuenta de administrador (tu correo y contraseña). *La primera cuenta que inicie sesión en la app se convierte automáticamente en administrador.*
4. **Firestore Database** → Crear base de datos → modo producción → elige la región más cercana.
5. En **Firestore → Reglas**, pega el contenido del archivo [`firestore.rules`](firestore.rules) de este proyecto y publica.

### 2. Conectar la app

1. En la consola: ⚙️ **Configuración del proyecto → Tus apps → Agregar app → Web** (`</>`). Regístrala (no hace falta hosting) y copia los valores de `firebaseConfig`.
2. En esta carpeta, copia `.env.example` a `.env.local` y pega cada valor.

### 3. Ejecutar

```bash
npm install
npm run dev
```

Abre http://localhost:5173 — la tienda pública está en `/`, el panel en `/admin` (o el enlace "Acceso al panel" al pie de la tienda).

## Uso diario

- **Productos**: panel → Productos → "+ Nuevo producto" (foto, nombre, descripción, precio). Todo producto visible aparece al instante en la tienda.
- **Pedidos**: los clientes hacen checkout en la tienda y el pedido aparece en el panel en tiempo real; ahí cambias su estado o lo eliminas.
- **Negocio**: logo, nombre, eslogan, teléfono, WhatsApp, dirección, página web, costo de envío y horarios.
- **Usuarios**: el administrador da de alta cuentas (rol Colaborador o Administrador) sin salir de su sesión.

## Correo automático de confirmación (EmailJS)

Al colocar un pedido, el cliente recibe un correo de confirmación. Esto usa [EmailJS](https://www.emailjs.com) (gratis hasta 200 correos/mes):

1. Crea una cuenta en emailjs.com y conecta tu correo (**Email Services → Add New Service** → Gmail u otro).
2. Crea una plantilla (**Email Templates → Create New Template**) usando las variables `{{to_email}}` (campo "To Email"), `{{customer_name}}`, `{{order_id}}`, `{{items}}`, `{{subtotal}}`, `{{delivery_fee}}`, `{{total}}`, `{{address}}`, `{{business_name}}`, `{{business_phone}}`.
3. Copia el **Service ID**, **Template ID** y **Public Key** (Account → General) en `.env.local` y en los secrets del repositorio de GitHub (`VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`).

Si estas variables no están configuradas, los pedidos funcionan normalmente, solo no se envía el correo.

## Publicar en internet

Cuando quieras ponerla en línea, la forma más simple es Firebase Hosting o Vercel/Netlify:

```bash
npm run build
```

y sube la carpeta `dist/`. (Configura las mismas variables de entorno en el hosting.)
