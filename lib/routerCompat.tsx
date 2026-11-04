'use client'

import React from 'react'
import NextLink, { LinkProps as NextLinkProps } from 'next/link'
import {
  useRouter as useNextRouter,
  usePathname as useNextPathname,
  useSearchParams as useNextSearchParams,
  useParams as useNextParams,
} from 'next/navigation'

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to?: string | { pathname?: string; search?: string }
  href?: string
  children?: React.ReactNode
  replace?: boolean
  className?: string | ((props: { isActive: boolean }) => string)
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, href, children, className, replace, ...props }, ref) => {
    const pathname = useNextPathname()
    let destination = '/'

    if (typeof to === 'string') {
      destination = to
    } else if (to && typeof to === 'object') {
      destination = `${to.pathname || ''}${to.search || ''}`
    } else if (href) {
      destination = href
    }

    const isActive = pathname === destination
    const resolvedClassName = typeof className === 'function' ? className({ isActive }) : className

    return (
      <NextLink
        ref={ref}
        href={destination}
        replace={replace}
        className={resolvedClassName}
        {...props}
      >
        {children}
      </NextLink>
    )
  }
)
Link.displayName = 'Link'

export const NavLink = Link

export function useNavigate() {
  const router = useNextRouter()
  return (to: string | number, options?: { replace?: boolean }) => {
    if (typeof to === 'number') {
      if (typeof window !== 'undefined') {
        window.history.go(to)
      }
    } else if (options?.replace) {
      router.replace(to)
    } else {
      router.push(to)
    }
  }
}

export function useLocation() {
  const pathname = useNextPathname() || '/'
  const searchParams = useNextSearchParams()
  const search = searchParams ? `?${searchParams.toString()}` : ''

  return {
    pathname,
    search,
    hash: '',
    state: null,
    key: 'default',
  }
}

export function useParams<T extends Record<string, string | string[] | undefined>>(): T {
  const params = useNextParams()
  return (params || {}) as T
}

export function useSearchParams(): [URLSearchParams, (params: Record<string, any> | URLSearchParams) => void] {
  const router = useNextRouter()
  const pathname = useNextPathname()
  const nextSearchParams = useNextSearchParams()
  const current = new URLSearchParams(nextSearchParams ? nextSearchParams.toString() : '')

  const setSearchParams = (newParams: Record<string, any> | URLSearchParams) => {
    const params = new URLSearchParams()
    if (newParams instanceof URLSearchParams) {
      newParams.forEach((val, key) => params.set(key, val))
    } else if (newParams && typeof newParams === 'object') {
      Object.entries(newParams).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          params.set(k, String(v))
        }
      })
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return [current, setSearchParams]
}

export const Navigate: React.FC<{ to: string; replace?: boolean }> = ({ to, replace }) => {
  const router = useNextRouter()
  React.useEffect(() => {
    if (replace) router.replace(to)
    else router.push(to)
  }, [router, to, replace])
  return null
}

export const Outlet: React.FC = () => null
