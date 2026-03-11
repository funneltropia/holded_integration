import { supabase } from '@/lib/supabase';

// URL base de Holded API
const HOLDED_API_URL = 'https://api.holded.com/api';

/**
 * Busca o crea un contacto en Holded y actualiza el mapa en Supabase.
 */
export async function getOrCreateHoldedContact(holdedApiKey: string, ghlContactId: string, email: string, name: string) {
    if (!email) {
        throw new Error('El contacto no tiene email, no se puede sincronizar con Holded.');
    }

    // 1. Primero comprobar en nuestra DB local si ya lo tenemos mapeado
    const { data: routeMap } = await supabase
        .from('contacts_map')
        .select('holded_contact_id')
        .eq('ghl_contact_id', ghlContactId)
        .single();

    if (routeMap?.holded_contact_id) {
        return routeMap.holded_contact_id; // Ya lo tenemos emparejado
    }

    // 2. Si no lo tenemos, buscarlo en Holded por email
    const searchRes = await fetch(`${HOLDED_API_URL}/invoicing/v1/contacts?email=${encodeURIComponent(email)}`, {
        headers: { 'Key': holdedApiKey, 'Accept': 'application/json' }
    });

    if (!searchRes.ok) {
        throw new Error('Error al buscar contacto en Holded');
    }

    const searchData = await searchRes.json();
    let holdedContactId = '';

    if (Array.isArray(searchData) && searchData.length > 0) {
        holdedContactId = searchData[0].id;
    } else {
        // 3. Si no existe en Holded, lo creamos
        const createRes = await fetch(`${HOLDED_API_URL}/invoicing/v1/contacts`, {
            method: 'POST',
            headers: {
                'Key': holdedApiKey,
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                name: name || email,
                email: email,
                type: 'client'
            }).toString()
        });

        if (!createRes.ok) {
            throw new Error('Error al crear el contacto en Holded');
        }

        const createData = await createRes.json();
        if (createData.status === 1) { // Holded devuelve status: 1 para ok
            holdedContactId = createData.id;
        } else {
            throw new Error('Respuesta inesperada al crear contacto en Holded');
        }
    }

    // 4. Guardar en Supabase el cruce de IDs (Contacts Map)
    await supabase.from('contacts_map').upsert({
        ghl_contact_id: ghlContactId,
        holded_contact_id: holdedContactId,
        email: email,
        updated_at: new Date().toISOString()
    });

    return holdedContactId;
}

/**
 * Obtiene los documentos (facturas o presupuestos) de Holded.
 */
export async function getHoldedDocuments(holdedApiKey: string, holdedContactId: string, docType: 'invoice' | 'estimate') {
    const url = `${HOLDED_API_URL}/invoicing/v1/documents/${docType}?contactId=${holdedContactId}`;

    const res = await fetch(url, {
        headers: { 'Key': holdedApiKey, 'Accept': 'application/json' }
    });

    if (!res.ok) {
        throw new Error(`Error al obtener ${docType}s de Holded`);
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
}
