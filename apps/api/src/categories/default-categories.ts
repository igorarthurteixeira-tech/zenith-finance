import { TransactionType } from '@zenith/shared';
import { PrismaService } from '../prisma/prisma.service';

interface DefaultCategory {
  name: string;
  type: TransactionType;
}

export const DEFAULT_CATEGORIES_BY_ACCOUNT_TYPE: Record<
  string,
  DefaultCategory[]
> = {
  PESSOAL: [
    { name: 'Moradia', type: TransactionType.EXPENSE },
    { name: 'Alimentação', type: TransactionType.EXPENSE },
    { name: 'Transporte', type: TransactionType.EXPENSE },
    { name: 'Saúde', type: TransactionType.EXPENSE },
    { name: 'Educação', type: TransactionType.EXPENSE },
    { name: 'Lazer', type: TransactionType.EXPENSE },
    { name: 'Compras', type: TransactionType.EXPENSE },
    { name: 'Assinaturas', type: TransactionType.EXPENSE },
    { name: 'Outros', type: TransactionType.EXPENSE },
    { name: 'Salário', type: TransactionType.INCOME },
    { name: 'Freelance', type: TransactionType.INCOME },
    { name: 'Investimentos', type: TransactionType.INCOME },
    { name: 'Outros', type: TransactionType.INCOME },
  ],
  EMPRESARIAL: [
    { name: 'Fornecedores', type: TransactionType.EXPENSE },
    { name: 'Folha de Pagamento', type: TransactionType.EXPENSE },
    { name: 'Impostos', type: TransactionType.EXPENSE },
    { name: 'Marketing', type: TransactionType.EXPENSE },
    { name: 'Infraestrutura', type: TransactionType.EXPENSE },
    { name: 'Outros', type: TransactionType.EXPENSE },
    { name: 'Vendas', type: TransactionType.INCOME },
    { name: 'Serviços', type: TransactionType.INCOME },
    { name: 'Outros', type: TransactionType.INCOME },
  ],
};

export async function seedDefaultCategories(
  prisma: PrismaService,
  accountId: string,
  accountType: string,
): Promise<void> {
  const categories = DEFAULT_CATEGORIES_BY_ACCOUNT_TYPE[accountType] ?? [];
  if (categories.length === 0) return;

  await prisma.category.createMany({
    data: categories.map((category) => ({ ...category, accountId })),
    skipDuplicates: true,
  });
}
