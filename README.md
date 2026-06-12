# ERP Vehicular Personal

Primera version de una app simple para administrar vehiculos personales.

## Como abrirla

1. Abre la carpeta `ERP veicular` en Visual Studio Code.
2. Abre el archivo `index.html`.
3. Haz doble clic en `index.html` o usa la extension Live Server para verlo en el navegador.

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

## Sobre Git en esta carpeta

La carpeta ya fue iniciada como repositorio Git. Si Git muestra un aviso de carpeta no confiable, ejecuta una vez este comando:

```powershell
git config --global --add safe.directory "C:/Users/mzaku/Documents/ERP veicular"
```

Despues de eso podras usar comandos como `git status`, `git add .` y `git commit`.

## Proximos pasos sugeridos

1. Mejorar la edicion de vehiculos y agregar edicion de mantenciones.
2. Agregar alertas visuales mas completas para mantenciones vencidas o cercanas.
3. Pasar de `localStorage` a una base de datos.
4. Crear inicio de sesion real.
5. Convertirla en una app web moderna con React o similar.
