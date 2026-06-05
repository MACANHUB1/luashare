const q = s => document.querySelector(s)
const qa = s => [...document.querySelectorAll(s)]

const inputs = qa(".codeInput input")
const get = q("#get")
const msg = q("#msg")
const out = q("#out")
const copy = q("#copy")
const download = q("#download")
const hamb = q("#hamb")
const side = q("#side")
const navs = qa(".nav")
const mainPage = q("#mainPage")
const adminPage = q("#adminPage")
const adminNav = q("#adminNav")
const lua = q("#lua")
const create = q("#create")
const clear = q("#clear")
const newcode = q("#newcode")

let currentScript = ""

async function api(url, opt) {
  const res = await fetch(url, opt)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || "Ошибка")
  return data
}

function getCode() {
  return inputs.map(i => i.value).join("")
}

function setPage(page) {
  navs.forEach(n => n.classList.toggle("active", n.dataset.page === page))
  mainPage.classList.toggle("active", page === "main")
  adminPage.classList.toggle("active", page === "admin")
  side.classList.remove("open")
}

function showAdmin() {
  adminNav.hidden = false
}

inputs.forEach((inp, i) => {
  inp.addEventListener("input", e => {
    inp.value = inp.value.replace(/\D/g, "").slice(0, 1)
    if (inp.value && inputs[i + 1]) inputs[i + 1].focus()
  })

  inp.addEventListener("keydown", e => {
    if (e.key === "Backspace" && !inp.value && inputs[i - 1]) inputs[i - 1].focus()
  })

  inp.addEventListener("paste", e => {
    e.preventDefault()
    const val = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    inputs.forEach((x, n) => x.value = val[n] || "")
    if (inputs[val.length - 1]) inputs[val.length - 1].focus()
  })
})

navs.forEach(n => n.onclick = () => setPage(n.dataset.page))

hamb.onclick = () => side.classList.toggle("open")

get.onclick = async () => {
  const val = getCode()

  msg.textContent = ""

  if (!/^\d{6}$/.test(val)) {
    msg.textContent = "Введите 6 цифр"
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
        setPage("admin")
        msg.textContent = "Админ доступ открыт"
      }

      return
    }

    const data = await api(`/api/script/${val}`)
    currentScript = data.script
    out.textContent = data.script
    msg.textContent = "Скрипт найден"
  } catch (e) {
    msg.textContent = e.message
  }
}

copy.onclick = async () => {
  if (!currentScript) return msg.textContent = "Сначала получите скрипт"
  await navigator.clipboard.writeText(currentScript)
  msg.textContent = "Скопировано"
}

download.onclick = () => {
  if (!currentScript) return msg.textContent = "Сначала получите скрипт"

  const blob = new Blob([currentScript], { type: "text/plain" })
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = "script.lua"
  a.click()
  URL.revokeObjectURL(a.href)
}

clear.onclick = () => {
  lua.value = ""
  newcode.textContent = ""
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

async function checkAuth() {
  try {
    const data = await api("/api/auth")
    if (data.admin) showAdmin()
  } catch {}
}

checkAuth()
