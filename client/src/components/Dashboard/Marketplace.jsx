import { useState, useEffect } from 'react';
import axios from 'axios';
import EventCard from './EventCard';
import SwapModal from './SwapModal';

export default function Marketplace() {
  const [slots, setSlots] = useState([]);
  const [mySlots, setMySlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showSwapModal, setShowSwapModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [slotsRes, myEventsRes] = await Promise.all([
        axios.get('http://localhost:3000/api/swap/swappable-slots'),
        axios.get('http://localhost:3000/api/events/my-events'),
      ]);

      setSlots(slotsRes.data.slots);
      setMySlots(
        myEventsRes.data.events.filter((e) => e.status === 'SWAPPABLE')
      );
    } catch (err) {
      setError('Failed to load marketplace');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSwap = (slot) => {
    if (mySlots.length === 0) {
      alert('You need to have at least one swappable slot to request a swap');
      return;
    }
    setSelectedSlot(slot);
    setShowSwapModal(true);
  };

  const handleSwapSuccess = () => {
    setShowSwapModal(false);
    setSelectedSlot(null);
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Marketplace</h2>
        <p className="text-gray-600 mt-1">
          Browse and request swaps with other users' available slots
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {mySlots.length === 0 && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          You don't have any swappable slots. Create an event and mark it as swappable to
          request swaps.
        </div>
      )}

      {slots.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No swappable slots available at the moment</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {slots.map((slot) => (
            <div key={slot._id}>
              <EventCard event={slot} isOwner={false} />
              <button
                onClick={() => handleRequestSwap(slot)}
                disabled={mySlots.length === 0}
                className="mt-2 w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Request Swap
              </button>
            </div>
          ))}
        </div>
      )}

      {showSwapModal && (
        <SwapModal
          theirSlot={selectedSlot}
          mySlots={mySlots}
          onClose={() => setShowSwapModal(false)}
          onSuccess={handleSwapSuccess}
        />
      )}
    </div>
  );
}
