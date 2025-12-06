'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { authenticate } from '@/app/actions'
import { KeyRound, Mail, ArrowRight } from 'lucide-react'

export default function LoginForm() {
    const [errorMessage, dispatch] = useFormState(authenticate, undefined)

    return (
        <form action={dispatch} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="email">
                    Email
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        className="w-full rounded-lg border border-gray-300 pl-10 p-2.5 text-sm focus:border-green-600 focus:ring-green-600 outline-none transition-all"
                        id="email"
                        type="email"
                        name="email"
                        placeholder="name@rebinmas.com"
                        required
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="password">
                    Password
                </label>
                <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        className="w-full rounded-lg border border-gray-300 pl-10 p-2.5 text-sm focus:border-green-600 focus:ring-green-600 outline-none transition-all"
                        id="password"
                        type="password"
                        name="password"
                        placeholder="Enter password"
                        required
                        minLength={6}
                    />
                </div>
            </div>
            <div className="pt-2">
                <LoginButton />
            </div>

            {errorMessage && (
                <div className="flex h-8 items-end space-x-1" aria-live="polite" aria-atomic="true">
                    <p className="text-sm text-red-500">{errorMessage}</p>
                </div>
            )}
        </form>
    )
}

function LoginButton() {
    const { pending } = useFormStatus()

    return (
        <button
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#3A7D44] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d6135] focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-disabled={pending}
            disabled={pending}
        >
            {pending ? 'Logging in...' : 'Sign In'} <ArrowRight className="h-4 w-4" />
        </button>
    )
}
