<?php
header('Content-Type: application/json');

// ── Config ──────────────────────────────────────────
$uploadDir    = __DIR__ . '/uploads/';
$maxFileSize  = 5 * 1024 * 1024; // 5 MB
$allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
$allowedExts  = ['pdf', 'doc', 'docx'];
// ────────────────────────────────────────────────────

function respond($success, $message) {
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Invalid request method.');
}

// Sanitise text fields
$firstName = trim(strip_tags($_POST['firstName'] ?? ''));
$lastName  = trim(strip_tags($_POST['lastName']  ?? ''));
$civilId   = trim(strip_tags($_POST['civilId']   ?? ''));
$phone     = trim(strip_tags($_POST['phone']     ?? ''));
$degree    = trim(strip_tags($_POST['degree']    ?? ''));
$major     = trim(strip_tags($_POST['major']     ?? ''));

if (!$firstName || !$lastName || !$civilId || !$phone || !$degree || !$major) {
    respond(false, 'All fields are required.');
}

// Check file was uploaded
if (empty($_FILES['cvUpload']) || $_FILES['cvUpload']['error'] !== UPLOAD_ERR_OK) {
    respond(false, 'CV upload failed or missing.');
}

$file     = $_FILES['cvUpload'];
$origName = basename($file['name']);
$ext      = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
$mimeType = mime_content_type($file['tmp_name']);

// Validate extension
if (!in_array($ext, $allowedExts)) {
    respond(false, 'Only PDF, DOC and DOCX files are allowed.');
}

// Validate MIME type
if (!in_array($mimeType, $allowedTypes)) {
    respond(false, 'Invalid file type detected.');
}

// Validate size
if ($file['size'] > $maxFileSize) {
    respond(false, 'File exceeds the 5 MB limit.');
}

// ── Create uploads/ and uploads/{civilId}/ folders ──
$safeCivilId = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $civilId);
$userDir     = $uploadDir . $safeCivilId . '/';

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

if (!is_dir($userDir)) {
    mkdir($userDir, 0755, true);
}
// If folder already exists, files are simply overwritten — allows resubmission

// ── Save info.txt ────────────────────────────────────
$isResubmission = file_exists($userDir . 'info.txt');

$infoContent = implode(PHP_EOL, [
    'First Name   : ' . $firstName,
    'Last Name    : ' . $lastName,
    'Civil ID     : ' . $civilId,
    'Phone        : ' . $phone,
    'Degree       : ' . $degree,
    'Major        : ' . $major,
    'Submitted    : ' . date('Y-m-d H:i:s'),
    'Resubmission : ' . ($isResubmission ? 'Yes' : 'No'),
]);

file_put_contents($userDir . 'info.txt', $infoContent);

// ── Save CV as cv.ext ─────────────────────────────────
$dest = $userDir . 'cv.' . $ext;

if (!move_uploaded_file($file['tmp_name'], $dest)) {
    respond(false, 'Could not save the CV. Please try again.');
}

respond(true, 'Application received successfully.');