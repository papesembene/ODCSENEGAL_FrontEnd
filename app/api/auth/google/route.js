export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
  
    if (!code) {
      return new Response(null, { status: 400 });
    }
  
    const backendResponse = await fetch(
      `${process.env.BACKEND_URL}/api/auth/google/callback?code=${code}`
    );
  
    if (!backendResponse.ok) {
      return Response.redirect('/login?error=auth_failed');
    }
  
    const { token, user } = await backendResponse.json();
    
    // Créez une réponse de redirection
    const response = Response.redirect('/dashboard');
    // Stockez le token en HTTPOnly
    response.cookies.set('auth_token', token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    return response;
  }