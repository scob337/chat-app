import { useState } from "react"
import { useAuth } from "../context/AuthContext"

export default function LoginPage() {
  const { login } = useAuth()
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(phone, password)
      alert("تم تسجيل الدخول بنجاح ✅")
    } catch (err) {
      alert("خطأ في تسجيل الدخول ❌")
      console.log(err)
    }
  }

  return (
<div className="w-full h-screen flex max-md:flex-col items-center justify-center py-5">
    <img src="https://cdni.iconscout.com/illustration/premium/thumb/chat-app-illustration-svg-png-download-7887809.png" alt="background" className="object-cover object-center h-screen w-7/12"/>
    <div className="bg-white flex flex-col justify-center items-center w-5/7 p-5 shadow-lg">
      <h1 className="text-3xl font-bold text-indigo-500 mb-2">LOGIN</h1>
      <div className="w-1/2 text-center max-md:w-full">
        <input type="text" name="mobile" placeholder="Mobile" autoComplete="off" onChange={e => setPhone(e.target.value)}
            className="shadow-md border w-full h-10 px-3 py-2 text-indigo-500 focus:outline-none focus:border-indigo-500 mb-3 rounded"/>
        <input type="password" name="password" placeholder="password" autoComplete="off" onChange={e => setPassword(e.target.value)}
            className="shadow-md border w-full h-10 px-3 py-2 text-indigo-500 focus:outline-none focus:border-indigo-500 mb-3 rounded"/>
        <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-lg focus:outline-none shadow"
        onClick={handleSubmit}
        >Sign In</button>
      </div>
    </div>
  </div>
  )
}
