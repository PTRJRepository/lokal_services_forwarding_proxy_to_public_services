import Link from 'next/link'
import * as LucideIcons from 'lucide-react'

interface ServiceCardProps {
    name: string
    description: string | null
    icon: string | null
    routeUrl: string
}

export default function ServiceCard({ name, description, icon, routeUrl }: ServiceCardProps) {
    // Dynamic Icon Lookup
    // @ts-ignore - Dynamic access to Lucide icons
    const IconComponent = icon && LucideIcons[icon as keyof typeof LucideIcons] ? LucideIcons[icon as keyof typeof LucideIcons] : LucideIcons.HelpCircle

    return (
        <Link href={routeUrl} className="group block h-full">
            <div className="h-full bg-white rounded-xl shadow-md border border-gray-100 p-6 transition-all duration-300 hover:shadow-lg hover:border-palm-green/30 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-50 rounded-lg text-palm-green group-hover:bg-palm-green group-hover:text-white transition-colors duration-300">
                        {/* @ts-ignore */}
                        <IconComponent className="h-6 w-6" />
                    </div>
                    <LucideIcons.ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-palm-green transition-colors" />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-palm-green transition-colors mb-2">
                    {name}
                </h3>
                {description && (
                    <p className="text-sm text-gray-500 line-clamp-2">
                        {description}
                    </p>
                )}
            </div>
        </Link>
    )
}
