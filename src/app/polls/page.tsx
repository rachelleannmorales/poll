'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { Paper, Typography, Button } from '@mui/material'
import { Poll } from '@/types/types'
import { getAuthToken } from '@/lib/auth'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const fetchPolls = async (): Promise<Poll[]> => {
  const res = await axios.get('/poll')
  return res.data
}

export default function PollListPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  useEffect(() => {
    getAuthToken()
  }, [])

  const { data: polls = [], isLoading, error } = useQuery<Poll[], Error>({
    queryKey: ['polls'],
    queryFn: fetchPolls,
  })

  const voteMutation = useMutation<
    void,
    Error,
    { pollId: string; optionIndex: number }
  >({
    mutationFn: async ({ pollId, optionIndex }) => {
      const token = await getAuthToken()
      return axios.post(`/poll/${pollId}/vote`, 
        { optionIndex },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      ).then(() => 
        router.push(`polls/${pollId}`)
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] })
    },
    onError: (error: any) => {
      alert(error.response.data.message)
    }
  })

  if (isLoading) return <div className="text-center mt-10">Loading polls...</div>
  if (error) return <div className="text-center mt-10 text-red-500">Error: {error.message}</div>

  return (
    <Paper className="max-w-xl mx-auto mt-10 p-6 space-y-6">
      <Typography variant="h5" className="mb-4">
        Polls - Vote here
      </Typography>
      <Link href={'/polls/create'} className='link my-5 py-[10px]'>
          + Create Poll
        </Link>
      
      {polls.map((poll) => (
        <div key={poll.id} className="border rounded p-4 space-y-3 mt-5">
          <Typography variant="h6">{poll.question}</Typography>

          {poll.options.map((opt, idx) => {
            return (
              <div
                key={idx}
                className="flex justify-between items-center border p-2 rounded"
              >
                <span>{opt}</span>
                <div className="flex items-center gap-4">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => voteMutation.mutate({ pollId: poll.id, optionIndex: idx })}
                    disabled={voteMutation.isPending}
                  >
                    Vote
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </Paper>
  )
}
