import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { decrypt } from '@/lib/encryption';
import { getOrCreateHoldedContact, getHoldedDocuments } from '@/lib/holded';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const locationId = searchParams.get('locationId');
        const contactId = searchParams.get('contactId');
        const email = searchParams.get('email');
        const name = searchParams.get('name');

        if (!locationId || !contactId || !email) {
            return NextResponse.json({ error: 'Faltan parámetros (locationId, contactId, email)' }, { status: 400 });
        }

        // 1. Obtener la clave de Holded desde Supabase
        const { data: account, error: accountError } = await supabase
            .from('accounts')
            .select('holded_api_key')
            .eq('location_id', locationId)
            .single();

        if (accountError || !account?.holded_api_key) {
            return NextResponse.json({ error: 'No se encontraron claves de Holded para esta subcuenta.' }, { status: 404 });
        }

        const holdedApiKey = decrypt(account.holded_api_key);

        // 2. Buscar o crear el contacto en Holded
        const holdedContactId = await getOrCreateHoldedContact(holdedApiKey, contactId, email, name || '');

        // 3. Obtener los presupuestos del contacto
        const estimates = await getHoldedDocuments(holdedApiKey, holdedContactId, 'estimate');

        return NextResponse.json({ estimates });

    } catch (error: any) {
        console.error('Excepción en /api/estimates:', error);
        return NextResponse.json({ error: error.message || 'Error interno del servidor.' }, { status: 500 });
    }
}
