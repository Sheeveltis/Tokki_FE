import { SafeArea } from 'app/provider/safe-area'
import { NavigationProvider } from './navigation'
import { QueryProvider } from './query/query-client'

export function Provider({ children }: { children: React.ReactElement }) {
  return (
    <SafeArea>
      <QueryProvider>
        <NavigationProvider>{children}</NavigationProvider>
      </QueryProvider>
    </SafeArea>
  )
}
