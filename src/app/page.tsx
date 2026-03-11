'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { KeyRound, Building, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SetupPage() {
  const [locationId, setLocationId] = useState('');
  const [holdedKey, setHoldedKey] = useState('');
  const [ghlKey, setGhlKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationId || !holdedKey || !ghlKey) {
      setStatus('error');
      setMessage('Por favor, completa todos los campos.');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId, holdedKey, ghlKey }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('¡Claves guardadas correctamente!');
      } else {
        setStatus('error');
        setMessage(data.error || 'Error al guardar las claves.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Ocurrió un error de conexión.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Building className="h-6 w-6 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Conectar GoHighLevel y Holded
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Configura las claves de API para tu cuenta
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSave}>
            <div>
              <label htmlFor="locationId" className="block text-sm font-medium text-gray-700">
                GoHighLevel Location ID
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  id="locationId"
                  name="locationId"
                  type="text"
                  required
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="ej. xYz123AbC"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Identificador único de la subcuenta (Location) en GoHighLevel.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <label htmlFor="holdedKey" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-gray-400" />
                API Key de Holded
              </label>
              <div className="mt-1">
                <input
                  id="holdedKey"
                  name="holdedKey"
                  type="password"
                  required
                  value={holdedKey}
                  onChange={(e) => setHoldedKey(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="••••••••••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="ghlKey" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-gray-400" />
                API Key (v2) de GoHighLevel
              </label>
              <div className="mt-1">
                <input
                  id="ghlKey"
                  name="ghlKey"
                  type="password"
                  required
                  value={ghlKey}
                  onChange={(e) => setGhlKey(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="••••••••••••••••"
                />
              </div>
            </div>

            {status !== 'idle' && (
              <div className={`rounded-md p-4 flex gap-3 ${status === 'success' ? 'bg-green-50' : status === 'error' ? 'bg-red-50' : 'bg-blue-50'}`}>
                {status === 'success' && <CheckCircle2 className="h-5 w-5 text-green-400" />}
                {status === 'error' && <AlertCircle className="h-5 w-5 text-red-400" />}
                {status === 'loading' && <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />}
                <p className={`text-sm font-medium ${status === 'success' ? 'text-green-800' : status === 'error' ? 'text-red-800' : 'text-blue-800'}`}>
                  {status === 'loading' ? 'Guardando configuración...' : message}
                </p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Guardar Configuración
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
