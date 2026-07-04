export enum AccountType {
  PESSOAL = 'PESSOAL',
  EMPRESARIAL = 'EMPRESARIAL',
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum InvestmentType {
  CDB = 'CDB',
  LCI = 'LCI',
  LCA = 'LCA',
  TESOURO_DIRETO = 'TESOURO_DIRETO',
  ACOES = 'ACOES',
  FII = 'FII',
  CRIPTO = 'CRIPTO',
  OUTRO = 'OUTRO',
}

export enum InvestmentLiquidity {
  D0 = 'D0',
  D1 = 'D1',
  D2 = 'D2',
  D30 = 'D30',
  D60 = 'D60',
  D90 = 'D90',
  NO_VENCIMENTO = 'NO_VENCIMENTO',
}

export enum CdbModalidade {
  NORMAL = 'NORMAL',
  LIMITE_GARANTIDO = 'LIMITE_GARANTIDO',
}
