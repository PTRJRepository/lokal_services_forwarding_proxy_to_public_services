'use client'

import { addService } from '@/app/admin/actions'
import { useRef } from 'react'

export default function AddServiceForm() {
    const formRef = useRef<HTMLFormElement>(null)

    return (
        <form
            ref={formRef}
            action={async (formData) => {
                await addService(formData)
                formRef.current?.reset()
            }}
            className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200"
        >
            <h3 className="font-semibold text-gray-900">Tambah Layanan Baru</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Layanan</label>
                    <input name="name" required className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                    <input name="description" className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Rute Internal (Next.js)</label>
                    <input name="routeUrl" required placeholder="/services/myservice" className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm" />
                </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-2">
                <p className="text-xs text-gray-500 mb-2 uppercase font-semibold">Konfigurasi Proxy</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Jalur Proxy</label>
                        <input name="path" placeholder="/absen" className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm font-mono" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Target URL</label>
                        <input name="targetUrl" placeholder="http://localhost:5176" className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm font-mono" />
                    </div>
                </div>
            </div>

            <button type="submit" className="px-4 py-2 bg-palm-green text-white rounded-md text-sm hover:bg-palm-green-hover">
                Buat Layanan
            </button>
        </form>
    )
}
