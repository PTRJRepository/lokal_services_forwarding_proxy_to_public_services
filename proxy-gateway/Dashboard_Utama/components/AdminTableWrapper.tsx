'use client'

import AdminTable from './AdminTable'
import { deleteUser } from '@/app/admin/actions'
import { useRouter } from 'next/navigation'

interface User {
    id: number
    name: string
    email: string
    role: string
}

export default function AdminTableWrapper({ users }: { users: User[] }) {
    const router = useRouter()

    const handleDelete = async (id: number) => {
        if (confirm('Yakin ingin menghapus pengguna ini?')) {
            await deleteUser(String(id))
            router.refresh()
        }
    }

    const handleEdit = (id: number) => {
        console.log('Edit', id)
        alert('Fitur edit segera hadir')
    }

    return <AdminTable users={users} onDelete={handleDelete} onEdit={handleEdit} />
}
