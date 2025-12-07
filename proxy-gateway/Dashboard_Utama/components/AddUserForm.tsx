'use client'

import { createUser } from '@/app/admin/actions'
import { useRef, useState } from 'react'
import { X, UserPlus, Loader2 } from 'lucide-react'

interface AddUserFormProps {
    onClose: () => void
}

export default function AddUserForm({ onClose }: AddUserFormProps) {
    const formRef = useRef<HTMLFormElement>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true)
        setError(null)

        // Validate password confirmation
        const password = formData.get('password') as string
        const confirmPassword = formData.get('confirmPassword') as string

        if (password !== confirmPassword) {
            setError('Password dan konfirmasi password tidak cocok')
            setIsLoading(false)
            return
        }

        if (password.length < 6) {
            setError('Password minimal 6 karakter')
            setIsLoading(false)
            return
        }

        try {
            const result = await createUser(formData)
            if (result.error) {
                setError(result.error)
            } else {
                formRef.current?.reset()
                onClose()
            }
        } catch (e) {
            setError('Gagal membuat pengguna')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-palm-green to-emerald-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <UserPlus className="h-6 w-6 text-white" />
                        <h3 className="text-lg font-semibold text-white">Tambah Pengguna Baru</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form
                    ref={formRef}
                    action={handleSubmit}
                    className="p-6 space-y-4"
                >
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Lengkap
                        </label>
                        <input
                            name="name"
                            type="text"
                            required
                            placeholder="Masukkan nama lengkap"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-palm-green focus:border-transparent transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="contoh@email.com"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-palm-green focus:border-transparent transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            placeholder="Minimal 6 karakter"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-palm-green focus:border-transparent transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Konfirmasi Password
                        </label>
                        <input
                            name="confirmPassword"
                            type="password"
                            required
                            minLength={6}
                            placeholder="Ulangi password"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-palm-green focus:border-transparent transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Peran
                        </label>
                        <select
                            name="role"
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-palm-green focus:border-transparent transition-all bg-white"
                        >
                            <option value="KERANI">Kerani</option>
                            <option value="ACCOUNTING">Accounting</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 bg-palm-green text-white rounded-lg hover:bg-palm-green-hover transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan Pengguna'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
