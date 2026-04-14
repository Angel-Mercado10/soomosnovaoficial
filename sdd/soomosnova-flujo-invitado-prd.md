# PRD 2.1 — Flujo del Invitado · SoomosNova v1.0

**Versión:** 1.0  
**Fecha:** Abril 2026  
**Documento:** 2.1 — Flujo del Invitado  
**Siguiente documento:** 2.2 — Arquitectura Técnica  

---

## Objetivo del documento

Describir la experiencia completa de un invitado desde que recibe la notificación hasta que contribuye al álbum permanente. Este es el flujo crítico de la demo — es el momento "wow" para el prospecto (la pareja) porque muestra el sistema desde el lado que ellos no van a operar pero que define la percepción de su boda.

---

## Actores involucrados

**Invitado**  
Usuario final del flujo. No tiene cuenta. No necesita app. Opera desde su teléfono con el navegador nativo.

**Pareja**  
Quien configura el evento y aprueba el envío. No participa activamente en este flujo pero ve sus efectos en tiempo real en el dashboard.

**Sistema**  
SoomosNova ejecutando la lógica de negocio, validaciones y automatizaciones.

---

## Mapa de estados del invitado

```
pendiente_envío → enviado → vista → confirmado
                                  → rechazó
                                  → pendiente_decisión
                                        ↓
                                  ingresó_evento
                                        ↓
                                  contribuyó_álbum
```

Este mapa alimenta directamente el modelo de datos (documento 2.3) y el dashboard de la pareja.

---

## Fase 1 — Recepción de la invitación

**Trigger:** La pareja aprueba el envío desde el dashboard. El sistema dispara el workflow de automatización (Make / n8n).

**Canal principal:** WhatsApp (Twilio o WhatsApp Business API).  
**Canal secundario:** Email como fallback si el número no tiene WhatsApp activo.

### Mensaje recibido por el invitado

```
Hola [Nombre] 👋

[Nombre Pareja 1] y [Nombre Pareja 2] te invitan a su boda.

📅 [Fecha]
📍 [Lugar]

Tu invitación personal: [URL única]

¡Nos encantaría contarte con tu presencia! 🥂
```

### URL única por invitado

Formato: `soomosnova.com/i/[token-único]`

El token mapea al registro del invitado en la base de datos. No se puede reutilizar en otro dispositivo sin validación — esto previene la transferencia de QR.

---

## Fase 2 — Apertura de la invitación

**Entrada:** Invitado toca el link en WhatsApp.

**Principio de diseño:** Página web en el navegador del teléfono. Sin login. Sin descarga. Sin fricción.

**Estado del sistema al abrir:** El sistema registra `estado: vista` con `timestamp`. La pareja puede verlo en el dashboard en tiempo real.

### Contenido de la invitación digital

1. Animación de apertura (Framer Motion) — consistente con el estilo de la boda configurado por la pareja.
2. Nombres de la pareja — tipografía serif, tamaño dominante.
3. Fecha, hora y lugar del evento.
4. Botón primario: **"Confirmar asistencia"** → lleva a `/rsvp/[token]`.
5. Botón secundario: **"Ver detalles del evento"** → lleva al microsite de la boda.
6. QR del invitado visible en la parte inferior — para guardar screenshot o mostrar el día del evento.

---

## Fase 3 — RSVP

**Entrada:** Invitado toca "Confirmar asistencia".

**Ruta:** `/rsvp/[token]`

**Principio de diseño:** Máximo tres preguntas. Sin formularios largos.

### Campos del formulario

| Campo | Tipo | Obligatorio |
|---|---|---|
| ¿Asistirás? | Sí / No / Tal vez | Sí |
| Opción de menú | Pollo / Res / Vegetariano | Solo si responde Sí |
| ¿Llevas acompañante? | Sí / No | Condicional según configuración del evento |

### Flujos por respuesta

**Confirma → Sí**  
Sistema actualiza estado a `confirmado`. Guarda selección de menú. Muestra pantalla de confirmación con QR descargable. Dispara mensaje de confirmación por WhatsApp.

**Confirma → No**  
Sistema actualiza estado a `rechazó`. Muestra mensaje de agradecimiento. No se envían recordatorios posteriores.

**Confirma → Tal vez**  
Sistema actualiza estado a `pendiente_decisión`. Se envía recordatorio automático a los 3 y 7 días.

**No responde en 7 días**  
Sistema mantiene estado `pendiente`. La pareja puede ver la lista de pendientes en el dashboard y decide si mandar recordatorio manual.

### Mensaje de confirmación automático (post-RSVP positivo)

```
¡Confirmado! 🎉

Te esperamos el [fecha] en [lugar].

Guarda tu acceso QR — lo necesitarás a la entrada:
[URL de la invitación con QR]

Nos vemos pronto 🥂
— [Nombre Pareja 1] y [Nombre Pareja 2]
```

**Efecto en dashboard:** El contador de confirmados se actualiza en tiempo real vía Supabase Realtime. La pareja recibe push notification o email de confirmación.

---

## Fase 4 — Día del evento: acceso QR

**Contexto:** El invitado llega al venue. El personal tiene un smartphone con la PWA de escaneo abierta en `/acceso/[id-evento]`. Sin app nativa requerida.

### Flujo del invitado en puerta

1. Invitado presenta su QR — screenshot en galería o link de invitación abierto directamente.
2. Personal del venue escanea el QR con la cámara de la PWA.
3. Sistema valida en tiempo real contra la base de datos.

### Respuestas del sistema al escanear

| Escenario | Visual | Sonido | Acción del sistema |
|---|---|---|---|
| QR válido, primera vez | Verde ✅ + nombre del invitado | Beep positivo | Registra ingreso con timestamp |
| QR ya escaneado | Naranja ⚠️ + "Ya ingresó a las [hora]" | Beep de alerta | No registra. Personal decide si deja pasar |
| QR inválido o no encontrado | Rojo ❌ + "No encontrado" | Beep negativo | No registra. Personal gestiona excepción |
| Invitado sin confirmar | Amarillo 🟡 + nombre + "Sin confirmar" | Beep neutral | Personal decide si permite acceso |

### Caso de excepción — invitado sin QR

El personal puede buscar por nombre en la PWA (`/acceso/[id-evento]/buscar`). Si el invitado existe en la lista, el personal puede generar un acceso de excepción manualmente.

---

## Fase 5 — Álbum compartido

**Acceso:** Desde la invitación original o desde un link publicado en el microsite del evento.  
**Rutas posibles:** `/album/[slug-boda]` o `/recuerdo/[slug-boda]`

**Principio de diseño:** Sin login. Sin descarga. Entrada directa.

### Acciones disponibles para el invitado

1. **Ver el álbum** — galería masonry con fotos de todos los invitados, actualizadas en tiempo real.
2. **Subir foto o video** — desde la galería del teléfono. Límite: 50MB por archivo. Formatos: JPG, PNG, MP4, MOV.
3. **Escribir dedicatoria** — texto libre. Se guarda con nombre del invitado y timestamp.
4. **Dibujar a mano** — canvas táctil. Se guarda como PNG.

### Flujo de subida de foto

```
Invitado toca "Agregar al álbum"
→ Sistema pide permiso de galería (estándar del navegador)
→ Invitado selecciona foto
→ Preview antes de publicar
→ Invitado toca "Publicar"
→ Upload a Cloudinary o Supabase Storage
→ Foto aparece en el álbum en tiempo real (< 5 segundos)
→ Notificación discreta: "Tu foto ya está en el álbum 🎉"
```

### Moderación

La pareja puede ocultar o eliminar contribuciones desde el dashboard. El invitado no recibe notificación de esta acción.

### Permanencia del álbum

El álbum permanece activo 5 años desde la fecha del evento. Al año 4, el sistema notifica a la pareja con opción de renovar.

---

## Casos de error globales

| Situación | Comportamiento del sistema |
|---|---|
| Token de invitación inválido o expirado | Página de error con mensaje amigable y contacto de WhatsApp de soporte |
| Invitado offline | El QR guardado en galería sirve para mostrarlo en puerta. La validación ocurre del lado del venue, no del invitado |
| Número de WhatsApp incorrecto en lista | El envío falla silenciosamente. Sistema marca al invitado como `error_envío`. La pareja lo ve en el dashboard y puede corregirlo manualmente |
| Foto no sube (error de red) | Retry automático 2 veces. Si falla, mensaje: "Intenta de nuevo con WiFi" |
| Invitado accede al álbum antes del evento | El álbum puede estar en modo `preview` (visible, sin subida habilitada) o bloqueado — según decisión de la pareja en el dashboard |

---

## Integraciones requeridas por este flujo

| Integración | Uso | Fase |
|---|---|---|
| Twilio / WhatsApp Business API | Envío de invitación y confirmaciones automáticas | 1, 3 |
| Make / n8n | Workflow de automatización de envíos y recordatorios | 1, 3 |
| Supabase | Base de datos de invitados, estados, ingresos | 2, 3, 4 |
| Supabase Realtime | Actualización en tiempo real del dashboard | 3, 4, 5 |
| Cloudinary o Supabase Storage | Almacenamiento de fotos, videos y dibujos del álbum | 5 |

---

## Notas para arquitectura técnica (documento 2.2)

- El token único del invitado es el punto central del sistema — su generación, almacenamiento y validación son críticos. Definir estrategia en 2.2.
- La PWA de escaneo (`/acceso/[id-evento]`) requiere acceso a la cámara del navegador vía `getUserMedia`. Evaluar compatibilidad en iOS Safari.
- El canvas táctil del álbum (`dibujar a mano`) es la feature con más riesgo de performance en móviles de gama baja. Evaluar si va en v1 o se pospone.
- Supabase Realtime tiene límite de conexiones concurrentes en el plan free. Dimensionar según asistentes esperados por evento.
- La moderación del álbum (ocultar/eliminar fotos) no notifica al invitado — esto debe ser explícito en los términos de uso del servicio.
