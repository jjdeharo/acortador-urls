// api/acortar.js
export default async function handler(req, res) {
    // Configurar CORS para que tu frontend pueda acceder
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Manejar preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Solo permitir POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }
    
    try {
        // Tu clave API (SEGURA en el servidor - nadie puede verla)
        const API_KEY = 'a6bf7ccff6ff857e085e74dd779f9e';
        const API_BASE = 'https://ja.cat/api/v2';
        
        console.log('Recibida petición:', req.body);
        
        // Obtener datos del frontend
        const { url, customEnding, isSecret } = req.body;
        
        // Validar URL
        if (!url) {
            return res.status(400).json({ error: 'URL es requerida' });
        }
        
        // Construir parámetros para la API
        const params = new URLSearchParams({
            key: API_KEY,
            url: encodeURIComponent(url),
            is_secret: isSecret ? 'true' : 'false',
            response_type: 'json'
        });
        
        if (customEnding) {
            params.append('custom_ending', customEnding);
        }
        
        console.log('Enviando a ja.cat:', `${API_BASE}/action/shorten?${params.toString()}`);
        
        // Hacer petición a ja.cat
        const response = await fetch(`${API_BASE}/action/shorten?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });
        
        console.log('Respuesta de ja.cat status:', response.status);
        
        // Manejar respuesta
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            console.log('Respuesta como texto:', text);
            if (response.ok) {
                data = { result: text };
            } else {
                data = { error: text };
            }
        }
        
        console.log('Datos procesados:', data);
        
        if (!response.ok) {
            return res.status(response.status).json({
                error: data.error || `Error HTTP ${response.status}`
            });
        }
        
        // Devolver resultado exitoso
        res.status(200).json({
            success: true,
            shortUrl: data.result || data
        });
        
    } catch (error) {
        console.error('Error en función:', error);
        res.status(500).json({
            error: 'Error interno del servidor: ' + error.message
        });
    }
}