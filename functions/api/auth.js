function readCookie(req, name) {
  const raw = req.headers.get("Cookie") || ""
  const item = raw.split(";").map(x => x.trim()).find(x => x.startsWith(`${name}=`))
  return item ? decodeURIComponent(item.slice(name.length + 1)) : ""
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers
    }
  })
}

export async function onRequestGet({ request, env }) {
  if (!env.SCRIPTS) {
    return json({ admin: false, error: "KV SCRIPTS не подключен" }, 500)
  }

  const sid = readCookie(request, "ls_admin")
  const saved = await env.SCRIPTS.get("admin")

  return json({ admin: Boolean(sid && saved && sid === saved) })
}

export async function onRequestPost({ request, env }) {
  if (!env.SCRIPTS) {
    return json({ error: "KV SCRIPTS не подключен" }, 500)
  }

  const sid = readCookie(request, "ls_admin")
  const saved = await env.SCRIPTS.get("admin")

  if (saved && sid === saved) {
    return json({ admin: true })
  }

  if (saved) {
    return json({ error: "Админ уже существует" }, 403)
  }

  const next = crypto.randomUUID()

  await env.SCRIPTS.put("admin", next)

  return json(
    { admin: true },
    200,
    {
      "Set-Cookie": `ls_admin=${encodeURIComponent(next)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=31536000`
    }
  )
}
