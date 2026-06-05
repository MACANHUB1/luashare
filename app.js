const q = s => document.querySelector(s)
const qa = s => Array.from(document.querySelectorAll(s))

const burger = q("#burger")
const menu = q("#menu")
const openMain = q("#openMain")
const openAdmin = q("#openAdmin")
const main = q("#main")
const admin = q("#admin")
const inputs = qa(".codeInput input")
const codeScreen = q("#codeScreen")
const scriptScreen = q("#scriptScreen")
const scriptOut = q("#scriptOut")
const status = q("#status")
const adminStatus = q("#adminStatus")
const copyScript = q("#copyScript")
const downloadScript = q("#downloadScript")
const luaInput = q("#luaInput")
const editLua = q("#editLua")
const clearLua = q("#clearLua")
const downloadLua = q("#downloadLua")
const createScript = q("#createScript")

let currentScript = ""
let locked = false

async function api(url, opt = {}) {
  const res = await fetch(url, opt)
  const txt = await res.text()
  let data = {}

  try {
    data = txt ? JSON.parse(txt) : {}
  } catch {
    throw new Error(txt || "Ошибка API")
  }

  if (!res.ok) {
    throw new Error(data.error || "Ошибка")
  }

  return data
}

function showPage(name) {
  main.classList.toggle("show", name === "main")
  admin.classList.toggle("show", name === "admin")
  menu.classList.remove("open")
}

function showAdmin() {
  openAdmin.hidden = false
}

function getCode() {
  return inputs.map(i => i.value).join("")
}

function clearCode() {
  inputs.forEach(i => i.value = "")
  inputs[0].focus()
}

function saveFile(text, name) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = name
  document.body.append(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(a.href)
}

function openScript(script) {
  currentScript = script
  scriptOut.textContent = script
  codeScreen.hidden = true
  scriptScreen.hidden = false
}

async function submitCode() {
  if (locked) return

  const val = getCode()

  if (!/^\d{6}$/.test(val)) return

  locked = true
  status.textContent = ""

  try {
    if (val === "607125") {
      const data = await api("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}"
      })

      if (data.admin) {
        showAdmin()
        showPage("admin")
      }

      clearCode()
      return
    }

    const data = await api(`/api/script/${val}`)
    openScript(data.script)
  } catch (e) {
    status.textContent = e.message
    clearCode()
  } finally {
    locked = false
  }
}

burger.onclick = () => {
  menu.classList.toggle("open")
}

openMain.onclick = () => {
  showPage("main")
}

openAdmin.onclick = () => {
  showPage("admin")
}

document.addEventListener("click", e => {
  if (!menu.contains(e.target) && !burger.contains(e.target)) {
    menu.classList.remove("open")
  }
})

inputs.forEach((inp, index) => {
  inp.addEventListener("input", () => {
    inp.value = inp.value.replace(/\D/g, "").slice(0, 1)

    if (inp.value && inputs[index + 1]) {
      inputs[index + 1].focus()
    }

    if (getCode().length === 6) {
      submitCode()
    }
  })

  inp.addEventListener("keydown", e => {
    if (e.key === "Backspace" && !inp.value && inputs[index - 1]) {
      inputs[index - 1].focus()
    }

    if (e.key === "Enter") {
      submitCode()
    }
  })

  inp.addEventListener("paste", e => {
    e.preventDefault()

    const val = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)

    inputs.forEach((x, i) => {
      x.value = val[i] || ""
    })

    if (val.length === 6) {
      submitCode()
    } else if (inputs[val.length]) {
      inputs[val.length].focus()
    }
  })
})

copyScript.onclick = async () => {
  if (!currentScript) {
    status.textContent = "Скрипт не открыт"
    return
  }

  await navigator.clipboard.writeText(currentScript)
  status.textContent = "Скопировано"
}

downloadScript.onclick = () => {
  if (!currentScript) {
    status.textContent = "Скрипт не открыт"
    return
  }

  saveFile(currentScript, "script.lua")
}

editLua.onclick = () => {
  luaInput.focus()
}

clearLua.onclick = () => {
  luaInput.value = ""
  adminStatus.textContent = ""
  luaInput.focus()
}

downloadLua.onclick = () => {
  const script = luaInput.value.trim()

  if (!script) {
    adminStatus.textContent = "Script пустой"
    return
  }

  saveFile(script, "script.lua")
}

createScript.onclick = async () => {
  const script = luaInput.value.trim()

  if (!script) {
    adminStatus.textContent = "Script пустой"
    return
  }

  adminStatus.textContent = ""

  try {
    const data = await api("/api/scripts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ script })
    })

    adminStatus.textContent = `Code: ${data.code}`
    luaInput.value = ""
  } catch (e) {
    adminStatus.textContent = e.message
  }
}

async function init() {
  try {
    const data = await api("/api/auth")

    if (data.admin) {
      showAdmin()
    }
  } catch {}
}

init()
