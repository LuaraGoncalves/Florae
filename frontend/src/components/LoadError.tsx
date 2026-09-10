import { RefreshCcw } from "lucide-react";
import { Button } from "./ui/button";

export function LoadError({ message }: { message: string }) {
  return <div role="alert" className="my-6 space-y-3">
    <p className="text-red-700">{message}</p>
    <Button variant="dark" onClick={() => window.location.reload()}><RefreshCcw className="h-4 w-4" />Tentar novamente</Button>
  </div>;
}
