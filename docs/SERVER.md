# Сервер и инфраструктура tiyaksa.ru

Справка для владельца и для следующих сессий с Claude: что где лежит на VPS,
как устроены деплой и блог, какие правила безопасности действуют и почему.
Секретов здесь нет — только пути и устройство. Актуально на 2026-10-20.

## Доступ

- VPS: `root@94.141.162.141` (Timeweb, Ubuntu 24.04). Вход **только по ключу**:
  `PermitRootLogin prohibit-password`, `PasswordAuthentication no`
  (до 2026-10-20 был открыт вход по паролю — в логах 267 тыс. попыток
  подбора от ботнетов).
- С адресов VPN владельца (`185.36.143.227`, `45.158.81.120`, NL) сервер
  недоступен с ~2026-10-11 — блокировка в сети, а не на сервере (ufw выключен,
  iptables без правил на эти IP). В AmneziaVPN `94.141.162.141` добавлен в
  исключения раздельного туннелирования — подключаемся с домашнего IP.
- Запасной путь, если SSH недоступен: VNC-консоль в панели Timeweb.

## Что крутится на сервере

| Контейнер | Что это | Где конфиг |
|---|---|---|
| `n8n-traefik-1` | Traefik: 80/443, TLS, маршрутизация по доменам | `/home/n8n/docker-compose.yml` |
| `tiyaksa-tiyaksa-1` | Этот Next.js-сайт (`network_mode: host`, порт 3000) | `/root/tiyaksa/docker-compose.yml` |
| `tiyaksa-blog-*` | WordPress блога: nginx + php-fpm + mysql | `/root/tiyaksa-blog/` |
| `n8n-n8n-1` | n8n, контент-завод (`n8n.nanobanana-uu.ru`) | `/home/n8n/docker-compose.yml` |
| `nanobanana-*`, `wordpress-*` | Сайт nanobanana-uu.ru и его WordPress | `/root/nanobanana/`, `/root/wordpress/` |
| `deploy-barteravto-1` | бартеравто.рф | `/root/barteravto/` |
| `ru-proxy-8888` | tinyproxy, пускает только `185.159.83.131`. **Нужен владельцу, не трогать** | `/root/ru-proxy/` |

## Деплой сайта

- Пуш в `main` → GitHub Actions (`.github/workflows/deploy.yml`) собирает образ
  `ghcr.io/sudobins-png/tiyaksa-web/tiyaksa:latest` и заходит на VPS по SSH.
- Секрет `VPS_SSH_KEY` — **отдельный ограниченный ключ** (`gh-deploy-tiyaksa-web`),
  в `/root/.ssh/authorized_keys` он записан как
  `restrict,command="/root/deploy/deploy-gate.sh tiyaksa"`.
- `/root/deploy/deploy-gate.sh` **не выполняет** присланный workflow-скрипт:
  берёт из его строки `docker login` только временный токен ghcr и сам делает
  `docker compose pull && up -d --remove-orphans && image prune -f` в
  `/root/tiyaksa`. Ключ не даёт shell и проброс портов. Журнал:
  `/var/log/deploy-gate.log`.
- **Если меняешь шаги деплоя в workflow — они проигнорируются.** Новые шаги
  добавляются в `deploy-gate.sh` на сервере.
- Токены GitHub нового формата: `ghs_…_<JWT>` (символы `. _ -`) — регулярка в
  шлюзе это учитывает.
- Личный ключ владельца (`SHA256:MRQOUH…`) — полный доступ, им заходит человек.
- nanobanana-web деплоится так же: свой ключ `gh-deploy-nanobanana-web`
  (`deploy-gate.sh nanobanana` → `/root/nanobanana`), секреты `VPS_HOST`,
  `VPS_USER`, `VPS_SSH_KEY` в его репозитории. Первый деплой через шлюз —
  2026-10-20. Workflow там пока запускается вручную (Actions → Deploy to VPS →
  Run workflow); до этого образ собирался прямо на сервере из
  `/root/nanobanana/src`.
- Приватные части deploy-ключей хранятся только в секретах GitHub; копии на
  сервере удалены. Новый ключ — `ssh-keygen -t ed25519`, публичную часть в
  `authorized_keys` с `restrict,command="/root/deploy/deploy-gate.sh <проект>"`,
  проект — в `case` шлюза.

## Блог: headless WordPress

- WordPress только хранит статьи; страницы `/blog/*` рендерит этот Next.js
  (`lib/server/wordpress.ts`) через внутренний адрес
  `WORDPRESS_API_URL=http://127.0.0.1:8091/blog/wp-json`.
- Traefik отдаёт в WordPress только `/blog/wp-json`, `/blog/wp-admin`,
  `/blog/wp-login.php`, `/blog/wp-includes`, `/blog/wp-content`
  (labels в `/root/tiyaksa-blog/docker-compose.yml`).
- Правила `/root/tiyaksa-blog/nginx.conf`:
  - `/blog/wp-json/batch/v1` и `?rest_route=…batch…` → 403 (wp2shell, см. ниже);
  - **публичный REST только на чтение**: POST/PUT/PATCH/DELETE снаружи → 403.
    Писать можно только изнутри docker-сети `172.18.0.0/16` без
    `X-Forwarded-For` (через `geo`/`map` + `if … return 403`; `limit_except`
    не использовать — ломает `try_files`, получаются 404);
  - `fastcgi_param HTTPS on` — иначе WordPress не принимает пароли
    приложений от n8n по внутреннему http;
  - `/blog/wp-admin` и `wp-login.php` — за nginx basic auth
    (`/root/tiyaksa-blog/htpasswd`, пользователь `tiyaksa`). IP-ограничения
    больше нет: оба разрешённых VPN-адреса оказались заблокированы.
- Внутри WP: версия 7.0.7, один пользователь `sudobin`, активный плагин —
  Rank Math. wp-cli: `docker exec -u 82 tiyaksa-blog-blogphp-1 php /tmp/wp-cli.phar --path=/var/www/html/blog …`
  (лежит в `/tmp` контейнера — пропадёт при пересоздании, тогда скачать заново).
- Фронт сам защищается от мусора из WP: посты с адресом `*-htm(l)` или текстом
  «Hacked by» не попадают в карту сайта, блог, главную и RSS, по таким адресам —
  410 (`lib/config/quarantine.ts`, `middleware.ts`); HTML статей проходит
  через `sanitize-html` (`sanitizePostHtml`).

## n8n → блог

- Воркфлоу «ТиЯКСа — контент завод» (`VbvNutQouzGp9Q6k`) пишет в WordPress по
  **внутреннему** адресу `http://tiyaksa-blog-nginx-1/blog/wp-json`
  (учётки «tiyaksa blog»: WordPress API и Basic Auth, пароль приложения
  `n8n-tiyaksa`).
- Весь остальной исходящий трафик n8n идёт через прокси
  `HTTP(S)_PROXY=http://45.158.81.120:8119`; в `NO_PROXY` добавлен
  `tiyaksa-blog-nginx-1`. Ноды Replicate и скачивание картинок используют
  прокси явно — его там не убирать.
- По публичному `https://tiyaksa.ru/...` n8n до сервера не достучится (прокси
  заблокирован на пути к серверу, а напрямую сервер не может обратиться к
  своему же публичному IP). Поэтому `Download TG Cover` переписывает
  `wpImageUrl` на `http://tiyaksa-blog-nginx-1/blog/…`.

## Инцидент 2026-10-12 (закрыт 2026-10-20)

- Вектор: **wp2shell** (CVE-2026-63030 + CVE-2026-60137), WordPress 7.0.
  `POST /blog/wp-json/batch/v1` без авторизации с `68.183.188.255`,
  02:48–02:57 UTC → администратор `steven88` и 6 страниц-дефейсов
  «Hacked by CoupDeGrace» (`b7ad9721d55e-htm`, `b43124f1d8e9-htm` и др.).
  Массовая атака, не адресная.
- Проверено чистым: SSH-входы, ядро WP (контрольные суммы), плагины, темы,
  mu-plugins, `uploads`, опции, существующие статьи.
- Сделано: дефейсы скрыты на фронте и отдают 410; WP → 7.0.7; batch закрыт в
  nginx; `steven88` и артефакты удалены; пароль `sudobin` и пароль приложения
  сменены, сессии сброшены; публичный REST только на чтение.
- Бэкапы до изменений: `/root/backups/tiyaksa-blog-20261020/` (дамп БД и
  файлы); копии конфигов — `*.bak-*` рядом с оригиналами.
- За владельцем: удалить адреса дефейсов в Яндекс Вебмастере и Google Search
  Console, проверить разделы «Безопасность».

## Отложено

- Traefik запущен с `--api.insecure=true` (панель только внутри docker-сети,
  наружу не опубликована). Отключение требует пересоздания Traefik — все
  сайты на сервере пропадут на несколько секунд. Отложено владельцем.
