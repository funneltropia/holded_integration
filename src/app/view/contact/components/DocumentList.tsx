'use client';

import { FileText, Download, ExternalLink } from 'lucide-react';

interface DocumentProps {
    documents: any[];
    type: 'invoice' | 'estimate';
    loading: boolean;
    error?: string;
}

export function DocumentList({ documents, type, loading, error }: DocumentProps) {
    const title = type === 'invoice' ? 'Facturas' : 'Presupuestos';
    const emptyMessage = type === 'invoice' ? 'No hay facturas registradas.' : 'No hay presupuestos registrados.';

    const getStatusColor = (status: number) => {
        // Basic mapping based on Holded standard, might need tweaking depending on actual API response
        switch (status) {
            case 0: return 'bg-gray-100 text-gray-800'; // Borrador
            case 1: return 'bg-green-100 text-green-800'; // Pagado / Aceptado
            case 2: return 'bg-yellow-100 text-yellow-800'; // Pendiente / Enviado
            case 3: return 'bg-red-100 text-red-800'; // Vencido / Rechazado
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    const getStatusText = (status: number) => {
        switch (status) {
            case 0: return 'Borrador';
            case 1: return type === 'invoice' ? 'Pagada' : 'Aceptado';
            case 2: return 'Pendiente';
            case 3: return type === 'invoice' ? 'Vencida' : 'Rechazado';
            default: return 'Desconocido';
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
                <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {documents.length}
                </span>
            </div>

            {documents.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    {emptyMessage}
                </div>
            ) : (
                <div className="overflow-hidden ring-1 ring-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-900">Nº Documento</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Fecha</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Total</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {documents.map((doc) => (
                                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                                        <div className="flex gap-2 items-center">
                                            <a
                                                href={`https://app.holded.com/invoicing/${type === 'invoice' ? 'invoices' : 'estimates'}/${doc.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
                                                title="Abrir en Holded"
                                            >
                                                {doc.docNumber}
                                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {new Date(doc.date * 1000).toLocaleDateString()}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                                        {doc.total.toLocaleString('es-ES', { style: 'currency', currency: doc.currency })}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(doc.status)}`}>
                                            {getStatusText(doc.status)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
