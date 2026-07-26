/**
 * Módulo de envio de e-mails do PrintForge 3D.
 * Suporta Resend API quando RESEND_API_KEY está configurada, ou simula o envio no console.
 */

interface SendOrderStatusEmailOptions {
  toEmail: string;
  clienteNome?: string;
  pecaNome: string;
  novoStatus: string;
  pedidoId: string;
}

const STATUS_LABELS: Record<string, string> = {
  pendente: "Aguardando Início (Pendente)",
  em_impressao: "Em Impressão 3D 🖨️",
  pintando: "Em Pintura / Acabamento 🎨",
  pronto: "Pronto para Retirada / Envio 📦",
  enviado: "Enviado 🚚",
  entregue: "Entregue ao Cliente 🎉",
  cancelado: "Cancelado ❌",
};

export async function enviarEmailMudancaStatus({
  toEmail,
  clienteNome,
  pecaNome,
  novoStatus,
  pedidoId,
}: SendOrderStatusEmailOptions) {
  const statusFormatado = STATUS_LABELS[novoStatus] || novoStatus;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const pedidosUrl = `${siteUrl}/pedidos`;

  const assunto = `Atualização do seu pedido - PrintForge 3D`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 30px; borderRadius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #2dd4bf; margin: 0; font-size: 24px;">PrintForge 3D</h1>
        <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Atualização do Status do seu Pedido</p>
      </div>

      <div style="background-color: #1e293b; border: 1px solid #334155; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
        <p style="margin-top: 0; font-size: 16px;">Olá, <strong>${clienteNome || "Cliente"}</strong>!</p>
        <p style="color: #cbd5e1; font-size: 14px;">O status do seu pedido para a peça <strong>"${pecaNome}"</strong> foi atualizado para:</p>

        <div style="background-color: #0f172a; border: 1px solid #2dd4bf; padding: 16px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <span style="font-size: 18px; font-weight: bold; color: #2dd4bf;">${statusFormatado}</span>
        </div>

        <p style="color: #94a3b8; font-size: 13px;">ID do Pedido: <code>#${pedidoId.slice(-6)}</code></p>
      </div>

      <div style="text-align: center;">
        <a href="${pedidosUrl}" style="background-color: #2dd4bf; color: #0f172a; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block;">
          Ver Meus Pedidos no PrintForge 3D
        </a>
      </div>

      <div style="margin-top: 32px; border-top: 1px solid #334155; pt: 16px; text-align: center; color: #64748b; font-size: 12px;">
        PrintForge 3D — Gestão Inteligente de Impressão 3D
      </div>
    </div>
  `;

  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "PrintForge 3D <notificacoes@printforge3d.com>",
          to: [toEmail],
          subject: assunto,
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn("⚠️ [Resend Error]:", errorText);
      } else {
        console.log(`📧 [E-mail enviado via Resend] para: ${toEmail} | Novo Status: ${novoStatus}`);
      }
    } catch (err: any) {
      console.warn("⚠️ [Falha ao enviar e-mail via Resend]:", err?.message || err);
    }
  } else {
    console.log(`
=====================================================
📧 [NOTIFICAÇÃO DE E-MAIL SIMULADA - (RESEND_API_KEY não definida)]
Para: ${toEmail}
Assunto: ${assunto}
Peça: ${pecaNome}
Novo Status: ${statusFormatado}
Link: ${pedidosUrl}
=====================================================
    `);
  }
}
