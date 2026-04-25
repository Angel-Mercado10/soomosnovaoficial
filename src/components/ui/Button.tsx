'use client'

import { type AnchorHTMLAttributes, type ButtonHTMLAttributes } from 'react'

type BaseProps = {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

type ButtonAsButton = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    as?: 'button'
    href?: never
  }

type ButtonAsAnchor = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    as: 'a'
    href: string
  }

type ButtonProps = ButtonAsButton | ButtonAsAnchor

const variants = {
  primary:
    'bg-nova-gold text-black font-semibold hover:bg-nova-gold-bright hover:shadow-[0_0_20px_rgba(201,168,76,0.35)] active:scale-[0.97] transition-all duration-200',
  secondary:
    'border border-white/25 text-white/80 hover:border-white/50 hover:text-white active:scale-[0.97] transition-all duration-200 bg-transparent',
  ghost:
    'text-white/60 hover:text-white active:opacity-70 transition-all duration-200 bg-transparent',
}

const sizes = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-sm',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full font-medium cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-nova-gold focus-visible:outline-offset-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none'
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`

  if (props.as === 'a') {
    const anchorProps = props as ButtonAsAnchor
    return <a className={classes} {...anchorProps} />
  }

  const buttonProps = props as ButtonAsButton
  return <button className={classes} {...buttonProps} />
}
