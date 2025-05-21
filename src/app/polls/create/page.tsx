'use client'

import { useState, ChangeEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { TextField, Button, Paper, Typography, Box, IconButton } from '@mui/material'
import { useRouter } from 'next/navigation'

interface CreatePollRequest {
  question: string
  options: string[]
  expiresAt?: string
}

export default function CreatePollPage() {
  const router = useRouter()
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState<string[]>(['', ''])
  const [expiryDate, setExpiryDate] = useState('')
  const [expiryTime, setExpiryTime] = useState('')
  const queryClient = useQueryClient()

  const mutation = useMutation<void, Error, CreatePollRequest>({
    mutationFn: (data) => axios.post('/poll', data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['polls'] as any)
      setQuestion('')
      setOptions(['', ''])
      setExpiryDate('')
      setExpiryTime('')
      router.push('/polls')
    },
  }) as any

  const updateOption = (index: number, value: string) => {
    setOptions((prev) => {
      const copy = [...prev]
      copy[index] = value
      return copy
    })
  }

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index))
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

    const data: CreatePollRequest = {
      question,
      options: filteredOptions,
    }

    if (expiryDate && expiryTime) {
      const expiryDateTime = new Date(`${expiryDate}T${expiryTime}`)
      data.expiresAt = expiryDateTime.toISOString()
    }

    mutation.mutate(data)
  }

  return (
    <Paper className="max-w-xl mx-auto mt-10 p-6 space-y-4">
      <Typography variant="h5" className="font-bold text-gray-800">Create Poll</Typography>
      
      <Box className="space-y-4">
        <TextField
          fullWidth
          label="Question"
          value={question}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setQuestion(e.target.value)}
          variant="outlined"
          className="bg-white"
        />

        <Box className="space-y-2">
          <Typography variant="subtitle1" className="font-medium text-gray-700">Options</Typography>
          {options.map((opt, idx) => (
            <Box key={idx} className="flex gap-2 items-center">
              <TextField
                fullWidth
                label={`Option ${idx + 1}`}
                value={opt}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateOption(idx, e.target.value)}
                variant="outlined"
                className="bg-white"
              />
              {options.length > 2 && (
                <IconButton 
                  onClick={() => removeOption(idx)}
                  className="text-red-500 hover:text-red-700"
                >
                  X
                </IconButton>
              )}
            </Box>
          ))}
          <Button 
            startIcon={"+"}
            onClick={addOption}
            className="text-blue-500 hover:text-blue-700"
          >
            Add Option
          </Button>
        </Box>

        <Box className="space-y-2">
          <Typography variant="subtitle1" className="font-medium text-gray-700">Expiry (Optional)</Typography>
          <Box className="flex gap-4">
            <TextField
              type="date"
              label="Date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              variant="outlined"
              className="flex-1 bg-white"
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
            />
            <TextField
              type="time"
              label="Time"
              value={expiryTime}
              onChange={(e) => setExpiryTime(e.target.value)}
              variant="outlined"
              className="flex-1 bg-white"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Box>

        <Button 
          variant="contained" 
          onClick={handleSubmit} 
          disabled={mutation.isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2"
        >
          {mutation.isLoading ? 'Creating...' : 'Create Poll'}
        </Button>
      </Box>
    </Paper>
  )
}
