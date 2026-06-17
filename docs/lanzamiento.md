# Ruta de lanzamiento

## 1. Probar como PWA web

1. Instalar dependencias:

```powershell
npm install
```

2. Ejecutar en desarrollo:

```powershell
npm run dev
```

3. Abrir la URL que muestra Vite desde el PC o desde el telefono en la misma red. La base PWA vive en `public/`, por eso Vite es la forma recomendada de probarla.

4. Construir version publicable:

```powershell
npm run build
```

5. Revisar build local:

```powershell
npm run preview
```

## 2. Publicar web

Subir el proyecto a Vercel, Netlify o GitHub Pages usando el comando de build `npm run build` y carpeta de salida `dist`. Para GitHub Pages puede hacer falta configurar la ruta base si se publica dentro de un subdirectorio.

## 3. Preparar Supabase

1. Crear proyecto en Supabase.
2. Copiar `.env.example` a `.env`.
3. Completar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
4. Ejecutar `supabase/schema.sql` en SQL Editor.
5. Migrar datos desde JSON exportado o desde localStorage.

## 4. Crear APK de prueba

1. Instalar Android Studio.
2. Instalar dependencias Capacitor:

```powershell
npm run android:init
npm run android:add
```

3. Sincronizar web con Android:

```powershell
npm run android:sync
```

4. Abrir Android Studio:

```powershell
npm run android:open
```

Desde Android Studio se genera el APK de prueba.

## Nota importante

La app actual sigue usando `localStorage`. La PWA y el APK funcionaran para pruebas, pero para tener los mismos datos en PC y telefono se debe conectar Supabase.
