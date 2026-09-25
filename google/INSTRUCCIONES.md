# Cómo publicar el tablero con Google

Solo lo hace una persona, una vez: quien sea dueña de la planilla. Lleva unos 10 minutos.
Las compañeras después solo necesitan el enlace y la clave. No les hace falta una cuenta de Claude.

Planilla ya creada en tu Drive:
https://docs.google.com/spreadsheets/d/1m2qr70J5hhyp5T-v3RVoBuv9tgTLOkZTKqtuyW0Z1Io/edit

## 1. Pegar el código

1. Abrí la planilla desde una computadora y andá a **Extensiones → Apps Script**.
2. Se abre un editor con un archivo `Código.gs`. Borrá todo lo que tiene y pegá el contenido completo de **`Codigo.gs`**.
3. En la línea `const CLAVE_GRUPO = 'CAMBIAR';`, reemplazá `CAMBIAR` por la clave que les vas a pasar a tus compañeras. Por ejemplo: `const CLAVE_GRUPO = 'calidad2026';`
4. Hacé clic en el **+** junto a "Archivos", elegí **HTML** y ponele de nombre **`Index`**, exactamente así, con mayúscula y sin `.html`.
5. Borrá lo que trae ese archivo nuevo y pegá el contenido completo de **`Index.html`**.
6. Guardá con el ícono del disquete o con Ctrl+S.

## 2. Publicarlo como página web

1. Arriba a la derecha: **Implementar → Nueva implementación**.
2. En el engranaje de "Seleccionar tipo", elegí **Aplicación web**.
3. Completá así:
   - **Ejecutar como:** Yo
   - **Quién tiene acceso:** Cualquier usuario
4. Hacé clic en **Implementar** y después en **Autorizar acceso**. Elegí tu cuenta.
5. Google va a mostrar "Google no verificó esta app". Es normal, porque la app la creaste vos. Tocá **Configuración avanzada → Ir a … (no seguro) → Permitir**. Este paso lo hacés solo vos, una vez; tus compañeras no lo ven.
6. Copiá la **URL de la aplicación web** (termina en `/exec`).

## 3. Compartirlo

Mandales a tus compañeras la URL y la clave. Cada una entra, escribe su nombre y la clave, y listo:

- lo que carga cada una aparece en la pantalla de las demás en dos o tres segundos;
- arriba se ve quién está conectada, y cada campo donde otra persona está escribiendo aparece marcado con su nombre;
- todo queda guardado en la hoja **datos** de la planilla.

Sin la clave, alguien que consiga el enlace ve el formulario vacío y no puede leer ni modificar nada.

## Si más adelante hay que cambiar el código

Pegá el código nuevo, guardá y andá a **Implementar → Gestionar implementaciones → lápiz (editar) → Versión: Nueva versión → Implementar**. La URL no cambia.

Para cambiar la clave, editá la línea `CLAVE_GRUPO` y hacé lo mismo. Las compañeras van a tener que volver a escribirla.
