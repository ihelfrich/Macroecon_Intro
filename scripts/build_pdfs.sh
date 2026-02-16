#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="$ROOT_DIR/sources"
PDF_ENGINE="${PDF_ENGINE:-xelatex}"

if ! command -v pandoc >/dev/null 2>&1; then
  echo "pandoc is required but not installed." >&2
  exit 1
fi

common_args=(
  "--pdf-engine=$PDF_ENGINE"
  "-V" "geometry:margin=0.85in"
  "-V" "fontsize=11pt"
)

build_pdf() {
  local src="$1"
  local out="$2"
  echo "Building $out"
  pandoc "$src" -o "$out" "${common_args[@]}"
}

build_pdf "$SRC_DIR/ECON205_Midterm1_Master_Study_Tool.md" "$ROOT_DIR/ECON205_Midterm1_Master_Study_Tool.pdf"
build_pdf "$SRC_DIR/ECON205_Midterm1_Active_Recall_Bank.md" "$ROOT_DIR/ECON205_Midterm1_Active_Recall_Bank.pdf"
build_pdf "$SRC_DIR/ECON205_Midterm1_Active_Recall_Bank_Key.md" "$ROOT_DIR/ECON205_Midterm1_Active_Recall_Bank_Key.pdf"

build_pdf "$SRC_DIR/ECON205_Midterm1_Mock_Exam_A.md" "$ROOT_DIR/ECON205_Midterm1_Mock_Exam_A.pdf"
build_pdf "$SRC_DIR/ECON205_Midterm1_Mock_Exam_A_Key.md" "$ROOT_DIR/ECON205_Midterm1_Mock_Exam_A_Key.pdf"
build_pdf "$SRC_DIR/ECON205_Midterm1_Mock_Exam_B.md" "$ROOT_DIR/ECON205_Midterm1_Mock_Exam_B.pdf"
build_pdf "$SRC_DIR/ECON205_Midterm1_Mock_Exam_B_Key.md" "$ROOT_DIR/ECON205_Midterm1_Mock_Exam_B_Key.pdf"
build_pdf "$SRC_DIR/ECON205_Midterm1_Mock_Exam_C.md" "$ROOT_DIR/ECON205_Midterm1_Mock_Exam_C.pdf"
build_pdf "$SRC_DIR/ECON205_Midterm1_Mock_Exam_C_Key.md" "$ROOT_DIR/ECON205_Midterm1_Mock_Exam_C_Key.pdf"

echo "Building ECON205_Midterm1_Cram_Sheet_OnePage.pdf"
pandoc "$SRC_DIR/ECON205_Midterm1_Cram_Sheet_OnePage.md" \
  -o "$ROOT_DIR/ECON205_Midterm1_Cram_Sheet_OnePage.pdf" \
  "--pdf-engine=$PDF_ENGINE" \
  -V geometry:margin=0.45in \
  -V fontsize=9pt

tmp_pack="$(mktemp)"
cleanup() {
  rm -f "$tmp_pack"
}
trap cleanup EXIT

pack_sources=(
  "$SRC_DIR/ECON205_Midterm1_Master_Study_Tool.md"
  "$SRC_DIR/ECON205_Midterm1_Active_Recall_Bank.md"
  "$SRC_DIR/ECON205_Midterm1_Active_Recall_Bank_Key.md"
  "$SRC_DIR/ECON205_Midterm1_Mock_Exam_A.md"
  "$SRC_DIR/ECON205_Midterm1_Mock_Exam_A_Key.md"
  "$SRC_DIR/ECON205_Midterm1_Mock_Exam_B.md"
  "$SRC_DIR/ECON205_Midterm1_Mock_Exam_B_Key.md"
  "$SRC_DIR/ECON205_Midterm1_Mock_Exam_C.md"
  "$SRC_DIR/ECON205_Midterm1_Mock_Exam_C_Key.md"
  "$SRC_DIR/ECON205_Midterm1_Cram_Sheet_OnePage.md"
)

{
  for src in "${pack_sources[@]}"; do
    cat "$src"
    printf '\n\n\\newpage\n\n'
  done
} > "$tmp_pack"

echo "Building ECON205_Midterm1_Complete_Study_Pack.pdf"
pandoc "$tmp_pack" -o "$ROOT_DIR/ECON205_Midterm1_Complete_Study_Pack.pdf" "${common_args[@]}"

cp "$SRC_DIR/ECON205_Midterm1_Master_Study_Tool.md" "$ROOT_DIR/ECON205_Midterm1_Master_Study_Tool.md"

echo "Done."
