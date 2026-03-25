// app/api/admin/check-auth/route.js

export async function GET() {
  try {
    const res = await fetch("https://api.orangedigitalcenter.sn/check-auth", {
      method: "GET",
      credentials: "include", // indispensable pour les cookies de session Flask
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return new Response(
        JSON.stringify({ success: false, error: data.error || "Non authentifié" }),
        { status: 401 }
      );
    }

    return new Response(JSON.stringify({ success: true, admin: data.admin }), {
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: "Erreur côté serveur frontend" }),
      { status: 500 }
    );
  }
}
