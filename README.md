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
- Edita datos basicos de cada vehiculo.
- Registra kilometraje por vehiculo.
- En Vehiculos > Principal muestra el resumen del vehiculo seleccionado en el actualizador de kilometraje.
- Registra mantenciones con fecha, kilometraje realizado, proximo kilometraje, costo y notas.
- Muestra cuantos kilometros faltan para la proxima mantencion.
- Muestra solo las ultimas 3 mantenciones en el resumen de cada vehiculo.
- Incluye una vista Historico dentro de Vehiculos para seleccionar un vehiculo y ver todos sus registros.
- Separa los vehiculos por usuario dentro del navegador usando `localStorage`.

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
