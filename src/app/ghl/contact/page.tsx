'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DocumentList } from './components/DocumentList';
import { PlusCircle, ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

function ContactIntegration() {
    const searchParams = useSearchParams();
    const locationId = searchParams.get('locationId');
    const contactId = searchParams.get('contactId');

    const [contactData, setContactData] = useState<any>(null);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [estimates, setEstimates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingDocs, setLoadingDocs] = useState(true);
    const [error, setError] = useState('');
    const [docsError, setDocsError] = useState('');

    // 1. Cargar el contacto básico de GHL
    useEffect(() => {
        async function loadData() {
            if (!locationId || !contactId) {
                setError('Faltan parámetros de GoHighLevel (locationId o contactId).');
                setLoading(false);
                setLoadingDocs(false);
                return;
            }

            try {
                const res = await fetch(`/api/contact?locationId=${locationId}&contactId=${contactId}`);
                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || 'Error cargando datos del contacto.');
                    setLoadingDocs(false);
                } else {
                    setContactData(data);
                    // Una vez tenemos el contacto, cargamos sus facturas y presupuestos a Holded usando su email
                    loadHoldedDocuments(data);
                }
            } catch (err) {
                setError('Error de conexión al cargar el contacto.');
                setLoadingDocs(false);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [locationId, contactId]);

    // 2. Cargar documentos de Holded
    async function loadHoldedDocuments(contact: any) {
        if (!contact?.email) {
            setDocsError('El contacto no tiene email, imposible buscar en Holded.');
            setLoadingDocs(false);
            return;
        }

        try {
            const params = new URLSearchParams({
                locationId: locationId!,
                contactId: contactId!,
                email: contact.email,
                name: contact.name
            }).toString();

            const [invRes, estRes] = await Promise.all([
                fetch(`/api/invoices?${params}`),
                fetch(`/api/estimates?${params}`)
            ]);

            const [invData, estData] = await Promise.all([
                invRes.json(),
                estRes.json()
            ]);

            if (!invRes.ok) setDocsError(invData.error || 'Error cargando facturas.');
            else setInvoices(invData.invoices || []);

            if (!estRes.ok && estRes.ok) setDocsError(estData.error || 'Error cargando presupuestos.');
            else setEstimates(estData.estimates || []);

        } catch (err) {
            setDocsError('Error de conexión con Holded.');
        } finally {
            setLoadingDocs(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 text-red-800 p-4 rounded-md border border-red-200">
                    <p className="font-medium text-sm">Error</p>
                    <p className="text-sm mt-1">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header de contacto centralizado */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xl font-bold shrink-0">
                            {contactData?.name ? contactData.name.substring(0, 2).toUpperCase() : '??'}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{contactData?.name || 'Nombre Desconocido'}</h1>
                            <div className="text-sm text-gray-500 mt-1 flex flex-col sm:flex-row sm:gap-4">
                                {contactData?.email && <p>📧 {contactData.email}</p>}
                                {contactData?.phone && <p>📱 {contactData.phone}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                        <a
                            href="https://app.holded.com/invoicing/invoices/create"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all"
                        >
                            <PlusCircle className="w-4 h-4" />
                            Nueva Factura
                        </a>
                        <a
                            href="https://app.holded.com/invoicing/contacts"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Ver Holded
                        </a>
                    </div>
                </div>

                {/* Tablas de documentos Holded */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                    <DocumentList
                        documents={invoices}
                        type="invoice"
                        loading={loadingDocs}
                        error={docsError}
                    />
                    <DocumentList
                        documents={estimates}
                        type="estimate"
                        loading={loadingDocs}
                        error={docsError}
                    />
                </div>
            </div>
        </div>
    );
}

export default function LoadingPage() {
    return (
        <Suspense fallback={<div className="p-6 text-sm text-gray-500">Cargando aplicación...</div>}>
            <ContactIntegration />
        </Suspense>
    );
}
