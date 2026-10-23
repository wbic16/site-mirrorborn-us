# Real 404s for mirrorborn.us

This repo has no nginx config. On the live host, unknown paths return `index.html` with HTTP 200 (nginx 1.24 on Ubuntu). The fallback to replace is:

```nginx
try_files $uri $uri/ /index.html;
```

## What still has to work

Checked the repo and the live host. Pages are files or directories. `try_files $uri $uri/ =404;` still serves those.

| Path | What it is | After the change |
| --- | --- | --- |
| `/`, `/blog/`, `/deck/`, `/editor/`, `/phext-notepad/` | file or directory index | still 200 |
| `/onboarding/explorer.html` and other `*.html` files | real files | still 200 |
| `/editor/#1.1.1/1.1.1/1.1.1` | hash routing inside `editor/index.html` | still works; the hash is not sent to nginx |
| `/deck/` | `deck/index.html`. The bundle has no history router | still 200 |
| `/editor/api/` | separate `proxy_pass` (live `/editor/api/status` is 401 `unauthorized`, not the homepage) | unchanged; the script never edits `proxy_pass` |
| `/deck/no-such-route`, `/api/v2/...` on this host | already the homepage, not a client route. The API that answers is `https://sq.mirrorborn.us` | 404. `sq.mirrorborn.us` is a different server block and is not edited |
| `/onboarding/explorer` (no `.html`) | already the homepage. The page is `/onboarding/explorer.html` | 404. This was not a working route |

A `try_files` argument of `/deck/index.html` (or any path other than the site-root `/index.html`) is left as it is.

## Snippet

Inside the `mirrorborn.us` server block, keep every `proxy_pass` location, and use:

```nginx
error_page 404 /404.html;

location / {
    try_files $uri $uri/ =404;
}
```

`/404.html` must be on disk in the site root before nginx is reloaded. The internal redirect keeps the 404 status.

## Server commands

Documented layout for this host: the git checkout is `/source/site-mirrorborn-us` and the site root is `/sites/web/mirrorborn.us`. After `exo` has these commits:

```bash
cd /source/site-mirrorborn-us
git pull origin exo
rsync -av /source/site-mirrorborn-us/ /sites/web/mirrorborn.us/
sudo bash /source/site-mirrorborn-us/deploy/enable-404.sh
```

`deploy/enable-404.sh` finds the `mirrorborn.us` server block in `/etc/nginx/sites-available` (a `server_name` token of `mirrorborn.us` or `www.mirrorborn.us`). It copies that file to `/var/backups/nginx-mirrorborn/`, replaces a `try_files` argument of `/index.html` with `=404`, adds `error_page 404 /404.html;` when the block serves files, runs `nginx -t`, and reloads with `nginx -s reload`. If the test or the reload fails, it copies the backup back and reloads the restored file. A second run does nothing once that snippet is already there.

Then:

```bash
curl -sI https://mirrorborn.us/this-page-does-not-exist | head -n 1
curl -sI https://mirrorborn.us/blog/ | head -n 1
curl -sI https://mirrorborn.us/deck/ | head -n 1
curl -sI https://mirrorborn.us/editor/ | head -n 1
curl -sI https://mirrorborn.us/editor/api/status | head -n 1
curl -sI https://mirrorborn.us/samples/mirrorborn-sample.zip | head -n 1
```

Expected statuses: `404`, `200`, `200`, `200`, `401`, `200`.
