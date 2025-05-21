'use client'

import { useState, ChangeEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { TextField, Button, Paper, Typography } from '@mui/material'

interface CreatePollRequest {
  question: string
  options: string[]
}

export default function CreatePollPage() {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState<string[]>(['', ''])
  const queryClient = useQueryClient()

  const mutation = useMutation<void, Error, CreatePollRequest>({
    mutationFn: (data) => axios.post('/poll', data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['polls'] as any)
      setQuestion('')
      setOptions(['', ''])
    },
  }) as any

  const updateOption = (index: number, value: string) => {
    setOptions((prev) => {
      const copy = [...prev]
      copy[index] = value
      return copy
    })
  }

  const addOption = () => {
    setOptions((prev) => [...prev, ''])
  }

  const handleSubmit = () => {
    const filteredOptions = options.filter((opt) => opt.trim().length > 0)
    if (!question.trim() || filteredOptions.length < 2) {
      alert('Please provide a question and at least 2 options')
      return
    }
    mutation.mutate({ question, options: filteredOptions })
  }

  return (
    <Paper className="max-w-xl mx-auto mt-10 p-6 space-y-4">
      <Typography variant="h5">Create Poll</Typography>
      <TextField
        fullWidth
        label="Question"
        value={question}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setQuestion(e.target.value)}
      />
      {options.map((opt, idx) => (
        <TextField
          key={idx}
          fullWidth
          label={`Option ${idx + 1}`}
          value={opt}
          onChange={(e: ChangeEvent<HTMLInputElement>) => updateOption(idx, e.target.value)}
          className="mb-2"
        />
      ))}
      <Button onClick={addOption}>Add Option</Button>
      <Button variant="contained" onClick={handleSubmit} disabled={mutation.isLoading}>
        {mutation.isLoading ? 'Creating...' : 'Create Poll'}
      </Button>
    </Paper>
  )
}
