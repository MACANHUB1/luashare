function cookie(req, name) {
  const raw = req.headers.get("Cookie") || ""
  const item = raw.split(";").map(x => x.trim()).find(x => x.startsWith(`${name}=`))
  return item ? decodeURIComponent(item.slice(name.length + 1)) : ""
}

async function isAdmin(req, env) {
  const sid = cookie(req, "ls_admin")
  return sid && await env.SCRIPTS.get("admin") === sid
}

async function makeCode(env) {
  for (let i = 0; i < 20; i++) {
    const code = String(Math.floor(100000 + Math.random() * 900000))
    const exists = await env.SCRIPTS.get(`script:${code}`)
    if (!exists && code !== "607125") return code
  }

  throw new Error("Не удалось создать код")
}

export async function onRequestPost({ request, env }) {
  if (!await isAdmin(request, env)) {
    return Response.json({ error: "Нет доступа" }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const script = body?.script?.trim()

  if (!script) {
    return Response.json({ error: "Пустой скрипт" }, { status: 400 })
  }

  const code = await makeCode(env)
  await env.SCRIPTS.put(`script:${code}`, script)

  return Response.json({ code })
}
