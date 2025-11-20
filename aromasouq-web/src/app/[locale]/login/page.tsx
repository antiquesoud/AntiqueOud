"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useAuth } from "@/hooks/useAuth"
import { useAuthStore } from "@/stores/authStore"
import { loginSchema, type LoginInput } from "@/lib/validations"
import toast from "react-hot-toast"

export default function LoginPage() {
  const t = useTranslations("auth")
  const router = useRouter()
  const { login, isAuthenticated, user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)
    try {
      await login(data.email, data.password)
      toast.success(t("welcomeBack"))

      // Role-based redirect after successful login
      const currentUser = useAuthStore.getState().user
      if (currentUser?.role === 'ADMIN') {
        router.push("/admin")
      } else if (currentUser?.role === 'VENDOR') {
        router.push("/vendor")
      } else {
        router.push("/")  // Customer goes to homepage
      }
    } catch (error) {
      toast.error(t("invalidCredentials"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{t("login")}</CardTitle>
          <CardDescription>{t("loginDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("email")}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t("emailPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("password")}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t("passwordPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
                {isLoading ? t("loggingIn") : t("login")}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Link href="/forgot-password" className="text-sm text-oud-gold hover:underline">
            {t("forgotPassword")}
          </Link>
          <div className="text-sm text-muted-foreground">
            {t("dontHaveAccount")}{" "}
            <Link href="/register" className="text-oud-gold hover:underline">
              {t("register")}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
