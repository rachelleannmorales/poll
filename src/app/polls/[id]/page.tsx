'use client'

import { usePollSocket } from '@/hooks/usePollSocket';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { Poll } from '@/types/types';

type Tally = Record<string, number>;

const fetchPoll = async (id: string): Promise<Poll> => {
  const res = await axios.get(`/poll/${id}`);
  return res.data;
};

export default function PollTallyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const pollId = params.id as string;

  const { data: poll, isLoading, error: pollError } = useQuery({
    queryKey: ['poll', pollId],
    queryFn: () => fetchPoll(pollId),
  });

  const { tallyUpdates, isConnected, error: socketError } = usePollSocket(pollId);

  const [tally, setTally] = useState<Tally>({});

  function updateTally(tally: Tally, { optionIndex, increment }: any) {
    if (!poll?.tally) return tally;
    
    const option = poll.tally[optionIndex]?.option;
    if (!option) return tally;

    const updatedTally = { ...tally };
    updatedTally[option] = (updatedTally[option] || 0) + increment;
    return updatedTally;
  }

  useEffect(() => {
    if (poll?.tally) {
      const initialTally = poll.tally.reduce((acc, { option, value }) => {
        acc[option] = value;
        return acc;
      }, {} as Tally);
      setTally(initialTally);
    }
  }, [poll]);

  useEffect(() => {
    if (!tallyUpdates.length) return;
    const latestUpdate = tallyUpdates[0];
    const updatedTally = updateTally(tally, latestUpdate);
    setTally(updatedTally);
  }, [tallyUpdates, poll?.tally]);

  if (isLoading) return <div className="text-center mt-10">Loading poll...</div>;
  if (!poll) return <div className="text-center mt-10">Poll not found</div>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{poll.question}</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {isConnected ? 'Live updates' : 'Disconnected'}
          </span>
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
      </div>
      <ul className="space-y-2">
        {Object.entries(tally).map(([option, count]) => (
          <li key={option} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-black">
            <span className="font-medium">{option}</span>
            <span className="text-lg font-bold">{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
