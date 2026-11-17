# GUÍA DE CONEXIÓN E IMPORTACIÓN A GOOGLE DRIVE API
## La Casita de Nube · Nube de Fresa S.A.

Esta guía detalla los pasos para conectar el **Agente de Ingesta** con una carpeta real de Google Drive en modo de solo lectura.

---

## 1. Creación de Credenciales en Google Cloud Console

1. Entra a [Google Cloud Console](https://console.cloud.google.com/).
2. Crea o selecciona un proyecto (ej. `nube-de-fresa-rrhh`).
3. En **APIs & Services** > **Library**, busca y habilita **Google Drive API**.
4. En **APIs & Services** > **Credentials**, haz clic en **Create Credentials** > **Service Account**.
   - Nombre: `la-casita-drive-reader`
   - Rol: `Project` > `Viewer` (Solo lectura).
5. Crea una clave privada JSON para esta cuenta de servicio:
   - Haz clic en la cuenta de servicio creada > Pestaña **Keys** > **Add Key** > **Create new key** (JSON).
   - Descarga el archivo JSON con la clave privada.

---

## 2. Configuración de la Carpeta en Google Drive

1. En tu Google Drive, crea una carpeta llamada `Políticas Nube de Fresa 2026`.
2. Comparte la carpeta con el correo de la cuenta de servicio (el que termina en `@...iam.gserviceaccount.com`) otorgándole permiso de **Lector (Viewer)**.
3. Copia el **Folder ID** de la barra de direcciones de la carpeta:
   `https://drive.google.com/drive/folders/ESTE_ES_EL_FOLDER_ID`

---

## 3. Subida de los 10 Documentos Oficiales

Sube los siguientes 10 documentos a la carpeta (preparados en los formatos requeridos):
- **POL-01:** Política de Vacaciones y Feriados (Subir como **PDF**)
- **POL-02:** Política de Permisos Especiales y Licencias (Subir como **Google Doc**)
- **POL-03:** Política de Incapacidades y Salud Ocupacional (Subir como **PDF**)
- **POL-04:** Política de Jornada Laboral y Teletrabajo (Subir como **Google Doc**)
- **POL-05:** Matriz de Remuneración, Aguinaldo y Fechas de Pago (Subir como **Google Sheets**)
- **POL-06:** Beneficios Adicionales y Papelería (Subir como **Google Doc**)
- **POL-07:** Ingreso, Periodo de Prueba y Salida (Subir como **PDF**)
- **POL-08:** Evaluación de Desempeño y Crecimiento (Subir como **Google Doc**)
- **POL-09:** Código de Conducta y Prevención de Hostigamiento (Subir como **PDF**)
- **POL-10:** Privacidad y Protección de Datos Personales (Subir como **Google Doc**)

---

## 4. Configuración en `.env.local`

Coloca las credenciales en tu `.env.local`:
```env
GOOGLE_SERVICE_ACCOUNT_EMAIL="la-casita-drive-reader@nube-de-fresa.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD...-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID="ESTE_ES_EL_FOLDER_ID"
```

El Agente de Ingesta sincronizará automáticamente la carpeta utilizando `changes.list` y actualizará el cursor `startPageToken` en la base de datos.

