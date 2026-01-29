import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { UtensilsCrossed, Eye, EyeOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { authApi, getApiErrorMessage } from "@/api/apiClient"
import { toast } from "sonner"

export default function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res: any = await authApi.login({
        email: formData.email,
        password: formData.password,
      })

      // Extract token from various possible structures
      const token = res.data?.token || res.token || res.accessToken || res.access_token;

      if (token) {
        localStorage.removeItem("token")
        sessionStorage.removeItem("token")
        if (formData.remember) {
          localStorage.setItem("token", token)
        } else {
          sessionStorage.setItem("token", token)
        }
        navigate("/dashboard")
      } else {
        toast.error("Đăng nhập thành công nhưng phản hồi không hợp lệ (thiếu token)")
      }
    } catch (error) {
      console.error("Login failed", error)
      toast.error(getApiErrorMessage(error, "Đăng nhập thất bại"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b1120] p-4 font-sans">
      {/* Background Gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[50%] w-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[50%] w-[50%] rounded-full bg-blue-900/10 blur-[120px]" />
      </div>

      <Card className="relative w-full max-w-[980px] border-slate-800/50 bg-slate-900/40 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative p-10 md:p-12 bg-gradient-to-br from-blue-600/15 via-slate-900/10 to-slate-900/40 border-b md:border-b-0 md:border-r border-slate-800/50">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-xl shadow-blue-600/20 ring-4 ring-blue-600/10">
                <UtensilsCrossed className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight text-white">POS Admin</div>
                <div className="mt-1 text-sm font-medium text-slate-400">Đăng nhập vào hệ thống quản trị</div>
              </div>
            </div>

            <div className="mt-10 space-y-4">
              <div className="rounded-2xl border border-slate-800/50 bg-slate-900/30 p-5 text-sm text-slate-300">
                <div className="font-bold text-white">Tối ưu cho vận hành</div>
                <div className="mt-1 text-slate-400">Gọn gàng, nhanh, thao tác ít để phục vụ giờ cao điểm.</div>
              </div>
              <div className="rounded-2xl border border-slate-800/50 bg-slate-900/30 p-5 text-sm text-slate-300">
                <div className="font-bold text-white">Bảo mật phiên đăng nhập</div>
                <div className="mt-1 text-slate-400">Có chế độ ghi nhớ hoặc chỉ lưu trong phiên làm việc.</div>
              </div>
            </div>
          </div>

          <div className="p-10 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-300 ml-1">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="h-13 bg-slate-800/40 border-slate-700/50 rounded-2xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600/50 transition-all"
                required
              />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-300 ml-1">
                Mật khẩu
              </Label>
              <div className="relative group">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="h-13 bg-slate-800/40 border-slate-700/50 rounded-2xl pr-12 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600/50 transition-all"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 text-slate-500 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="remember"
                  className="h-5 w-5 rounded-md border-slate-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  checked={formData.remember}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      remember: Boolean(checked),
                    })
                  }
                />
                <Label
                  htmlFor="remember"
                  className="cursor-pointer text-sm font-medium text-slate-400 hover:text-slate-300 transition-colors"
                >
                  Ghi nhớ đăng nhập
                </Label>
              </div>
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-sm font-bold text-blue-500 hover:text-blue-400 transition-colors"
                onClick={() => toast.info("Chức năng quên mật khẩu chưa được hỗ trợ")}
              >
                Quên mật khẩu?
              </Button>
            </div>

            <Button
              type="submit"
              className="w-full h-13 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </form>
          </div>
        </div>
      </Card>
    </div>
  )
}
