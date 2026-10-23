#!/usr/bin/env bash
# Swap the mirrorborn.us index.html fallback for a real 404 page.
# Idempotent. Backs up the site file, runs nginx -t, reloads, and restores
# the backup if the test or the reload fails.
set -euo pipefail

SITES_DIR="${NGINX_SITES_AVAILABLE:-/etc/nginx/sites-available}"
BACKUP_ROOT="${NGINX_BACKUP_DIR:-/var/backups/nginx-mirrorborn}"
NGINX_BIN="${NGINX_BIN:-nginx}"

die() {
  echo "enable-404: $*" >&2
  exit 1
}

info() {
  echo "enable-404: $*"
}

if [[ ! -d "$SITES_DIR" ]]; then
  die "sites directory not found: $SITES_DIR"
fi

if ! command -v "$NGINX_BIN" >/dev/null 2>&1; then
  die "nginx binary not found: $NGINX_BIN"
fi

declare -a SITE_FILES=()
declare -a RENDERED=()
declare -a BACKUPS=()

while IFS= read -r -d '' config; do
  base=$(basename "$config")
  case "$base" in
    .*|*.bak|*.bak-*|*.dpkg-old|*.dpkg-dist|*.dpkg-new|*.rpmnew|*.rpmsave|*~)
      continue
      ;;
  esac
  SITE_FILES+=("$config")
done < <(find "$SITES_DIR" -mindepth 1 -maxdepth 1 -type f -print0 | sort -z)

if [[ ${#SITE_FILES[@]} -eq 0 ]]; then
  die "no site files in $SITES_DIR"
fi

WORK=$(mktemp -d)
installed=0
did_restore=0

restore_installed() {
  local i
  if [[ "$did_restore" -eq 1 ]]; then
    return 0
  fi
  did_restore=1
  for i in "${!RENDERED[@]}"; do
    cp -a "${BACKUPS[$i]}" "${RENDERED[$i]}"
    info "restored ${RENDERED[$i]} from ${BACKUPS[$i]}"
  done
}

cleanup_exit() {
  local rc=$?
  if [[ "$rc" -ne 0 && "$installed" -eq 1 ]]; then
    restore_installed || true
  fi
  rm -rf "$WORK"
}
trap cleanup_exit EXIT

transform_config() {
  local src="$1"
  local dest="$2"
  local status_file="$3"

  awk -v status_path="$status_file" -f <(
    cat <<'AWK'
function brace_delta(s,    i, n, c, delta, in_str, quote) {
  n = length(s)
  delta = 0
  in_str = 0
  quote = ""
  for (i = 1; i <= n; i++) {
    c = substr(s, i, 1)
    if (in_str) {
      if (c == "\\") {
        i++
        continue
      }
      if (c == quote) in_str = 0
      continue
    }
    if (c == "#") break
    if (c == "\"" || c == "'") {
      in_str = 1
      quote = c
      continue
    }
    if (c == "{") delta++
    else if (c == "}") delta--
  }
  return delta
}

function note_broken(msg) {
  if (file_broken == 0) broken_reason = msg
  file_broken = 1
}

function line_is_comment(line) {
  return line ~ /^[[:space:]]*#/
}

function leading_ws(line) {
  if (match(line, /^[[:space:]]*/)) return substr(line, 1, RLENGTH)
  return ""
}

function is_server_start(line) {
  if (line_is_comment(line)) return 0
  return line ~ /^[[:space:]]*server[[:space:]]*(\{|#|$)/
}

function collect_hosts(    i, line, rest, n, k, tok) {
  host_n = 0
  for (i = 1; i <= nbuf; i++) {
    line = buf[i]
    if (line_is_comment(line)) continue
    if (!match(line, /^[[:space:]]*server_name[[:space:]]+/)) continue
    rest = substr(line, RSTART + RLENGTH)
    sub(/#.*/, "", rest)
    sub(/;.*/, "", rest)
    n = split(rest, toks, /[[:space:]]+/)
    for (k = 1; k <= n; k++) {
      tok = toks[k]
      if (tok == "") continue
      host_n++
      hosts[host_n] = tok
    }
  }
}

function host_flags(    i, tok) {
  has_site = 0
  has_other_sub = 0
  for (i = 1; i <= host_n; i++) {
    tok = hosts[i]
    if (tok == "mirrorborn.us" || tok == "www.mirrorborn.us") has_site = 1
    else if (tok ~ /\.mirrorborn\.us$/) has_other_sub = 1
  }
}

function scan_kind(    i, line) {
  has_try = 0
  has_root = 0
  has_include = 0
  for (i = 1; i <= nbuf; i++) {
    line = buf[i]
    if (line_is_comment(line)) continue
    if (line ~ /^[[:space:]]*try_files[[:space:]]/) has_try = 1
    else if (line ~ /^[[:space:]]*(root|alias)[[:space:]]/) has_root = 1
    else if (line ~ /^[[:space:]]*include[[:space:]]/) has_include = 1
  }
}

function rewrite_try(line,    pre, rest, args, post, n, i, arg, rebuilt, needs, prev404) {
  if (line_is_comment(line)) return line
  if (!match(line, /^[[:space:]]*try_files[[:space:]]+/)) return line
  if (line !~ /;/) {
    multiline = 1
    return line
  }
  pre = substr(line, 1, RSTART + RLENGTH - 1)
  rest = substr(line, RSTART + RLENGTH)
  if (!match(rest, /;/)) {
    multiline = 1
    return line
  }
  args = substr(rest, 1, RSTART - 1)
  post = substr(rest, RSTART)
  n = split(args, argv, /[[:space:]]+/)
  needs = 0
  for (i = 1; i <= n; i++) {
    if (argv[i] == "/index.html" || argv[i] == "/index.html$is_args$args") needs = 1
  }
  if (!needs) return line
  rebuilt = ""
  prev404 = 0
  for (i = 1; i <= n; i++) {
    arg = argv[i]
    if (arg == "") continue
    if (arg == "/index.html" || arg == "/index.html$is_args$args") arg = "=404"
    if (arg == "=404" && prev404) continue
    if (rebuilt != "") rebuilt = rebuilt " "
    rebuilt = rebuilt arg
    prev404 = (arg == "=404")
  }
  replaced = 1
  return pre rebuilt post
}

function is_canonical_error(line) {
  return line ~ /^[[:space:]]*error_page[[:space:]]+404[[:space:]]+\/404\.html[[:space:]]*;[[:space:]]*(#.*)?$/
}

function strip_comment(line) {
  sub(/#.*/, "", line)
  return line
}

function out_has_root_fallback(    i, line) {
  for (i = 1; i <= outn; i++) {
    line = out[i]
    if (line_is_comment(line)) continue
    line = strip_comment(line)
    if (line ~ /(^|[[:space:]=])\/index\.html([[:space:];$]|$)/) return 1
  }
  return 0
}

function out_has_404(    i, line) {
  for (i = 1; i <= outn; i++) {
    line = out[i]
    if (line_is_comment(line)) continue
    if (line ~ /^[[:space:]]*try_files[[:space:]]/ && line ~ /(^|[[:space:]])=404([[:space:];]|$)/) return 1
  }
  return 0
}

function out_has_canonical(    i) {
  for (i = 1; i <= outn; i++) {
    if (line_is_comment(out[i])) continue
    if (is_canonical_error(out[i])) return 1
  }
  return 0
}

function insert_after(idx, text,    i, nnew) {
  nnew = 0
  for (i = 1; i <= outn; i++) {
    nnew++
    newout[nnew] = out[i]
    if (i == idx) {
      nnew++
      newout[nnew] = text
    }
  }
  if (idx == 0) {
    nnew++
    newout[nnew] = text
  }
  outn = nnew
  for (i = 1; i <= outn; i++) out[i] = newout[i]
  delete newout
}

function ensure_error_page(    i, line, found, insert_at, indent) {
  found = 0
  insert_at = 0
  indent = "    "
  for (i = 1; i <= outn; i++) {
    line = out[i]
    if (line_is_comment(line)) continue
    if (insert_at == 0 && line ~ /^[[:space:]]*server_name[[:space:]]/) {
      insert_at = i
      indent = leading_ws(line)
    }
    if (is_canonical_error(line)) found = 1
    else if (line ~ /^[[:space:]]*error_page[[:space:]]+404[[:space:]]/) {
      out[i] = leading_ws(line) "error_page 404 /404.html;"
      found = 1
      error_added = 1
    }
  }
  if (!found) {
    if (insert_at == 0) insert_at = 1
    insert_after(insert_at, indent "error_page 404 /404.html;")
    error_added = 1
  }
}

function print_buf(    i) {
  for (i = 1; i <= nbuf; i++) print buf[i]
}

function flush_server(    i, line) {
  replaced = 0
  error_added = 0
  multiline = 0
  collect_hosts()
  host_flags()

  if (!has_site) {
    print_buf()
    return
  }
  if (has_other_sub) {
    note_broken("server block lists mirrorborn.us with another *.mirrorborn.us name; left unchanged")
    print_buf()
    return
  }

  scan_kind()
  if (!has_try && !has_root) {
    print_buf()
    return
  }

  outn = 0
  for (i = 1; i <= nbuf; i++) {
    line = rewrite_try(buf[i])
    outn++
    out[outn] = line
  }

  if (multiline) {
    note_broken("try_files spans more than one line; edit that server block by hand")
  } else if (has_try) {
    if (out_has_root_fallback()) {
      note_broken("an /index.html fallback is still present after rewrite")
    } else if (!out_has_404()) {
      note_broken("no try_files /index.html fallback and no =404 in the mirrorborn.us server block")
    } else {
      ensure_error_page()
    }
  } else if (has_include) {
    note_broken("mirrorborn.us content is included from another file; the /index.html fallback was not in this server block")
  } else {
    ensure_error_page()
  }

  if (file_broken == 0) {
    file_site_content = 1
    if (replaced || error_added) file_changed = 1
  }

  for (i = 1; i <= outn; i++) print out[i]
  delete out
}

BEGIN {
  mode = "out"
  depth = 0
  opened = 0
  buf_start = 0
  nbuf = 0
  file_broken = 0
  file_changed = 0
  file_site_content = 0
  broken_reason = ""
}

{
  delta = brace_delta($0)
  if (mode == "out") {
    if (is_server_start($0)) {
      mode = "server"
      opened = 0
      nbuf = 0
      buf_start = depth
      nbuf++
      buf[nbuf] = $0
      depth += delta
      if (depth > buf_start) opened = 1
      if (opened && depth <= buf_start) {
        flush_server()
        mode = "out"
        delete buf
        nbuf = 0
      }
    } else {
      print $0
      depth += delta
    }
  } else {
    nbuf++
    buf[nbuf] = $0
    depth += delta
    if (depth > buf_start) opened = 1
    if (opened && depth <= buf_start) {
      flush_server()
      mode = "out"
      delete buf
      nbuf = 0
    }
  }
}

END {
  if (mode == "server") {
    note_broken("unbalanced braces while reading a server block")
    print_buf()
  }
  if (file_broken) status = "BROKEN\t" broken_reason
  else if (file_changed) status = "CHANGED"
  else if (file_site_content) status = "ALREADY"
  else status = "SKIP"
  print status > status_path
  close(status_path)
}
AWK
  ) "$src" >"$dest"
}

declare -a CHANGED_SRC=()
declare -a CHANGED_RENDERED=()
broken=0
already=0
seen=0

for config in "${SITE_FILES[@]}"; do
  base=$(basename "$config")
  rendered="$WORK/$base.rendered"
  status_file="$WORK/$base.status"
  transform_config "$config" "$rendered" "$status_file"
  status=$(head -n 1 "$status_file")
  case "$status" in
    CHANGED)
      seen=1
      CHANGED_SRC+=("$config")
      CHANGED_RENDERED+=("$rendered")
      ;;
    ALREADY)
      seen=1
      already=1
      ;;
    SKIP)
      ;;
    BROKEN*)
      seen=1
      broken=1
      reason=${status#BROKEN$'\t'}
      echo "enable-404: $config: $reason" >&2
      ;;
    *)
      die "could not read a transform status for $config"
      ;;
  esac
done

if [[ "$broken" -eq 1 ]]; then
  die "refusing to edit nginx config; fix the server block using deploy/nginx-404.md"
fi

if [[ ${#CHANGED_SRC[@]} -eq 0 ]]; then
  if [[ "$already" -eq 1 ]]; then
    info "mirrorborn.us already serves 404 via /404.html"
    exit 0
  fi
  if [[ "$seen" -eq 0 ]]; then
    die "no mirrorborn.us server block in $SITES_DIR"
  fi
  die "no mirrorborn.us content server block in $SITES_DIR"
fi

mkdir -p "$BACKUP_ROOT"
chmod 700 "$BACKUP_ROOT"
stamp=$(date -u +%Y%m%dT%H%M%SZ)

install_rendered() {
  local i src rendered base backup
  for i in "${!CHANGED_SRC[@]}"; do
    src=${CHANGED_SRC[$i]}
    rendered=${CHANGED_RENDERED[$i]}
    base=$(basename "$src")
    backup="$BACKUP_ROOT/${base}.${stamp}"
    cp -a "$src" "$backup"
    BACKUPS+=("$backup")
    RENDERED+=("$src")
    installed=1
    cat "$rendered" >"$src"
    info "updated $src (backup $backup)"
  done
}

install_rendered

if ! "$NGINX_BIN" -t; then
  restore_installed
  die "nginx -t failed; restored the previous site file"
fi

if ! "$NGINX_BIN" -s reload; then
  restore_installed
  "$NGINX_BIN" -t || true
  if ! "$NGINX_BIN" -s reload; then
    die "nginx reload failed and the restored config did not reload; backups are in $BACKUP_ROOT"
  fi
  die "nginx reload failed; restored the previous site file and reloaded it"
fi

info "nginx reloaded"
