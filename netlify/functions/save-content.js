// netlify/functions/save-content.js
// Saves changes directly to GitHub repository (martinc1994/brodDj)

exports.handler = async (event, context) => {
  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { password, content, imageUpload, commitMessage, customToken, customRepo, customOwner } = body;

    // Check credentials:
    // Either verify with ADMIN_PASSWORD (from Netlify Environment Variables)
    // or allow a direct customToken passed from the admin panel
    const adminPassword = process.env.ADMIN_PASSWORD || 'brod2026';
    const githubToken = process.env.GITHUB_TOKEN || customToken;

    if (!githubToken) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: 'Falta configurar GITHUB_TOKEN en las variables de entorno de Netlify o ingresar el token en el panel.'
        })
      };
    }

    // If no custom token was provided, password must match ADMIN_PASSWORD
    if (!customToken && password !== adminPassword) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Contraseña de administrador incorrecta.' })
      };
    }

    const repoOwner = process.env.GITHUB_OWNER || customOwner || 'martinc1994';
    const repoName = process.env.GITHUB_REPO || customRepo || 'brodDj';
    const branch = process.env.GITHUB_BRANCH || 'main';

    const headers = {
      'Authorization': `Bearer ${githubToken.trim()}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'Netlify-Brod-Admin-Function',
      'Content-Type': 'application/json'
    };

    // ACTION A: Upload Image (if provided)
    if (imageUpload && imageUpload.filename && imageUpload.base64) {
      const imgPath = `assets/img/${imageUpload.filename}`;
      const getFileUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${imgPath}?ref=${branch}`;

      let currentSha = null;
      try {
        const getRes = await fetch(getFileUrl, { headers });
        if (getRes.ok) {
          const fileData = await getRes.json();
          currentSha = fileData.sha;
        }
      } catch (e) {
        // file doesn't exist yet, ok to create
      }

      const putRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${imgPath}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          message: `Upload ${imageUpload.filename} via Admin Panel`,
          content: imageUpload.base64,
          sha: currentSha || undefined,
          branch
        })
      });

      if (!putRes.ok) {
        const errData = await putRes.json();
        return {
          statusCode: putRes.status,
          body: JSON.stringify({ error: 'Error al subir imagen a GitHub', details: errData })
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, imagePath: imgPath })
      };
    }

    // ACTION B: Save data/content.json
    if (content) {
      const contentPath = 'data/content.json';
      const getUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${contentPath}?ref=${branch}`;

      let currentSha = null;
      try {
        const getRes = await fetch(getUrl, { headers });
        if (getRes.ok) {
          const fileData = await getRes.json();
          currentSha = fileData.sha;
        }
      } catch (e) {
        // File doesn't exist yet, ok
      }

      const formattedJson = JSON.stringify(content, null, 2);
      const base64Content = Buffer.from(formattedJson, 'utf-8').toString('base64');

      const putRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${contentPath}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          message: commitMessage || 'Actualizar sets y contenido desde Panel Admin [skip ci/build]',
          content: base64Content,
          sha: currentSha || undefined,
          branch
        })
      });

      if (!putRes.ok) {
        const errData = await putRes.json();
        return {
          statusCode: putRes.status,
          body: JSON.stringify({ error: 'Error al guardar en GitHub', details: errData })
        };
      }

      const resultData = await putRes.json();
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: '¡Contenido actualizado en GitHub correctamente! Netlify iniciará el deploy en instantes.',
          commit: resultData.commit?.html_url
        })
      };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No se enviaron datos para guardar.' })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno en la función de guardado', details: error.message })
    };
  }
};
