const q = s => document.querySelector(s)
const qa = s => [...document.querySelectorAll(s)]

const menuBtn = q("#menuBtn")
const popup = q("#popup")
const goMain = q("#goMain")
const goAdmin = q("#goAdmin")
const mainPage = q("#mainPage")
const adminPage = q("#adminPage")
const inputs = qa(".codeInput input")
const codePage = q("#codePage")
const scriptPage = q("#scriptPage")
const out = q("#out")
const msg = q("#msg")
const copy = q("#copy")
const download = q("#download")
const lua = q("#lua")
const focusEdit = q("#focusEdit")
const clear = q("#clear")
const adminDownload = q("#adminDownload")
const create = q("#create")
const newcode = q("#newcode")

let currentScript = ""
let busy = false

async function api(url, opt) {
  const res = await fetch(url, opt)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || "Ошибка")
  return data
}

function page(name) {
  mainPage.classList.toggle("active", name === "main")
  adminPage.classList.toggle("active", name === "admin")
  popup.classList.remove("open")
}

function showAdmin() {
  goAdmin.hidden = false
}

function code() {
  return inputs.map(x => x.value).join("")
}

function resetCode() {
  inputs.forEach(x => x.value = "")
  inputs[0].focus()
}

function showScript(script) {
  currentScript = script
  out.textContent = script
  codePage.hidden = true
  scriptPage.hidden = false
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

async function submitCode() {
  if (busy) return

  const val = code()

  if (!/^\d{6}$/.test(val)) return

  busy = true
  msg.textContent = ""

  try {
    if (val === "607125") {
      const data = await api("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}"
      })

      if (data.admin) {
        showAdmin()
        page("admin")
        msg.textContent = ""
      }

      resetCode()
      return
    }

    const data = await api(`/api/script/${val}`)
    showScript(data.script)
  } catch (e) {
    msg.textContent = e.message
    resetCode()
  } finally {
    busy = false
  }
}

menuBtn.onclick = () => popup.classList.toggle("open")

goMain.onclick = () => {
  page("main")
}

goAdmin.onclick = () => {
  page("admin")
}

document.addEventListener("click", e => {
  if (!popup.contains(e.target) && !menuBtn.contains(e.target)) {
    popup.classList.remove("open")
  }
})

inputs.forEach((inp, i) => {
  inp.addEventListener("input", () => {
    inp.value = inp.value.replace(/\D/g, "").slice(0, 1)

    if (inp.value && inputs[i + 1]) {
      inputs[i + 1].focus()
    }

    if (code().length === 6) {
      submitCode()
    }
  })

  inp.addEventListener("keydown", e => {
    if (e.key === "Backspace" && !inp.value && inputs[i - 1]) {
      inputs[i - 1].focus()
    }

    if (e.key === "Enter") {
      submitCode()
    }
  })

  inp.addEventListener("paste", e => {
    e.preventDefault()

    const val = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)

    inputs.forEach((x, n) => {
      x.value = val[n] || ""
    })

    if (val.length === 6) {
      submitCode()
    } else if (inputs[val.length]) {
      inputs[val.length].focus()
    }
  })
})

copy.onclick = async () => {
  if (!currentScript) {
    msg.textContent = "Скрипт не открыт"
    return
  }

  await navigator.clipboard.writeText(currentScript)
  msg.textContent = "Скопировано"
}

download.onclick = () => {
  if (!currentScript) {
    msg.textContent = "Скрипт не открыт"
    return
  }

  saveFile(currentScript, "script.lua")
}

focusEdit.onclick = () => {
  lua.focus()
}

clear.onclick = () => {
  lua.value = ""
  newcode.textContent = ""
  lua.focus()
}

adminDownload.onclick = () => {
  const script = lua.value.trim()

  if (!script) {
    newcode.textContent = "Script пустой"
    return
  }

  saveFile(script, "script.lua")
}

create.onclick = async () => {
  const script = lua.value.trim()

  if (!script) {
    newcode.textContent = "Script пустой"
    return
  }

  newcode.textContent = ""

  try {
    const data = await api("/api/scripts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ script })
    })

    newcode.textContent = `Code: ${data.code}`
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
