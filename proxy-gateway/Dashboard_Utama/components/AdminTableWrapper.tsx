'use client'

import AdminTable from './AdminTable'
import { deleteUser } from '@/app/admin/actions'
import { useRouter } from 'next/navigation'

export default function AdminTableWrapper({ users }: { users: any[] }) {
    const router = useRouter()

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            await deleteUser(id)
            router.refresh()
        }
    }

    const handleEdit = (id: string) => {
        // Implement edit logic (e.g. open modal)
        console.log('Edit', id)
        alert('Edit feature coming soon')
    }

    return <AdminTable users={users} onDelete={handleDelete} onEdit={handleEdit} />
}
