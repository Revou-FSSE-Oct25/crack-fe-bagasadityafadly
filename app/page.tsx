import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">MyApp is Running!</h1>
      <p className="text-muted-foreground mb-8">
        Frontend setup complete. Backend setup next.
      </p>
      <Button>Click Me — shadcn/ui Works!</Button>
    </main>
  )
}