<?php
/**
 * Trabaja con nosotros: recibe el formulario de la web y lo envía por correo
 * con la hoja de vida adjunta. Se sube al cPanel de Jocecia (public_html/postular.php)
 * y usa el correo del mismo servidor, así los CV no pasan por servicios de terceros.
 */

// ===== Configuración =====
const DESTINO   = 'CAMBIAR@jocecia.com';        // correo que recibe las postulaciones
const REMITENTE = 'no-reply@jocecia.com';       // debe ser una cuenta/dominio del mismo servidor
const ORIGENES  = [                             // webs que pueden usar este formulario
  'https://www.jocecia.com',
  'https://jocecia.com',
  'https://jocecia-web.vercel.app',
];
const MAX_BYTES = 5 * 1024 * 1024;              // 5 MB
const MAX_POR_HORA = 5;                         // envíos por IP por hora
// =========================

header('Content-Type: application/json; charset=utf-8');
$origen = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origen, ORIGENES, true)) {
  header('Access-Control-Allow-Origin: ' . $origen);
  header('Vary: Origin');
  header('Access-Control-Allow-Methods: POST, OPTIONS');
}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

function salir(int $code, string $error = '') {
  http_response_code($code);
  echo json_encode($error ? ['ok' => false, 'error' => $error] : ['ok' => true]);
  exit;
}
function limpio(string $k, int $max = 200): string {
  $v = trim((string)($_POST[$k] ?? ''));
  $v = preg_replace('/[\r\n]+/', ' ', $v);           // evita inyección de cabeceras
  return mb_substr($v, 0, $max);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') salir(405, 'metodo');
if ($origen && !in_array($origen, ORIGENES, true)) salir(403, 'origen');
if (!empty($_POST['web'])) salir(200);                // trampa para bots: fingimos éxito

// Límite simple por IP
$ip = $_SERVER['REMOTE_ADDR'] ?? '0';
$reg = sys_get_temp_dir() . '/postular_' . md5($ip);
$hora = time() - 3600;
$marcas = array_filter(array_map('intval', @file($reg) ?: []), fn($t) => $t > $hora);
if (count($marcas) >= MAX_POR_HORA) salir(429, 'limite');

$nombre   = limpio('nombre', 120);
$telefono = limpio('telefono', 30);
$correo   = limpio('correo', 120);
$area     = limpio('area', 120);
$cargo    = limpio('cargo', 120);
$mensaje  = mb_substr(trim((string)($_POST['mensaje'] ?? '')), 0, 1500);
$idioma   = limpio('idioma', 5);

if (!$nombre || !$telefono || !$area || !filter_var($correo, FILTER_VALIDATE_EMAIL)) salir(422, 'datos');
if (($_POST['acepto'] ?? '') !== 'si') salir(422, 'consentimiento');

$cv = $_FILES['cv'] ?? null;
if (!$cv || $cv['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($cv['tmp_name'])) salir(422, 'archivo');
if ($cv['size'] > MAX_BYTES) salir(413, 'tamano');
$ext = strtolower(pathinfo($cv['name'], PATHINFO_EXTENSION));
$tipos = [
  'pdf'  => ['application/pdf'],
  'doc'  => ['application/msword', 'application/CDFV2', 'application/x-ole-storage'],
  'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'application/octet-stream'],
];
$mime = (new finfo(FILEINFO_MIME_TYPE))->file($cv['tmp_name']);
if (!isset($tipos[$ext]) || !in_array($mime, $tipos[$ext], true)) salir(422, 'tipo');

// Nombre de archivo seguro: CV_Nombre_Apellido.pdf
$base = preg_replace('/[^A-Za-z0-9]+/', '_', iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $nombre)) ?: 'postulante';
$adjunto = 'CV_' . trim($base, '_') . '.' . $ext;

$e = fn($s) => htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
$filas = [
  'Área'      => $area,
  'Cargo'     => $cargo ?: '—',
  'Nombre'    => $nombre,
  'Correo'    => $correo,
  'Teléfono'  => $telefono,
  'Idioma web'=> $idioma === 'en' ? 'Inglés' : 'Español',
  'Fecha'     => date('Y-m-d H:i'),
];
$html = '<div style="font-family:Arial,sans-serif;font-size:14px;color:#0d1726">'
  . '<h2 style="margin:0 0 12px">Nueva postulación desde la web</h2><table cellpadding="6" style="border-collapse:collapse">';
foreach ($filas as $k => $v) $html .= '<tr><td style="color:#5a6a7e">' . $k . '</td><td><b>' . $e($v) . '</b></td></tr>';
$html .= '</table>';
if ($mensaje) $html .= '<p style="color:#5a6a7e;margin:16px 0 4px">Experiencia / mensaje</p><p style="white-space:pre-wrap;margin:0">' . $e($mensaje) . '</p>';
$html .= '<p style="color:#5a6a7e;margin-top:16px">La hoja de vida va adjunta. Responda este correo para escribirle al postulante.</p></div>';

$texto = "Nueva postulación desde la web\n\n";
foreach ($filas as $k => $v) $texto .= "$k: $v\n";
if ($mensaje) $texto .= "\nExperiencia / mensaje:\n$mensaje\n";

$asunto = 'Postulación: ' . $area . ($cargo ? ' – ' . $cargo : '') . ' – ' . $nombre;
$asunto = '=?UTF-8?B?' . base64_encode($asunto) . '?=';

$b1 = 'b1_' . bin2hex(random_bytes(8));
$b2 = 'b2_' . bin2hex(random_bytes(8));
$cabeceras = implode("\r\n", [
  'From: =?UTF-8?B?' . base64_encode('Web Joce Cia') . '?= <' . REMITENTE . '>',
  'Reply-To: =?UTF-8?B?' . base64_encode($nombre) . '?= <' . $correo . '>',
  'MIME-Version: 1.0',
  'Content-Type: multipart/mixed; boundary="' . $b1 . '"',
]);
$cuerpo = "--$b1\r\nContent-Type: multipart/alternative; boundary=\"$b2\"\r\n\r\n"
  . "--$b2\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($texto))
  . "--$b2\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($html))
  . "--$b2--\r\n"
  . "--$b1\r\nContent-Type: $mime; name=\"$adjunto\"\r\nContent-Disposition: attachment; filename=\"$adjunto\"\r\nContent-Transfer-Encoding: base64\r\n\r\n"
  . chunk_split(base64_encode(file_get_contents($cv['tmp_name'])))
  . "--$b1--\r\n";

if (!mail(DESTINO, $asunto, $cuerpo, $cabeceras, '-f' . REMITENTE)) salir(500, 'envio');

$marcas[] = time();
@file_put_contents($reg, implode("\n", $marcas));
salir(200);
