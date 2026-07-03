import { TransactionType } from '@zenith/shared';
import { useAccounts } from '../context/AccountContext';
import { useCategories } from '../hooks/useCategories';
import { CategoryForm } from '../components/categories/CategoryForm';

export function CategoriesPage() {
  const { activeAccount } = useAccounts();
  const { categories, isLoading, create, remove } = useCategories(
    activeAccount?.id ?? null,
  );

  if (!activeAccount) return <p>Nenhuma conta selecionada.</p>;

  return (
    <div>
      <h2>Categorias — {activeAccount.name}</h2>
      <CategoryForm onSubmit={(name, type) => create({ name, type })} />

      {isLoading ? (
        <p>Carregando...</p>
      ) : (
        <ul className="category-list">
          {categories.map((category) => (
            <li key={category.id}>
              <span>{category.name}</span>
              <span>
                {category.type === TransactionType.EXPENSE ? 'Despesa' : 'Receita'}
              </span>
              <button type="button" onClick={() => remove(category.id)}>
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
