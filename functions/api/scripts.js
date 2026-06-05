function readCookie(req, name) {
  const raw = req.headers.get("Cookie") || ""
  const item = raw.split(";").map(x => x.trim()).find(x => x.startsWith(`${name}=`))
  return item ? decodeURIComponent(item.slice(name.length + 1)) : ""
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  })
}

async function isAdmin(req, env) {
  const sid = readCookie(req, "ls_admin")
  const saved = await env.SCRIPTS.get("admin")
  return Boolean(sid && saved && sid === saved)
}

async function makeCode(env) {
  for (let i = 0; i < 50; i++) {
    const code = String(Math.floor(100000 + Math.random() * 900000))

    if (code === "607125") {
      continue
    }

    const exists = await env.SCRIPTS.get(`script:${code}`)

    if (!exists) {
      return code
    }
  }

  throw new Error("Не удалось создать код")
}

export async function onRequestPost({ request, env }) {
  if (!env.SCRIPTS) {
    return json({ error: "KV SCRIPTS не подключен" }, 500)
  }

  if (!await isAdmin(request, env)) {
    return json({ error: "Нет доступа" }, 403)
  }

  const body = await request.json().catch(() => null)
  const script = typeof body?.script === "string" ? body.script.trim() : ""

  if (!script) {
    return json({ error: "Пустой скрипт" }, 400)
  }

  const code = await makeCode(env)

  await env.SCRIPTS.put(`script:${code}`, script)

  return json({ code })
}
