/**
 * Configuração e gerador de links para envio de notificações via WhatsApp aos clientes.
 */

export const MENSAGENS_WHATSAPP_STATUS: Record<string, string> = {
  pendente: "Olá {clienteNome}, recebemos seu pedido da peça '{pecaNome}' e estamos preparando o início da produção! 🚀",
  em_impressao: "Olá {clienteNome}, sua peça '{pecaNome}' já está na impressora 3D! 🖨️",
  pintando: "Olá {clienteNome}, sua peça '{pecaNome}' está na fase de pintura e acabamento! 🎨",
  pronto: "Olá {clienteNome}, sua peça '{pecaNome}' está pronta! 🎉 Podemos combinar a entrega ou retirada.",
  enviado: "Olá {clienteNome}, sua peça '{pecaNome}' foi enviada! 📦",
  entregue: "Olá {clienteNome}, muito obrigado por encomendar com a PrintForge 3D! Esperamos que tenha gostado de '{pecaNome}'. ⭐",
};

/**
 * Gera um link wa.me pronto para abrir a conversa no WhatsApp do cliente
 */
export function gerarLinkWhatsApp(
  clienteContato: string | null | undefined,
  clienteNome: string,
  pecaNome: string,
  status: string
): string | null {
  if (!clienteContato) return null;

  const digitsOnly = clienteContato.replace(/\D/g, "");
  if (!digitsOnly || digitsOnly.length < 8) return null;

  // Add Brazil DDI (55) if user omitted it
  const phone = digitsOnly.length <= 11 ? `55${digitsOnly}` : digitsOnly;

  const template = MENSAGENS_WHATSAPP_STATUS[status] || MENSAGENS_WHATSAPP_STATUS.pendente;
  const mensagem = template.replace("{clienteNome}", clienteNome).replace("{pecaNome}", pecaNome);

  return `https://wa.me/${phone}?text=${encodeURIComponent(mensagem)}`;
}
