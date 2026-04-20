const CSV_TEMPLATE = `data,cliente,contrato,receita,horas,custo_hora,chamados,urgencias,retrabalhos,descontos,atraso_pagamento_dias,observacoes
2026-04-01,Condominio Alfa,Suporte mensal,2500,18,65,12,3,2,0,8,Muitas urgencias fora do combinado
2026-04-02,Clinica Beta,Contrato recorrente,4200,16,65,5,0,1,0,0,Cliente organizado
2026-04-03,Loja Gama,Manutencao,1800,22,65,15,5,4,200,20,Escopo sempre muda
`;

export async function GET() {
  return new Response(CSV_TEMPLATE, {
    headers: {
      "Content-Disposition": 'attachment; filename="lucro-oculto-modelo.csv"',
      "Content-Type": "text/csv; charset=utf-8"
    }
  });
}
