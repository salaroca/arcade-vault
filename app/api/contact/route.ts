import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { name, email, msg } = body ?? {};

  if (!name || !email || !msg) {
    return NextResponse.json({ ok: false, error: "Faltan campos requeridos" }, { status: 400 });
  }

  try {
    await resend.emails.send({
      from: "Arcade Vault <onboarding@resend.dev>",
      to: ["sergi.sala10@gmail.com"],
      subject: "[Arcade Vault] Nuevo mensaje de contacto",
      html: `
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${msg}</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
