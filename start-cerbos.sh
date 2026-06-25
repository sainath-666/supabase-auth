#!/bin/bash
VERSION="0.34.0"
BINARY_DIR="./cerbos_bin"
BINARY="$BINARY_DIR/cerbos"

if [ ! -d "$BINARY_DIR" ]; then
  mkdir -p "$BINARY_DIR"
fi

if [ ! -f "$BINARY" ]; then
  echo "Cerbos binary not found locally."
  echo "Downloading Cerbos v$VERSION for Linux..."
  curl -L "https://github.com/cerbos/cerbos/releases/download/v${VERSION}/cerbos_${VERSION}_Linux_x86_64.tar.gz" | tar -xz -C "$BINARY_DIR"
fi

echo "Starting Cerbos Server..."
POLICIES_DIR="$(pwd)/cerbos/policies"
echo "Policies directory: $POLICIES_DIR"
"$BINARY" server --set=storage.disk.directory="$POLICIES_DIR"
