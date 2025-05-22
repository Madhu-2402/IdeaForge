import { Badge } from "@/components/ui/badge"

interface SimilarityBadgeProps {
  similarityScore?: number
  size?: "sm" | "md" | "lg"
}

export default function SimilarityBadge({ similarityScore, size = "md" }: SimilarityBadgeProps) {
  if (similarityScore === undefined) {
    return (
      <Badge variant="outline" className="bg-gray-100">
        Not checked
      </Badge>
    )
  }

  // Determine color based on similarity score
  let color = ""
  if (similarityScore < 30) {
    color = "bg-green-100 text-green-800 border-green-300"
  } else if (similarityScore < 70) {
    color = "bg-yellow-100 text-yellow-800 border-yellow-300"
  } else {
    color = "bg-red-100 text-red-800 border-red-300"
  }

  // Determine size
  let sizeClass = ""
  if (size === "sm") {
    sizeClass = "text-xs py-0.5 px-2"
  } else if (size === "lg") {
    sizeClass = "text-sm py-1 px-3"
  } else {
    sizeClass = "text-xs py-0.5 px-2.5"
  }

  return (
    <Badge variant="outline" className={`${color} ${sizeClass}`}>
      {similarityScore}% Similar
    </Badge>
  )
}
