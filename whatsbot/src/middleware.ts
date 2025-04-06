import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  console.log('Funcionou')
  const token = request.cookies.get('auth-token')?.value

  const protectedRoutes = ['/dashboard', '/usuarios', '/mensagens', '/configuracoes']

  const isProtected = protectedRoutes.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (!isProtected) return NextResponse.next()

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/usuarios/:path*', '/mensagens/:path*', '/configuracoes/:path*'],
}
