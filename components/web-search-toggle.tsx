"use client"

import { Button } from "@/components/ui/button"
import { Search, SearchX } from "lucide-react"
import { motion } from "framer-motion"

interface WebSearchToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
}

export function WebSearchToggle({ enabled, onToggle }: WebSearchToggleProps) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        variant={enabled ? "default" : "outline"}
        size="sm"
        onClick={() => onToggle(!enabled)}
        className={`gap-2 transition-all duration-200 ${
          enabled ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-muted"
        }`}
      >
        {enabled ? <Search className="w-4 h-4" /> : <SearchX className="w-4 h-4" />}
        <span className="hidden sm:inline">{enabled ? "Web Search ON" : "Web Search OFF"}</span>
        <span className="sm:hidden">{enabled ? "ON" : "OFF"}</span>
      </Button>
    </motion.div>
  )
}
