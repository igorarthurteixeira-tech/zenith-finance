import { TransactionType } from '@zenith/shared';
import { useAccounts } from '../context/AccountContext';
import { useCategories } from '../hooks/useCategories';
import { CategoryForm } from '../components/categories/CategoryForm';
import { Spinner } from '../components/ui/Spinner';
import { useAsyncSet } from '../hooks/useAsyncAction';

export function CategoriesPage() {
  const { activeAccount } = useAccounts();
  const { categories, isLoading, create, remove, seedDefaults, isSeedingDefaults } =
    useCategories(activeAccount?.id ?? null);
  const { pendingIds: removingIds, run: runRemove } = useAsyncSet();

  if (!activeAccount) return <p>Nenhuma conta selecionada.</p>;

  return (
    <div>
      <div className="page-header">
        <h2>Categorias</h2>
        <p className="page-subtitle">{activeAccount.name}</p>
      </div>

      <div className="card">
        <CategoryForm onSubmit={(name, type) => create({ name, type })} />
      </div>

      <div className="card">
        {isLoading ? (
          <p className="muted">Carregando...</p>
        ) : categories.length === 0 ? (
          <div className="empty-state">
            <p className="muted">Nenhuma categoria ainda.</p>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => seedDefaults()}
              disabled={isSeedingDefaults}
              aria-busy={isSeedingDefaults}
            >
              {isSeedingDefaults ? <><Spinner /> Criando…</> : 'Criar categorias padrão'}
            </button>
          </div>
        ) : (
          <ul className="category-list">
            {categories.map((category) => (
              <li key={category.id}>
                <span className="category-name">{category.name}</span>
                <span
                  className={
                    'badge ' +
                    (category.type === TransactionType.EXPENSE ? 'badge-negative' : 'badge-positive')
                  }
                >
                  {category.type === TransactionType.EXPENSE ? 'Despesa' : 'Receita'}
                </span>
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => runRemove(category.id, () => remove(category.id))}
                  disabled={removingIds.has(category.id)}
                  aria-busy={removingIds.has(category.id)}
                  aria-label="Remover"
                >
                  {removingIds.has(category.id) ? <Spinner /> : '×'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
