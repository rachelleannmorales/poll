export interface Vote {
    id: string
    optionIndex: number
    voterHash?: string
  }
  
export interface VoteTally {
  option: string,
  value: number
}

  export interface Poll {
    id: string
    question: string
    options: string[]
    expiresAt?: string
    votes: Vote[]
    tally?: VoteTally[]
  }
  