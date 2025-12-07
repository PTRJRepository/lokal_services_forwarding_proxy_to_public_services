'use client'

import { Trash2 } from 'lucide-react'
import { deleteService } from '@/app/admin/actions'
import { useRouter } from 'next/navigation'

interface Service {
    id: string
    name: string
    path: string | null
    targetUrl: string | null
    routeUrl: string
}

export default function ServiceTable({ services }: { services: Service[] }) {
    const router = useRouter()

    const handleDelete = async (id: string) => {
        if (confirm('Hapus layanan ini?')) {
            await deleteService(id)
            router.refresh()
        }
    }

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jalur Proxy</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target URL</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {services.map(s => (
                        <tr key={s.id}>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-500 font-mono">{s.path || '-'}</td>
                            <td className="px-6 py-4 text-sm text-gray-500 font-mono">{s.targetUrl || '-'}</td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-900">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
