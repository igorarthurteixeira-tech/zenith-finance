import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { AccountDto, CreateAccountInput } from '@zenith/shared';
import { accountsApi } from '../api/accounts';
import { useAuth } from './AuthContext';

interface AccountContextValue {
  accounts: AccountDto[];
  activeAccount: AccountDto | null;
  isLoading: boolean;
  setActiveAccountId: (id: string) => void;
  createAccount: (input: CreateAccountInput) => Promise<void>;
  refresh: () => Promise<void>;
}

const AccountContext = createContext<AccountContextValue | undefined>(
  undefined,
);

export function AccountProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<AccountDto[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refresh() {
    const list = await accountsApi.list();
    setAccounts(list);
    setActiveAccountId((current) =>
      current && list.some((a) => a.id === current) ? current : (list[0]?.id ?? null),
    );
  }

  useEffect(() => {
    if (!user) {
      setAccounts([]);
      setActiveAccountId(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    refresh().finally(() => setIsLoading(false));
  }, [user]);

  async function createAccount(input: CreateAccountInput) {
    const account = await accountsApi.create(input);
    setAccounts((prev) => [...prev, account]);
    setActiveAccountId(account.id);
  }

  const activeAccount =
    accounts.find((a) => a.id === activeAccountId) ?? null;

  return (
    <AccountContext.Provider
      value={{
        accounts,
        activeAccount,
        isLoading,
        setActiveAccountId,
        createAccount,
        refresh,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccounts() {
  const context = useContext(AccountContext);
  if (!context)
    throw new Error('useAccounts deve ser usado dentro de AccountProvider');
  return context;
}
