import { useState } from 'react'
import { Pencil, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminGetPages, adminUpdatePage } from '../../api/admin'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { PageSpinner } from '../../components/ui/Spinner'

function EditModal({ page, onClose }) {
    const queryClient = useQueryClient()
    const [title, setTitle] = useState(page.title)
    const [content, setContent] = useState(page.content ?? '')

    const mutation = useMutation({
        mutationFn: () => adminUpdatePage(page.slug, { title, content }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-pages'] })
            onClose()
        },
    })

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900">Modifica pagina</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titolo</label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contenuto (HTML)
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={18}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200">
                    <Button variant="secondary" onClick={onClose}>
                        Annulla
                    </Button>
                    <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
                        {mutation.isPending ? 'Salvataggio...' : 'Salva'}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default function AdminPages() {
    const [editing, setEditing] = useState(null)
    const { data: pages, isLoading } = useQuery({
        queryKey: ['admin-pages'],
        queryFn: adminGetPages,
    })

    if (isLoading) return <PageSpinner />

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-xl font-bold text-gray-900 mb-6">Pagine informative</h1>

            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {pages?.map((page) => (
                    <div key={page.slug} className="flex items-center justify-between px-4 py-3">
                        <div>
                            <p className="text-sm font-medium text-gray-900">{page.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">/p/{page.slug}</p>
                        </div>
                        <button
                            onClick={() => setEditing(page)}
                            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                        >
                            <Pencil size={16} />
                        </button>
                    </div>
                ))}
            </div>

            {editing && <EditModal page={editing} onClose={() => setEditing(null)} />}
        </div>
    )
}
