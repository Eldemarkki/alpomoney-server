export interface DatabaseAdapter {
  signUp(email: string, password: string): Promise<{ id: string, username: string } | null>,
  login(email: string, password: string): Promise<{ id: string, username: string } | null>,
  reset(): Promise<void>
}
