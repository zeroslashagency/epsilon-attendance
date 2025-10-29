import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Admin Page
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Admin utilities have been removed. Use Supabase dashboard for user management.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
