export async function onRequestGet({ params, env }) {
  const code = params.code

  if (!/^\d{6}$/.test(code)) {
    return Response.json({ error: "Неверный код" }, { status: 400 })
  }

  const script = await env.SCRIPTS.get(`script:${code}`)

  if (!script) {
    return Response.json({ error: "Скрипт не найден" }, { status: 404 })
  }

  return Response.json({ script })
}
