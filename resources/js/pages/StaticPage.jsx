import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { getPage } from '../api/pages'

export default function StaticPage() {
    const { slug } = useParams()

    const { data: page, isLoading, isError } = useQuery({
        queryKey: ['page', slug],
        queryFn: () => getPage(slug),
    })

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-400">
                Caricamento...
            </div>
        )
    }

    if (isError) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500">
                Pagina non trovata.
            </div>
        )
    }

    return (
        <>
        <Helmet>
            <title>{page.title} - Yocigaci</title>
            <meta property="og:title" content={`${page.title} - Yocigaci`} />
        </Helmet>
        <div className="max-w-3xl mx-auto px-4 py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">{page.title}</h1>
            <div
                className="page-content max-w-none"
                dangerouslySetInnerHTML={{ __html: page.content }}
            />
        </div>
        </>
    )
}
