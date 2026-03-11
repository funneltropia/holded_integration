import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { decrypt } from '@/lib/encryption';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const locationId = searchParams.get('locationId');
        const contactId = searchParams.get('contactId');

        if (!locationId || !contactId) {
            return NextResponse.json({ error: 'Faltan parámetros locationId o contactId' }, { status: 400 });
        }

        // 1. Obtener la clave de GHL desde Supabase
        const { data: account, error: accountError } = await supabase
            .from('accounts')
            .select('ghl_api_key')
            .eq('location_id', locationId)
            .single();

        if (accountError || !account?.ghl_api_key) {
            return NextResponse.json({ error: 'No se encontraron claves para esta subcuenta.' }, { status: 404 });
        }

        const ghlApiKey = decrypt(account.ghl_api_key);

        // 2. Llamar a la API de GoHighLevel para obtener los detalles del contacto
        const ghlResponse = await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${ghlApiKey}`,
                'Version': '2021-07-28',
                'Accept': 'application/json'
            }
        });

        if (!ghlResponse.ok) {
            const errorText = await ghlResponse.text();
            console.error('Error desde GHL:', errorText);
            return NextResponse.json({ error: 'Error al obtener datos de GoHighLevel.' }, { status: ghlResponse.status });
        }

        const ghlData = await ghlResponse.json();
        const contact = ghlData.contact;

        if (!contact) {
            return NextResponse.json({ error: 'Contacto no encontrado en GHL.' }, { status: 404 });
        }

        return NextResponse.json({
            id: contact.id,
            name: contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
            email: contact.email,
            phone: contact.phone,
        });

    } catch (error: any) {
        console.error('Excepción en /api/contact:', error);
        return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
    }
}
