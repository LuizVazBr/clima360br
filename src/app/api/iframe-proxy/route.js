import { NextResponse } from 'next/server';

export async function GET(request) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) return new NextResponse('No URL provided', { status: 400 });

  try {
    const res = await fetch(url, {
      headers: {
        // Imitate a normal browser to avoid blocks
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const contentType = res.headers.get('content-type') || '';
    
    // Se for HTML, injetamos a tag <base> para corrigir os caminhos relativos
    if (contentType.includes('text/html')) {
      let html = await res.text();
      const urlObj = new URL(url);
      const baseHref = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname.substring(0, urlObj.pathname.lastIndexOf('/'))}/`;
      const origin = `${urlObj.protocol}//${urlObj.host}/`;
      
      // Injeta a tag base logo após o head
      if (html.includes('<head>')) {
        html = html.replace('<head>', `<head><base href="${origin}" />`);
      } else {
        html = `<head><base href="${origin}" /></head>` + html;
      }
      
      return new NextResponse(html, {
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          // Strip X-Frame-Options and CSP
        }
      });
    }

    // Se for outro tipo de asset, retorna normalmente ignorando headers de segurança
    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (err) {
    return new NextResponse('Proxy error: ' + err.message, { status: 500 });
  }
}
