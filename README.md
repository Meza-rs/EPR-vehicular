# ERP Vehicular Personal

Primera version de una app simple para administrar vehiculos personales.

## Como abrirla

1. Abre la carpeta `ERP veicular` en Visual Studio Code.
2. Instala las dependencias con `npm install`.
3. Ejecuta `npm run dev` y abre la URL que muestra Vite.

Abrir `index.html` directo sirve solo para una prueba simple. Para probar el modo instalable, el service worker y la futura APK, usa Vite.

## Como ejecutarla como app web moderna

1. Instala dependencias:

```powershell
npm install
```

2. Levanta el servidor local:

```powershell
npm run dev
```

3. Para crear una version publicable:

```powershell
npm run build
```

La carpeta de salida sera `dist`.

## Que hace esta version

- Crea una cuenta local con nombre, correo y password.
- Permite iniciar y cerrar sesion.
- Organiza la app en pestañas superiores: Perfil, Vehiculos y Mantenciones.
- En Vehiculos separa Principal, Crear vehiculo e Historico.
- Ingresa vehiculos personales: auto, moto, camioneta u otro.
- Al crear un auto, camioneta o moto propone un plan de mantenciones editable.
- Permite seleccionar todas o solo algunas mantenciones, cambiar su periodicidad y prioridad, quitar recomendaciones y agregar mantenciones personalizadas.
- Desde el resumen de cada vehiculo permite abrir y modificar su plan de mantencion.
- En el editor del plan se pueden cambiar nombres, periodicidad y prioridad, eliminar o crear tareas y guardar notas tecnicas para cada una.
- Las notas del plan aparecen al registrar trabajos y se copian al historial de la mantencion realizada.
- Antes de eliminar un vehiculo, una tarea del plan o limpiar todos los datos, la app muestra una confirmacion con la informacion que se perdera.
- Permite exportar todos los datos de la cuenta activa a un respaldo JSON versionado.
- Permite cargar un respaldo JSON validado, con confirmacion antes de reemplazar los datos actuales.
- Edita datos basicos de cada vehiculo.
- Registra kilometraje por vehiculo.
- En Vehiculos > Principal muestra el resumen del vehiculo seleccionado en el actualizador de kilometraje.
- Permite tomar o cargar una foto del tablero para detectar kilometraje con OCR local y confirmar antes de guardar.
- Registra mantenciones con fecha, kilometraje realizado, proximo kilometraje, costo y notas.
- En Mantenciones muestra el plan del vehiculo ordenado por kilometros restantes y prioridad.
- Permite marcar varias tareas realizadas y guardarlas juntas como una sola carga de taller.
- Los kilometros faltantes se calculan usando el kilometraje actual registrado en Vehiculos.
- El kilometraje de la visita al taller no modifica automaticamente el kilometraje actual del vehiculo.
- Cada tarea permite editar su proximo kilometraje, sugerido como kilometraje realizado mas periodicidad.
- Actualiza en conjunto el historial y el proximo vencimiento de cada tarea seleccionada.
- Muestra cuantos kilometros faltan para la proxima mantencion.
- Muestra solo las ultimas 3 mantenciones en el resumen de cada vehiculo.
- Incluye una vista Historico dentro de Vehiculos para seleccionar un vehiculo y ver todos sus registros.
- Permite filtrar el historial por tipo de mantencion.
- Separa los vehiculos por usuario dentro del navegador usando `localStorage`.

Los intervalos preestablecidos son orientativos. El manual del fabricante y las condiciones de uso del vehiculo tienen prioridad.

Importante: esta version es para aprender y probar el flujo. Para una app real con varios usuarios, passwords seguras y acceso desde distintos dispositivos, necesitaremos conectar una base de datos y autenticacion real.

## Herramientas recomendadas para aprender

- Visual Studio Code: editor donde escribiremos el codigo.
- Git: guarda el historial de cambios del proyecto en tu computador.
- GitHub: respaldo online del proyecto y forma de compartir avances.
- Live Server: extension de VS Code para abrir la app rapidamente mientras editas.
- Supabase o Firebase: opciones simples para agregar base de datos, usuarios y login real mas adelante.
- Android Studio: necesario cuando queramos generar una APK real con Capacitor.

## Sobre Git en esta carpeta

La carpeta ya fue iniciada como repositorio Git. Si Git muestra un aviso de carpeta no confiable, ejecuta una vez este comando:

```powershell
git config --global --add safe.directory "C:/Users/mzaku/Documents/ERP veicular"
```

Despues de eso podras usar comandos como `git status`, `git add .` y `git commit`.

## Proximos pasos sugeridos

1. Probar la version PWA compilada con `npm run build` y `npm run preview`.
2. Mejorar alertas visuales para mantenciones vencidas o cercanas.
3. Pasar de `localStorage` a Supabase para sincronizar PC y telefono.
4. Reemplazar el login local por inicio de sesion real.
5. Generar una APK de prueba con Capacitor cuando la version web este estable.

## Lanzamiento web, PWA y APK

La base PWA ya esta agregada con `public/manifest.webmanifest`, `public/sw.js`, icono y configuracion de Vite.

Para la ruta completa de publicacion, Supabase y APK revisa:

```text
docs/lanzamiento.md
```
