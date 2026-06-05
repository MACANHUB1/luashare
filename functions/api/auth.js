function id() {
  return crypto.randomUUID()
}

function cookie(req, name) {
  const raw = req.headers.get("Cookie") || ""
  const item = raw.split(";").map(x => x.trim()).find(x => x.startsWith(`${name}=`))
  return item ? decodeURIComponent(item.slice(name.length + 1)) : ""
}

export async function onRequestGet({ request, env }) {
  const sid = cookie(request, "ls_admin")
  const admin = sid && await env.SCRIPTS.get("admin") === sid
  return Response.json({ admin: Boolean(admin) })
}

export async function onRequestPost({ env }) {
  const current = await env.SCRIPTS.get("admin")

  if (current) {
    return Response.json({ error: "Админ уже существует" }, { status: 403 })
  }

  const sid = id()
  await env.SCRIPTS.put("admin", sid)

  return new Response(JSON.stringify({ admin: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `ls_admin=${sid}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=31536000`
    }
  })
}
