function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  })
}

export async function onRequestGet({ params, env }) {
  if (!env.SCRIPTS) {
    return json({ error: "KV SCRIPTS не подключен" }, 500)
  }

  const code = params.code

  if (!/^\d{6}$/.test(code)) {
    return json({ error: "Неверный код" }, 400)
  }

  const script = await env.SCRIPTS.get(`script:${code}`)

  if (!script) {
    return json({ error: "Скрипт не найден" }, 404)
  }

  return json({ script })
}
