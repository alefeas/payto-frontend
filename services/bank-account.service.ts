import apiClient from '@/lib/api-client';

export interface BankAccount {
  id: string;
  bankName: string;
  accountType: 'corriente' | 'caja_ahorro' | 'cuenta_sueldo';
  cbu: string;
  alias?: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface CreateBankAccountData {
  bank_name: string;
  account_type: 'corriente' | 'caja_ahorro' | 'cuenta_sueldo';
  cbu: string;
  alias?: string;
  is_primary?: boolean;
}

export const bankAccountService = {
  async getBankAccounts(companyId: string): Promise<BankAccount[]> {
    const response = await apiClient.get<{ success: boolean; data: BankAccount[] }>(`/companies/${companyId}/bank-accounts`);
    return response.data.data;
  },

  async createBankAccount(companyId: string, data: CreateBankAccountData): Promise<BankAccount> {
    const response = await apiClient.post<{ success: boolean; data: BankAccount }>(`/companies/${companyId}/bank-accounts`, data);
    return response.data.data;
  },

  async updateBankAccount(companyId: string, accountId: string, data: CreateBankAccountData): Promise<BankAccount> {
    const response = await apiClient.put<{ success: boolean; data: BankAccount }>(`/companies/${companyId}/bank-accounts/${accountId}`, data);
    return response.data.data;
  },

  async deleteBankAccount(companyId: string, accountId: string): Promise<void> {
    await apiClient.delete(`/companies/${companyId}/bank-accounts/${accountId}`);
  },
};
