'use client'

import { type AnchorHTMLAttributes, type ButtonHTMLAttributes } from 'react'

type BaseProps = {
  variant?: 'primary' | 'secondary' | 'ghost'
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
    'bg-nova-gold text-black font-medium hover:opacity-90 transition-opacity duration-200',
  secondary:
    'border border-white/30 text-white hover:border-white/60 transition-colors duration-200 bg-transparent',
  ghost: 'text-white/70 hover:text-white transition-colors duration-200 bg-transparent',
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium cursor-pointer select-none'
  const classes = `${base} ${variants[variant]} ${className}`

  if (props.as === 'a') {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { as: _tag, ...anchorProps } = props
    return <a className={classes} {...anchorProps} />
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { as: _tag, ...buttonProps } = props as ButtonAsButton
  return <button className={classes} {...buttonProps} />
}
