const q = s => document.querySelector(s)

const code = q("#code")
const get = q("#get")
const msg = q("#msg")
const box = q("#box")
const out = q("#out")
const copy = q("#copy")
const menu = q("#menu")
const admin = q("#admin")
const lua = q("#lua")
const create = q("#create")
const newcode = q("#newcode")

async function api(url, opt) {
  const res = await fetch(url, opt)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || "Ошибка")
  return data
}

function showAdmin() {
  menu.hidden = false
}

async function checkAuth() {
  try {
    const data = await api("/api/auth")
    if (data.admin) showAdmin()
  } catch {}
}

get.onclick = async () => {
  const val = code.value.trim()

  box.hidden = true
  copy.hidden = true
  msg.textContent = ""

  if (!/^\d{6}$/.test(val)) {
    msg.textContent = "Нужен 6 значный код"
    return
  }

  try {
    if (val === "607125") {
      const data = await api("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}"
      })

      if (data.admin) {
        showAdmin()
        msg.textContent = "Вы стали админом"
      }

      return
    }

    const data = await api(`/api/script/${val}`)
    out.textContent = data.script
    box.hidden = false
    copy.hidden = false
    msg.textContent = "Скрипт найден"
  } catch (e) {
    msg.textContent = e.message
  }
}

copy.onclick = async () => {
  await navigator.clipboard.writeText(out.textContent)
  msg.textContent = "Скопировано"
}

menu.onclick = () => {
  admin.hidden = !admin.hidden
}

create.onclick = async () => {
  const script = lua.value.trim()

  if (!script) {
    newcode.textContent = "Вставьте скрипт"
    return
  }

  try {
    const data = await api("/api/scripts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ script })
    })

    newcode.textContent = `Код: ${data.code}`
    lua.value = ""
  } catch (e) {
    newcode.textContent = e.message
  }
}

checkAuth()
