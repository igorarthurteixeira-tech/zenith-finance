export function formatDateOnly(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}

// Transações antigas foram salvas sem horário real (meia-noite UTC, um
// artefato do formulário anterior que só pedia a data) — para essas,
// mostramos só a data (sem conversão de fuso, evitando o bug do dia
// deslocado). Transações novas têm horário de verdade escolhido pelo
// usuário, então convertemos para o fuso local normalmente.
export function formatDateTime(isoDate: string): string {
  const date = new Date(isoDate);
  const isMidnightUtc =
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0;

  if (isMidnightUtc) {
    return formatDateOnly(isoDate);
  }

  const datePart = date.toLocaleDateString('pt-BR');
  const timePart = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${datePart} ${timePart}`;
}
