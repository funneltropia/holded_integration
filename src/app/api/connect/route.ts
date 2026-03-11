import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { encrypt } from '@/lib/encryption';

export async function POST(request: Request) {
    try {
        const { locationId, holdedKey, ghlKey } = await request.json();

        if (!locationId || !holdedKey || !ghlKey) {
            return NextResponse.json(
                { error: 'Faltan parámetros (locationId, holdedKey, ghlKey)' },
                { status: 400 }
            );
        }

        // Encriptar las claves antes de guardarlas
        const encryptedHoldedKey = encrypt(holdedKey);
        const encryptedGhlKey = encrypt(ghlKey);

        const { error } = await supabase
            .from('accounts')
            .upsert({
                location_id: locationId,
                holded_api_key: encryptedHoldedKey,
                ghl_api_key: encryptedGhlKey,
                updated_at: new Date().toISOString()
            }, { onConflict: 'location_id' });

        if (error) {
            console.error('Error guardando en Supabase:', error);
            return NextResponse.json(
                { error: 'Error al conectar y guardar las claves' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: 'Claves guardadas correctamente' });

    } catch (err: any) {
        console.error('Excepción en /api/connect:', err);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
